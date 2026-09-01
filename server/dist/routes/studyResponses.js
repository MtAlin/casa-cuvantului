"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StudyResponse_1 = require("../models/StudyResponse");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// Get study responses for a specific plan and book
router.get('/', auth_1.default, async (req, res) => {
    try {
        const { studyPlanId, bookName } = req.query;
        if (!studyPlanId || !bookName) {
            return res.status(400).json({ message: 'Missing studyPlanId or bookName' });
        }
        const responses = await StudyResponse_1.StudyResponse.find({
            user: req.userId,
            studyPlan: studyPlanId,
            bookName: bookName
        });
        res.json(responses);
    }
    catch (error) {
        console.error('Error fetching study responses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Save study responses for a chapter group
router.post('/', auth_1.default, async (req, res) => {
    try {
        const { studyPlanId, bookName, chapterGroupId, answers } = req.body;
        if (!studyPlanId || !bookName || !chapterGroupId || !answers) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        let studyResponse = await StudyResponse_1.StudyResponse.findOne({
            user: req.userId,
            studyPlan: studyPlanId,
            bookName: bookName,
            chapterGroupId: chapterGroupId
        });
        if (studyResponse) {
            studyResponse.answers = answers;
            await studyResponse.save();
        }
        else {
            studyResponse = new StudyResponse_1.StudyResponse({
                user: req.userId,
                studyPlan: studyPlanId,
                bookName: bookName,
                chapterGroupId: chapterGroupId,
                answers: answers
            });
            await studyResponse.save();
        }
        res.status(201).json(studyResponse);
    }
    catch (error) {
        console.error('Error saving study responses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=studyResponses.js.map