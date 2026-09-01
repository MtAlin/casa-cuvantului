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
const readingSchema = new mongoose_1.Schema({
    day: { type: Number, required: true },
    title: { type: String, required: true },
    book: { type: String, required: true },
    chapters: { type: String, required: true },
    description: { type: String, default: '' },
}, { _id: false });
const readingPlanSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Plan title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        default: '',
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
        type: String,
        required: true,
        enum: {
            values: ['yearly', 'topical', 'custom', 'book'],
            message: '{VALUE} is not a valid plan type',
        },
    },
    readings: {
        type: [readingSchema],
        default: [],
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 day'],
    },
    coverImage: {
        type: String,
        default: '',
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
readingPlanSchema.index({ type: 1 });
readingPlanSchema.index({ isPublic: 1 });
readingPlanSchema.index({ createdBy: 1 });
const ReadingPlan = mongoose_1.default.model('ReadingPlan', readingPlanSchema);
exports.default = ReadingPlan;
//# sourceMappingURL=ReadingPlan.js.map