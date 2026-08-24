import { Router, Response } from 'express';
import Bookmark from '../models/Bookmark';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET api/bookmarks
// @desc    Get user bookmarks
// @access  Private
router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/bookmarks/toggle
// @desc    Toggle a bookmark (adds if doesn't exist, removes if exists)
// @access  Private
router.post('/toggle', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { book, chapter, verse, text } = req.body;

  if (!book || !chapter || !verse) {
    res.status(400).json({ message: 'book, chapter, and verse are required' });
    return;
  }

  try {
    const existing = await Bookmark.findOne({
      userId: req.userId,
      book,
      chapter,
      verse,
    });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      res.json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      if (!text) {
        res.status(400).json({ message: 'Verse text is required to bookmark' });
        return;
      }
      const newBookmark = new Bookmark({
        userId: req.userId,
        book,
        chapter,
        verse,
        text,
      });
      await newBookmark.save();
      res.status(201).json({ bookmarked: true, bookmark: newBookmark, message: 'Bookmark added' });
    }
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
