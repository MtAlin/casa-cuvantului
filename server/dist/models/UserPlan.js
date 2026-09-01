"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const progressSchema = new mongoose_1.Schema({
    dayIndex: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
}, { _id: false });
const userPlanSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    planId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ReadingPlan',
        required: [true, 'Plan ID is required'],
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    progress: {
        type: [progressSchema],
        default: [],
    },
    currentDay: {
        type: Number,
        default: 0,
    },
    streakCount: {
        type: Number,
        default: 0,
    },
    lastStudyDate: {
        type: Date,
        default: null,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'canceled'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
userPlanSchema.index({ userId: 1, planId: 1 }, { unique: true });
userPlanSchema.index({ userId: 1 });
const UserPlan = mongoose_1.default.model('UserPlan', userPlanSchema);
exports.default = UserPlan;
//# sourceMappingURL=UserPlan.js.map