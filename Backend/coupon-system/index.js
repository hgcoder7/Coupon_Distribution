require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cookieParser());

// app.use(cors());
app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected');
});

// Middleware for abuse prevention
const checkAbuse = async (req, res, next) => {
    const ip = req.ip;
    const session = req.cookies.session_id || Math.random().toString(36);
    res.cookie('session_id', session, { httpOnly: true });

    const [rows] = await db.promise().query(
        "SELECT * FROM claims WHERE ip_address = ? OR session_id = ? AND claimed_at > NOW() - INTERVAL 10 SECOND",
        [ip, session]
    );

    if (rows.length > 0) return res.status(429).json({ message: "You have to wait before claiming again." });

    req.session = session;
    next();
};

const verifyAdmin = (req, res, next) => {
    const token = req.cookies.token; // ✅ Get token from cookies

    if (!token) return res.status(403).json({ message: "Unauthorized. Please log in again." });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token. Please log in again." });

        req.admin = decoded.user;
        next();
    });
};

// **Claim Coupon**
app.get('/claim-coupon', checkAbuse, async (req, res) => {
    const ip = req.ip;
    const session = req.session;

    const [coupons] = await db.promise().query("SELECT * FROM coupons WHERE is_claimed = FALSE ORDER BY id LIMIT 1");

    if (coupons.length === 0) return res.status(400).json({ message: "No coupons available" });

    const coupon = coupons[0];

    await db.promise().query("UPDATE coupons SET is_claimed = TRUE WHERE id = ?", [coupon.id]);
    await db.promise().query("INSERT INTO claims (coupon_id, ip_address, session_id) VALUES (?, ?, ?)", [coupon.id, ip, session]);

    res.json({ message: "Coupon claimed", coupon: coupon.code });
});

// **Admin Login**
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin123") {
        const token = jwt.sign({ user: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, {
            httpOnly: true,  // Prevents JavaScript access to the token
            secure: true,   // ❗ Set `true` in production with HTTPS
            sameSite: "Lax"  // Prevents CSRF attacks
        }).json({ message: "Login successful" });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

app.post('/admin/logout', (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false, // Set `true` in production with HTTPS
        sameSite: "Lax"
    });

    res.json({ message: "Logged out successfully" });
});


// **View Claimed Coupons (Admin)**
app.get('/admin/claims', verifyAdmin, async (req, res) => {
    try {
        const [claims] = await db.promise().query(`
            SELECT claims.id, coupons.code, claims.ip_address, claims.session_id, claims.claimed_at 
            FROM claims 
            JOIN coupons ON claims.coupon_id = coupons.id
        `);
        res.json(claims);
    } catch (error) {
        console.error("Error fetching claims:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// **View Coupons (Admin)**
app.get('/admin/coupons', async (req, res) => {
    const [coupons] = await db.promise().query("SELECT * FROM coupons");
    res.json(coupons);
});

// **Add Coupon (Admin)**
app.post('/admin/add-coupon', async (req, res) => {
    const { code } = req.body;
    await db.promise().query("INSERT INTO coupons (code) VALUES (?)", [code]);
    res.json({ message: "Coupon added successfully" });
});

// **Toggle Coupon Availability (Admin)**
app.patch('/admin/toggle-coupon/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const [coupon] = await db.promise().query("SELECT is_claimed FROM coupons WHERE id = ?", [id]);

    if (coupon.length === 0) return res.status(404).json({ message: "Coupon not found" });

    const newStatus = !coupon[0].is_claimed;
    await db.promise().query("UPDATE coupons SET is_claimed = ? WHERE id = ?", [newStatus, id]);

    res.json({ message: `Coupon ${newStatus ? "disabled" : "enabled"}` });
});

// **Server Start**
app.listen(PORT, () => console.log( `Server running on port ${PORT}`));
