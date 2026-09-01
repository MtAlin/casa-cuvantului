"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false;
const connectDB = async () => {
    if (isConnected) {
        console.log('=> Using existing MongoDB connection');
        return;
    }
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        const conn = await mongoose_1.default.connect(mongoURI);
        isConnected = !!conn.connections[0].readyState;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📂 Using database: ${conn.connection.db?.databaseName || 'disciplebookplanner'}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        // Remove process.exit(1) to avoid killing the Vercel serverless function container entirely
        throw error;
    }
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map