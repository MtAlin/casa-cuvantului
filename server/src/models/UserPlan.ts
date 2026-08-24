import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProgress {
  dayIndex: number;
  completed: boolean;
  completedAt?: Date;
}

export interface IUserPlan extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  startDate: Date;
  progress: IProgress[];
  currentDay: number;
  streakCount: number;
  lastStudyDate?: Date;
  isCompleted: boolean;
  status: 'active' | 'canceled';
  createdAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    dayIndex: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const userPlanSchema = new Schema<IUserPlan>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  planId: {
    type: Schema.Types.ObjectId,
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

const UserPlan = mongoose.model<IUserPlan>('UserPlan', userPlanSchema);

export default UserPlan;
