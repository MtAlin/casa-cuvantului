"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const adminOnly = async (req, res, next) => {
    try {
        if (!req.userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const user = await User_1.default.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Access denied. Admin role required.' });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Server error checking admin role' });
    }
};
exports.default = adminOnly;
//# sourceMappingURL=adminOnly.js.map