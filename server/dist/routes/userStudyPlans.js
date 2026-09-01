"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserStudyPlan_1 = __importDefault(require("../models/UserStudyPlan"));
const StudyPlan_1 = __importDefault(require("../models/StudyPlan"));
const StudyResponse_1 = __importDefault(require("../models/StudyResponse"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// @route   POST api/user-study-plans/enroll
// @desc    Enroll user in a study plan
// @access  Private
router.post('/enroll', auth_1.default, async (req, res) => {
    const { studyPlanId } = req.body;
    if (!studyPlanId) {
        res.status(400).json({ message: 'Study Plan ID is required' });
        return;
    }
    try {
        // Check if already enrolled
        let existing = await UserStudyPlan_1.default.findOne({ userId: req.userId, studyPlanId });
        if (existing) {
            if (existing.status === 'canceled') {
                existing.status = 'active';
                await existing.save();
                await existing.populate('studyPlanId');
                res.status(200).json(existing);
                return;
            }
            res.status(400).json({ message: 'Already enrolled in this plan' });
            return;
        }
        // Check if plan exists
        const plan = await StudyPlan_1.default.findById(studyPlanId);
        if (!plan) {
            res.status(404).json({ message: 'Study plan not found' });
            return;
        }
        const newUserStudyPlan = new UserStudyPlan_1.default({
            userId: req.userId,
            studyPlanId,
            status: 'active',
            completedGroups: [],
        });
        const userStudyPlan = await newUserStudyPlan.save();
        await userStudyPlan.populate('studyPlanId');
        res.status(201).json(userStudyPlan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   GET api/user-study-plans
// @desc    Get all user's study plans
// @access  Private
router.get('/', auth_1.default, async (req, res) => {
    try {
        const plans = await UserStudyPlan_1.default.find({ userId: req.userId }).populate('studyPlanId');
        res.json(plans);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   PATCH api/user-study-plans/:id/status
// @desc    Update status (active/canceled)
// @access  Private
router.patch('/:id/status', auth_1.default, async (req, res) => {
    const { status } = req.body;
    if (!['active', 'canceled'].includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
    }
    try {
        const userStudyPlan = await UserStudyPlan_1.default.findOne({ _id: req.params.id, userId: req.userId });
        if (!userStudyPlan) {
            res.status(404).json({ message: 'User study plan not found' });
            return;
        }
        userStudyPlan.status = status;
        await userStudyPlan.save();
        await userStudyPlan.populate('studyPlanId');
        res.json(userStudyPlan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   PATCH api/user-study-plans/:id/progress
// @desc    Update completed groups
// @access  Private
router.patch('/:id/progress', auth_1.default, async (req, res) => {
    const { completedGroups } = req.body; // Array of group IDs
    if (!Array.isArray(completedGroups)) {
        res.status(400).json({ message: 'completedGroups must be an array' });
        return;
    }
    try {
        const userStudyPlan = await UserStudyPlan_1.default.findOne({ _id: req.params.id, userId: req.userId });
        if (!userStudyPlan) {
            res.status(404).json({ message: 'User study plan not found' });
            return;
        }
        userStudyPlan.completedGroups = completedGroups;
        // Check if fully completed
        const plan = await StudyPlan_1.default.findById(userStudyPlan.studyPlanId);
        if (plan) {
            const totalGroups = plan.books.reduce((acc, book) => acc + book.chapterGroups.length, 0);
            if (completedGroups.length >= totalGroups && totalGroups > 0) {
                userStudyPlan.status = 'completed';
            }
        }
        await userStudyPlan.save();
        res.json(userStudyPlan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   POST api/user-study-plans/reset/:studyPlanId
// @desc    Reset study plan progress
// @access  Private
router.post('/reset/:studyPlanId', auth_1.default, async (req, res) => {
    try {
        const userStudyPlan = await UserStudyPlan_1.default.findOne({ studyPlanId: req.params.studyPlanId, userId: req.userId });
        if (!userStudyPlan) {
            res.status(404).json({ message: 'User study plan not found' });
            return;
        }
        userStudyPlan.completedGroups = [];
        userStudyPlan.status = 'active';
        await userStudyPlan.save();
        // Optțional, ștergem și răspunsurile pentru a fi 100% resetat
        await StudyResponse_1.default.deleteMany({ userId: req.userId, studyPlanId: req.params.studyPlanId });
        await userStudyPlan.populate('studyPlanId');
        res.json(userStudyPlan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
exports.default = router;
//# sourceMappingURL=userStudyPlans.js.map