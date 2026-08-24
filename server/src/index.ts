import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { startCronJobs } from './utils/cronJobs';

// Load env variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database and Start Server
const startServer = async () => {
  try {
    await connectDB();
    startCronJobs();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Fatal error during server startup:', error);
    process.exit(1);
  }
};

startServer();

// Middleware
app.use(cors());
app.use(express.json());

// Basic sanity check route
app.get('/', (req, res) => {
  res.send('Casa Cuvântului API is running...');
});

// Import routes
import authRoutes from './routes/auth';
import planRoutes from './routes/plans';
import userPlanRoutes from './routes/userPlans';
import noteRoutes from './routes/notes';
import bookmarkRoutes from './routes/bookmarks';
import studyPlanRoutes from './routes/studyPlans';
import studyResponseRoutes from './routes/studyResponses';
import userStudyPlanRoutes from './routes/userStudyPlans';
import notificationRoutes from './routes/notifications';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/user-plans', userPlanRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/study-responses', studyResponseRoutes);
app.use('/api/user-study-plans', userStudyPlanRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something broke on the server!' });
});


