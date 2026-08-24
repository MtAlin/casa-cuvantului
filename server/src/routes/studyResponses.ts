import express, { Response } from 'express';
import { StudyResponse } from '../models/StudyResponse';
import auth, { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get study responses for a specific plan and book
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { studyPlanId, bookName } = req.query;
    
    if (!studyPlanId || !bookName) {
      return res.status(400).json({ message: 'Missing studyPlanId or bookName' });
    }

    const responses = await StudyResponse.find({
      user: req.userId,
      studyPlan: studyPlanId,
      bookName: bookName
    });

    res.json(responses);
  } catch (error) {
    console.error('Error fetching study responses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save study responses for a chapter group
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { studyPlanId, bookName, chapterGroupId, answers } = req.body;

    if (!studyPlanId || !bookName || !chapterGroupId || !answers) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let studyResponse = await StudyResponse.findOne({
      user: req.userId,
      studyPlan: studyPlanId,
      bookName: bookName,
      chapterGroupId: chapterGroupId
    });

    if (studyResponse) {
      studyResponse.answers = answers;
      await studyResponse.save();
    } else {
      studyResponse = new StudyResponse({
        user: req.userId,
        studyPlan: studyPlanId,
        bookName: bookName,
        chapterGroupId: chapterGroupId,
        answers: answers
      });
      await studyResponse.save();
    }

    res.status(201).json(studyResponse);
  } catch (error) {
    console.error('Error saving study responses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
