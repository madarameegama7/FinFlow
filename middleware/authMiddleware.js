const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: "Authorization token required" });
    }

    try {
        const token = authorization.split(" ")[1]; // Extract token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);// Verify token

        console.log("Decoded Token:", decoded); // Debugging

        // Find user in DB and attach to request
        req.user = await User.findById(decoded).select("_id email role preferredCurrency");

        if (!req.user) {
            console.log("User Not Found in DB:", decoded); // Debugging
            return res.status(401).json({ message: "User not found" });
        }

        console.log("Authenticated User:", req.user);
        next();
    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = requireAuth;
