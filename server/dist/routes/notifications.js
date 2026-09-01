"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_1 = __importDefault(require("../models/Notification"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// @route   GET api/notifications
// @desc    Get all notifications for a user
// @access  Private
router.get('/', auth_1.default, async (req, res) => {
    try {
        const notifications = await Notification_1.default.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', auth_1.default, async (req, res) => {
    try {
        const notification = await Notification_1.default.findById(req.params.id);
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        // Check user
        if (notification.user.toString() !== req.userId) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.status(500).send('Server error');
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map