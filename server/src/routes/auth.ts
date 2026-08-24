import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to generate JWT token
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
};

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name must be at least 2 characters').isLength({ min: 2 }),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array().reduce((acc, err: any) => {
        acc[err.path || err.param] = err.msg;
        return acc;
      }, {} as Record<string, string>) });
      return;
    }

    const { name, email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      user = new User({
        name,
        email,
        password,
        role: role === 'admin' ? 'admin' : 'member',
      });

      await user.save();

      const token = generateToken(user.id);
      res.status(201).json({
        token,
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array().reduce((acc, err: any) => {
        acc[err.path || err.param] = err.msg;
        return acc;
      }, {} as Record<string, string>) });
      return;
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const token = generateToken(user.id);
      res.json({
        token,
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
