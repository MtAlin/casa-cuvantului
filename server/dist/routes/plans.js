"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReadingPlan_1 = __importDefault(require("../models/ReadingPlan"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// @route   GET api/plans
// @desc    Get all public reading plans and custom plans created by the logged in user
// @access  Public (Optional auth)
router.get('/', async (req, res) => {
    try {
        const plans = await ReadingPlan_1.default.find({
            $or: [
                { isPublic: true },
                ...(req.userId ? [{ createdBy: req.userId }] : []),
            ],
        }).sort({ createdAt: -1 });
        res.json(plans);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   GET api/plans/:id
// @desc    Get a single plan by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const plan = await ReadingPlan_1.default.findById(req.params.id);
        if (!plan) {
            res.status(404).json({ message: 'Plan not found' });
            return;
        }
        res.json(plan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   POST api/plans
// @desc    Create a custom reading plan
// @access  Private
router.post('/', auth_1.default, async (req, res) => {
    const { title, description, type, readings, duration, coverImage, isPublic } = req.body;
    if (!title || !type || !duration) {
        res.status(400).json({ message: 'Title, type, and duration are required' });
        return;
    }
    try {
        const newPlan = new ReadingPlan_1.default({
            title,
            description,
            type,
            readings: readings || [],
            duration,
            coverImage: coverImage || '',
            createdBy: req.userId,
            isPublic: isPublic !== undefined ? isPublic : false,
        });
        const plan = await newPlan.save();
        res.status(201).json(plan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
exports.default = router;
//# sourceMappingURL=plans.js.map