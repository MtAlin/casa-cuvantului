import { Router, Response } from 'express';
import Note from '../models/Note';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET api/notes
// @desc    Get user's journal notes, filterable by book or chapter
// @access  Private
router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { book, chapter } = req.query;

  const query: any = { userId: req.userId };
  if (book) query.book = book as string;
  if (chapter) query.chapter = Number(chapter);

  try {
    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/notes
// @desc    Create a new note/journal entry
// @access  Private
router.post('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, book, chapter, verse, tags } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: 'Title and content are required' });
    return;
  }

  try {
    const newNote = new Note({
      userId: req.userId,
      title,
      content,
      book: book || null,
      chapter: chapter || null,
      verse: verse || null,
      tags: tags || [],
    });

    const note = await newNote.save();
    res.status(201).json(note);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notes/:id
// @desc    Update a note/journal entry
// @access  Private
router.put('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, book, chapter, verse, tags } = req.body;

  try {
    let note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }

    if (title) note.title = title;
    if (content) note.content = content;
    note.book = book !== undefined ? book : note.book;
    note.chapter = chapter !== undefined ? chapter : note.chapter;
    note.verse = verse !== undefined ? verse : note.verse;
    if (tags) note.tags = tags;

    await note.save();
    res.json(note);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    res.json({ message: 'Note removed successfully' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
