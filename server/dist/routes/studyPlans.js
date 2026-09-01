"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../middleware/auth"));
const adminOnly_1 = __importDefault(require("../middleware/adminOnly"));
const StudyPlan_1 = __importDefault(require("../models/StudyPlan"));
const router = (0, express_1.Router)();
// @route   GET /api/study-plans
// @desc    Get all study plans (admin gets all, members get active only)
// @access  Private
router.get('/', auth_1.default, async (req, res) => {
    try {
        const plans = await StudyPlan_1.default.find().sort({ createdAt: -1 });
        res.json(plans);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   GET /api/study-plans/active
// @desc    Get the currently active study plan
// @access  Private
router.get('/active', auth_1.default, async (req, res) => {
    try {
        const plan = await StudyPlan_1.default.findOne({ isActive: true });
        if (!plan) {
            res.json(null);
            return;
        }
        res.json(plan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   GET /api/study-plans/:id
// @desc    Get a single study plan by ID
// @access  Private
router.get('/:id', auth_1.default, async (req, res) => {
    try {
        const plan = await StudyPlan_1.default.findById(req.params.id);
        if (!plan) {
            res.status(404).json({ message: 'Study plan not found' });
            return;
        }
        res.json(plan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   POST /api/study-plans
// @desc    Create a new study plan
// @access  Admin only
router.post('/', auth_1.default, adminOnly_1.default, async (req, res) => {
    try {
        const { title, description, year, books, isActive } = req.body;
        const plan = new StudyPlan_1.default({
            title,
            description,
            year: year || new Date().getFullYear(),
            books: books || [],
            isActive: isActive || false,
            createdBy: req.userId,
        });
        await plan.save();
        res.status(201).json(plan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   PUT /api/study-plans/:id
// @desc    Update a study plan (including adding books, chapter groups, questions)
// @access  Admin only
router.put('/:id', auth_1.default, adminOnly_1.default, async (req, res) => {
    try {
        const { title, description, year, books, isActive } = req.body;
        // If setting this plan as active, deactivate all others
        if (isActive) {
            await StudyPlan_1.default.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
        }
        const plan = await StudyPlan_1.default.findByIdAndUpdate(req.params.id, { title, description, year, books, isActive }, { new: true, runValidators: true });
        if (!plan) {
            res.status(404).json({ message: 'Study plan not found' });
            return;
        }
        res.json(plan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   DELETE /api/study-plans/:id
// @desc    Delete a study plan
// @access  Admin only
router.delete('/:id', auth_1.default, adminOnly_1.default, async (req, res) => {
    try {
        const plan = await StudyPlan_1.default.findByIdAndDelete(req.params.id);
        if (!plan) {
            res.status(404).json({ message: 'Study plan not found' });
            return;
        }
        res.json({ message: 'Study plan deleted' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=studyPlans.js.map