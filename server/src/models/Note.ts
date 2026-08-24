import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INote extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  book?: string;
  chapter?: number;
  verse?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
    book: {
      type: String,
      default: null,
      trim: true,
    },
    chapter: {
      type: Number,
      default: null,
      min: [1, 'Chapter must be at least 1'],
    },
    verse: {
      type: Number,
      default: null,
      min: [1, 'Verse must be at least 1'],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ userId: 1 });
noteSchema.index({ userId: 1, book: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ title: 'text', content: 'text' });

const Note = mongoose.model<INote>('Note', noteSchema);

export default Note;
