import cron from 'node-cron';
import User from '../models/User';
import StudyPlan from '../models/StudyPlan';
import Notification from '../models/Notification';

export const startCronJobs = () => {
  // Schedule to run every Monday at 9:00 AM
  // For testing purposes, if you want it to run every minute, use '* * * * *'
  const schedule = '0 9 * * 1'; // 9:00 AM on Monday

  cron.schedule(schedule, async () => {
    console.log('⏰ Running Monday cron job to check for active study plans...');
    
    try {
      // Find the active study plan
      const activePlan = await StudyPlan.findOne({ isActive: true });
      
      if (!activePlan) {
        console.log('ℹ️ No active study plan found. Skipping notifications.');
        return;
      }

      // Find all members and admins (or just members)
      const users = await User.find({});

      let notificationCount = 0;
      
      // Create a notification for each user
      for (const user of users) {
        await Notification.create({
          user: user._id,
          title: 'Upcoming Study Group',
          message: `Reminder: Please study the active plan "${activePlan.title}" before Wednesday's group!`,
          type: 'REMINDER'
        });
        notificationCount++;
      }

      console.log(`✅ Successfully sent ${notificationCount} study reminders!`);
    } catch (error) {
      console.error('❌ Error running study plan cron job:', error);
    }
  });

  console.log('📅 Cron jobs initialized.');
};
