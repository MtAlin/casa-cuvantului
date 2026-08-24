import { Router, Response } from 'express';
import UserPlan from '../models/UserPlan';
import ReadingPlan from '../models/ReadingPlan';
import auth, { AuthRequest } from '../middleware/auth';
import adminOnly from '../middleware/adminOnly';

const router = Router();

// @route   POST api/user-plans/enroll
// @desc    Enroll user in a reading plan
// @access  Private
router.post('/enroll', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { planId } = req.body;

  if (!planId) {
    res.status(400).json({ message: 'Plan ID is required' });
    return;
  }

  try {
    // Check if already enrolled
    let existing = await UserPlan.findOne({ userId: req.userId, planId });
    if (existing) {
      res.status(400).json({ message: 'Already enrolled in this plan' });
      return;
    }

    // Find the reading plan to get duration
    const plan = await ReadingPlan.findById(planId);
    if (!plan) {
      res.status(404).json({ message: 'Reading plan not found' });
      return;
    }

    // Build default progress array
    const progress = Array.from({ length: plan.duration }, (_, idx) => ({
      dayIndex: idx + 1,
      completed: false,
      completedAt: undefined,
    }));

    const newUserPlan = new UserPlan({
      userId: req.userId,
      planId,
      progress,
      startDate: new Date(),
    });

    const userPlan = await newUserPlan.save();
    // Populate plan details
    await userPlan.populate('planId');

    res.status(201).json(userPlan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/user-plans/reset/:planId
// @desc    Reset reading plan progress
// @access  Private
router.post('/reset/:planId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userPlan = await UserPlan.findOne({ planId: req.params.planId, userId: req.userId });
    if (!userPlan) {
      res.status(404).json({ message: 'User plan not found' });
      return;
    }

    // Reset progress array
    userPlan.progress.forEach(p => {
      p.completed = false;
      p.completedAt = undefined;
    });
    userPlan.status = 'active';
    userPlan.isCompleted = false;
    userPlan.currentDay = 1;
    userPlan.streakCount = 0;
    userPlan.lastStudyDate = undefined;

    await userPlan.save();
    await userPlan.populate('planId');

    res.json(userPlan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/user-plans/active
// @desc    Get user's enrolled plans
// @access  Private
router.get('/active', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plans = await UserPlan.find({ userId: req.userId }).populate('planId');
    res.json(plans);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/user-plans/:id/progress
// @desc    Update progress for a specific day in the plan
// @access  Private
router.patch('/:id/progress', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { dayIndex, completed } = req.body;

  if (dayIndex === undefined || completed === undefined) {
    res.status(400).json({ message: 'dayIndex and completed status are required' });
    return;
  }

  try {
    const userPlan = await UserPlan.findOne({ _id: req.params.id, userId: req.userId });
    if (!userPlan) {
      res.status(404).json({ message: 'User plan subscription not found' });
      return;
    }

    // Update progress item
    const progressItem = userPlan.progress.find((p) => p.dayIndex === dayIndex);
    if (!progressItem) {
      res.status(400).json({ message: `Day index ${dayIndex} is invalid for this plan` });
      return;
    }

    const wasCompleted = progressItem.completed;
    progressItem.completed = completed;
    progressItem.completedAt = completed ? new Date() : undefined;

    // Recalculate streak if completing a day
    if (completed && !wasCompleted) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (userPlan.lastStudyDate) {
        const lastStudy = new Date(userPlan.lastStudyDate);
        lastStudy.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - lastStudy.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Studied yesterday, increment streak
          userPlan.streakCount += 1;
        } else if (diffDays > 1) {
          // Broken streak, reset
          userPlan.streakCount = 1;
        }
        // If diffDays is 0 (same day), leave streakCount unchanged
      } else {
        // First study session ever
        userPlan.streakCount = 1;
      }
      userPlan.lastStudyDate = new Date();
    }

    // Check if the whole plan is completed
    const allCompleted = userPlan.progress.every((p) => p.completed);
    userPlan.isCompleted = allCompleted;

    // Calculate currentDay (first uncompleted day, or last completed day index)
    const firstUncompleted = userPlan.progress.find((p) => !p.completed);
    userPlan.currentDay = firstUncompleted ? firstUncompleted.dayIndex : userPlan.progress.length;

    await userPlan.save();
    await userPlan.populate('planId');

    res.json(userPlan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PATCH api/user-plans/:id/status
// @desc    Update status (active/canceled) for a user plan
// @access  Private
router.patch('/:id/status', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;

  if (!['active', 'canceled'].includes(status)) {
    res.status(400).json({ message: 'Invalid status' });
    return;
  }

  try {
    const userPlan = await UserPlan.findOne({ _id: req.params.id, userId: req.userId });
    if (!userPlan) {
      res.status(404).json({ message: 'User plan not found' });
      return;
    }

    userPlan.status = status as 'active' | 'canceled';
    await userPlan.save();
    await userPlan.populate('planId');

    res.json(userPlan);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/user-plans/stats
// @desc    Get user's overall stats across all enrolled plans
// @access  Private
router.get('/stats', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userPlans = await UserPlan.find({ userId: req.userId });
    
    let totalDays = 0;
    let completedDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;

    userPlans.forEach((up) => {
      totalDays += up.progress.length;
      completedDays += up.progress.filter((p) => p.completed).length;
      
      if (up.streakCount > longestStreak) {
        longestStreak = up.streakCount;
      }
      
      // Basic check to see if streak is active (was updated today or yesterday)
      if (up.lastStudyDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastStudy = new Date(up.lastStudyDate);
        lastStudy.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - lastStudy.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          if (up.streakCount > currentStreak) {
            currentStreak = up.streakCount;
          }
        }
      }
    });

    const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    res.json({
      totalDays,
      completedDays,
      percentage,
      currentStreak,
      longestStreak,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/user-plans/community-stats
// @desc    Get top users stats for admin
// @access  Private/Admin
router.get('/community-stats', auth, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userPlans = await UserPlan.find().populate('userId', 'name avatar email');
    
    const userStatsMap: Record<string, any> = {};
    
    userPlans.forEach(up => {
      if (!up.userId) return; // skip if user was deleted
      const user = up.userId as any;
      const uid = user._id.toString();
      
      if (!userStatsMap[uid]) {
        userStatsMap[uid] = {
          user: { _id: user._id, name: user.name, avatar: user.avatar, email: user.email },
          longestStreak: 0,
          completedPlans: 0,
          totalDays: 0,
          completedDays: 0
        };
      }
      
      if (up.streakCount > userStatsMap[uid].longestStreak) {
        userStatsMap[uid].longestStreak = up.streakCount;
      }
      
      if (up.isCompleted) {
        userStatsMap[uid].completedPlans += 1;
      }
      
      userStatsMap[uid].totalDays += up.progress.length;
      userStatsMap[uid].completedDays += up.progress.filter((p: any) => p.completed).length;
    });

    const UserStudyPlan = require('../models/UserStudyPlan').default;
    const userStudyPlans = await UserStudyPlan.find({ status: 'completed' }).populate('userId', 'name avatar email');
    
    userStudyPlans.forEach((usp: any) => {
      if (!usp.userId) return;
      const user = usp.userId as any;
      const uid = user._id.toString();
      
      if (!userStatsMap[uid]) {
        userStatsMap[uid] = {
          user: { _id: user._id, name: user.name, avatar: user.avatar, email: user.email },
          longestStreak: 0,
          completedPlans: 0,
          totalDays: 0,
          completedDays: 0
        };
      }
      userStatsMap[uid].completedPlans += 1;
    });

    const statsArray = Object.values(userStatsMap).map((s: any) => ({
      ...s,
      percentage: s.totalDays > 0 ? Math.round((s.completedDays / s.totalDays) * 100) : 0
    }));
    
    const topStreaks = [...statsArray].sort((a, b) => b.longestStreak - a.longestStreak).filter(s => s.longestStreak > 0).slice(0, 5);
    const topCompleted = [...statsArray].sort((a, b) => b.completedPlans - a.completedPlans).filter(s => s.completedPlans > 0).slice(0, 5);
    
    res.json({
      topStreaks,
      topCompleted,
      allUserStats: statsArray
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
