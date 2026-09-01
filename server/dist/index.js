"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const cronJobs_1 = require("./utils/cronJobs");
// Load env variables
dotenv_1.default.config();
// Initialize app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect to Database (cached for Vercel)
(0, db_1.default)().catch(err => console.error('DB Connection Failed:', err));
// Start Cron Jobs only if NOT running on Vercel
if (process.env.VERCEL !== '1') {
    (0, cronJobs_1.startCronJobs)();
}
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Basic sanity check route
app.get('/', (req, res) => {
    res.send('Casa Cuvântului API is running...');
});
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const plans_1 = __importDefault(require("./routes/plans"));
const userPlans_1 = __importDefault(require("./routes/userPlans"));
const notes_1 = __importDefault(require("./routes/notes"));
const bookmarks_1 = __importDefault(require("./routes/bookmarks"));
const studyPlans_1 = __importDefault(require("./routes/studyPlans"));
const studyResponses_1 = __importDefault(require("./routes/studyResponses"));
const userStudyPlans_1 = __importDefault(require("./routes/userStudyPlans"));
const notifications_1 = __importDefault(require("./routes/notifications"));
// Mount routes
app.use('/api/auth', auth_1.default);
app.use('/api/plans', plans_1.default);
app.use('/api/user-plans', userPlans_1.default);
app.use('/api/notes', notes_1.default);
app.use('/api/bookmarks', bookmarks_1.default);
app.use('/api/study-plans', studyPlans_1.default);
app.use('/api/study-responses', studyResponses_1.default);
app.use('/api/user-study-plans', userStudyPlans_1.default);
app.use('/api/notifications', notifications_1.default);
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Something broke on the server!' });
});
// Start listening only if NOT on Vercel
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map