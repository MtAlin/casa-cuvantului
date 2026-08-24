import { Router, Response } from 'express';
import ReadingPlan from '../models/ReadingPlan';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET api/plans
// @desc    Get all public reading plans and custom plans created by the logged in user
// @access  Public (Optional auth)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plans = await ReadingPlan.find({
      $or: [
        { isPublic: true },
        ...(req.userId ? [{ createdBy: req.userId }] : []),
      ],
    }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/plans/:id
// @desc    Get a single plan by ID
// @access  Public
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await ReadingPlan.findById(req.params.id);
    if (!plan) {
      res.status(404).json({ message: 'Plan not found' });
      return;
    }
    res.json(plan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/plans
// @desc    Create a custom reading plan
// @access  Private
router.post('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, type, readings, duration, coverImage, isPublic } = req.body;

  if (!title || !type || !duration) {
    res.status(400).json({ message: 'Title, type, and duration are required' });
    return;
  }

  try {
    const newPlan = new ReadingPlan({
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
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
