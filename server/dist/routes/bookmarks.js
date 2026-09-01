"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Bookmark_1 = __importDefault(require("../models/Bookmark"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// @route   GET api/bookmarks
// @desc    Get user bookmarks
// @access  Private
router.get('/', auth_1.default, async (req, res) => {
    try {
        const bookmarks = await Bookmark_1.default.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(bookmarks);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   POST api/bookmarks/toggle
// @desc    Toggle a bookmark (adds if doesn't exist, removes if exists)
// @access  Private
router.post('/toggle', auth_1.default, async (req, res) => {
    const { book, chapter, verse, text } = req.body;
    if (!book || !chapter || !verse) {
        res.status(400).json({ message: 'book, chapter, and verse are required' });
        return;
    }
    try {
        const existing = await Bookmark_1.default.findOne({
            userId: req.userId,
            book,
            chapter,
            verse,
        });
        if (existing) {
            await Bookmark_1.default.deleteOne({ _id: existing._id });
            res.json({ bookmarked: false, message: 'Bookmark removed' });
        }
        else {
            if (!text) {
                res.status(400).json({ message: 'Verse text is required to bookmark' });
                return;
            }
            const newBookmark = new Bookmark_1.default({
                userId: req.userId,
                book,
                chapter,
                verse,
                text,
            });
            await newBookmark.save();
            res.status(201).json({ bookmarked: true, bookmark: newBookmark, message: 'Bookmark added' });
        }
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
exports.default = router;
//# sourceMappingURL=bookmarks.js.map