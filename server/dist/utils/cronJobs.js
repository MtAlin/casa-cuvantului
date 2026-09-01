"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../models/User"));
const StudyPlan_1 = __importDefault(require("../models/StudyPlan"));
const Notification_1 = __importDefault(require("../models/Notification"));
const startCronJobs = () => {
    // Schedule to run every Monday at 9:00 AM
    // For testing purposes, if you want it to run every minute, use '* * * * *'
    const schedule = '0 9 * * 1'; // 9:00 AM on Monday
    node_cron_1.default.schedule(schedule, async () => {
        console.log('⏰ Running Monday cron job to check for active study plans...');
        try {
            // Find the active study plan
            const activePlan = await StudyPlan_1.default.findOne({ isActive: true });
            if (!activePlan) {
                console.log('ℹ️ No active study plan found. Skipping notifications.');
                return;
            }
            // Find all members and admins (or just members)
            const users = await User_1.default.find({});
            let notificationCount = 0;
            // Create a notification for each user
            for (const user of users) {
                await Notification_1.default.create({
                    user: user._id,
                    title: 'Upcoming Study Group',
                    message: `Reminder: Please study the active plan "${activePlan.title}" before Wednesday's group!`,
                    type: 'REMINDER'
                });
                notificationCount++;
            }
            console.log(`✅ Successfully sent ${notificationCount} study reminders!`);
        }
        catch (error) {
            console.error('❌ Error running study plan cron job:', error);
        }
    });
    console.log('📅 Cron jobs initialized.');
};
exports.startCronJobs = startCronJobs;
//# sourceMappingURL=cronJobs.js.map