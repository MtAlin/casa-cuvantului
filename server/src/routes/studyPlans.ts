import { Router, Response } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import adminOnly from '../middleware/adminOnly';
import StudyPlan from '../models/StudyPlan';

const router = Router();

// @route   GET /api/study-plans
// @desc    Get all study plans (admin gets all, members get active only)
// @access  Private
router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plans = await StudyPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study-plans/active
// @desc    Get the currently active study plan
// @access  Private
router.get('/active', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await StudyPlan.findOne({ isActive: true });
    if (!plan) {
      res.json(null);
      return;
    }
    res.json(plan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study-plans/:id
// @desc    Get a single study plan by ID
// @access  Private
router.get('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await StudyPlan.findById(req.params.id);
    if (!plan) {
      res.status(404).json({ message: 'Study plan not found' });
      return;
    }
    res.json(plan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/study-plans
// @desc    Create a new study plan
// @access  Admin only
router.post('/', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, year, books, isActive } = req.body;

    const plan = new StudyPlan({
      title,
      description,
      year: year || new Date().getFullYear(),
      books: books || [],
      isActive: isActive || false,
      createdBy: req.userId,
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/study-plans/:id
// @desc    Update a study plan (including adding books, chapter groups, questions)
// @access  Admin only
router.put('/:id', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, year, books, isActive } = req.body;

    // If setting this plan as active, deactivate all others
    if (isActive) {
      await StudyPlan.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }

    const plan = await StudyPlan.findByIdAndUpdate(
      req.params.id,
      { title, description, year, books, isActive },
      { new: true, runValidators: true }
    );

    if (!plan) {
      res.status(404).json({ message: 'Study plan not found' });
      return;
    }

    res.json(plan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/study-plans/:id
// @desc    Delete a study plan
// @access  Admin only
router.delete('/:id', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await StudyPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      res.status(404).json({ message: 'Study plan not found' });
      return;
    }
    res.json({ message: 'Study plan deleted' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
