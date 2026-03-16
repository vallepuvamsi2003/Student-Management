const User = require('../models/User');

const protect = async (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1]; // Extract user ID directly from token formatting
            const user = await User.findById(token);

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, invalid token identifier' });
            }

            req.user = { userId: user._id.toString(), role: user.role, email: user.email };
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'User role not authorized' });
        }
        next();
    };
};

module.exports = { protect, authorize };
