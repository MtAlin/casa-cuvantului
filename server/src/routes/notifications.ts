import { Router, Response } from 'express';
import Notification from '../models/Notification';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET api/notifications
// @desc    Get all notifications for a user
// @access  Private
router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    // Check user
    if (notification.user.toString() !== req.userId) {
      res.status(401).json({ message: 'User not authorized' });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.status(500).send('Server error');
  }
});

export default router;
