import { Router, Response } from 'express';
import UserStudyPlan from '../models/UserStudyPlan';
import StudyPlan from '../models/StudyPlan';
import StudyResponse from '../models/StudyResponse';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();

// @route   POST api/user-study-plans/enroll
// @desc    Enroll user in a study plan
// @access  Private
router.post('/enroll', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { studyPlanId } = req.body;

  if (!studyPlanId) {
    res.status(400).json({ message: 'Study Plan ID is required' });
    return;
  }

  try {
    // Check if already enrolled
    let existing = await UserStudyPlan.findOne({ userId: req.userId, studyPlanId });
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
    const plan = await StudyPlan.findById(studyPlanId);
    if (!plan) {
      res.status(404).json({ message: 'Study plan not found' });
      return;
    }

    const newUserStudyPlan = new UserStudyPlan({
      userId: req.userId,
      studyPlanId,
      status: 'active',
      completedGroups: [],
    });

    const userStudyPlan = await newUserStudyPlan.save();
    await userStudyPlan.populate('studyPlanId');

    res.status(201).json(userStudyPlan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/user-study-plans
// @desc    Get all user's study plans
// @access  Private
router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plans = await UserStudyPlan.find({ userId: req.userId }).populate('studyPlanId');
    res.json(plans);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/user-study-plans/:id/status
// @desc    Update status (active/canceled)
// @access  Private
router.patch('/:id/status', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;

  if (!['active', 'canceled'].includes(status)) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }

  try {
    const userStudyPlan = await UserStudyPlan.findOne({ _id: req.params.id, userId: req.userId });
    if (!userStudyPlan) {
      res.status(404).json({ message: 'User study plan not found' });
      return;
    }

    userStudyPlan.status = status;
    await userStudyPlan.save();
    await userStudyPlan.populate('studyPlanId');

    res.json(userStudyPlan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/user-study-plans/:id/progress
// @desc    Update completed groups
// @access  Private
router.patch('/:id/progress', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { completedGroups } = req.body; // Array of group IDs

  if (!Array.isArray(completedGroups)) {
    res.status(400).json({ message: 'completedGroups must be an array' });
    return;
  }

  try {
    const userStudyPlan = await UserStudyPlan.findOne({ _id: req.params.id, userId: req.userId });
    if (!userStudyPlan) {
      res.status(404).json({ message: 'User study plan not found' });
      return;
    }

    userStudyPlan.completedGroups = completedGroups as any;
    
    // Check if fully completed
    const plan = await StudyPlan.findById(userStudyPlan.studyPlanId);
    if (plan) {
      const totalGroups = plan.books.reduce((acc, book) => acc + book.chapterGroups.length, 0);
      if (completedGroups.length >= totalGroups && totalGroups > 0) {
        userStudyPlan.status = 'completed';
      }
    }

    await userStudyPlan.save();
    res.json(userStudyPlan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/user-study-plans/reset/:studyPlanId
// @desc    Reset study plan progress
// @access  Private
router.post('/reset/:studyPlanId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userStudyPlan = await UserStudyPlan.findOne({ studyPlanId: req.params.studyPlanId, userId: req.userId });
    if (!userStudyPlan) {
      res.status(404).json({ message: 'User study plan not found' });
      return;
    }

    userStudyPlan.completedGroups = [];
    userStudyPlan.status = 'active';
    await userStudyPlan.save();
    
    // Optțional, ștergem și răspunsurile pentru a fi 100% resetat
    await StudyResponse.deleteMany({ userId: req.userId, studyPlanId: req.params.studyPlanId });

    await userStudyPlan.populate('studyPlanId');
    res.json(userStudyPlan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
