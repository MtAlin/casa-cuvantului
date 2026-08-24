import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReading {
  day: number;
  title: string;
  book: string;
  chapters: string;
  description: string;
}

export interface IReadingPlan extends Document {
  title: string;
  description: string;
  type: 'yearly' | 'topical' | 'custom' | 'book';
  readings: IReading[];
  duration: number;
  coverImage: string;
  createdBy?: Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
}

const readingSchema = new Schema<IReading>(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    book: { type: String, required: true },
    chapters: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const readingPlanSchema = new Schema<IReadingPlan>({
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
    type: Schema.Types.ObjectId,
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

const ReadingPlan = mongoose.model<IReadingPlan>('ReadingPlan', readingPlanSchema);

export default ReadingPlan;
