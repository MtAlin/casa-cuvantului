import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBookmark extends Document {
  userId: Types.ObjectId;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  book: {
    type: String,
    required: [true, 'Book name is required'],
    trim: true,
  },
  chapter: {
    type: Number,
    required: [true, 'Chapter number is required'],
    min: [1, 'Chapter must be at least 1'],
  },
  verse: {
    type: Number,
    required: [true, 'Verse number is required'],
    min: [1, 'Verse must be at least 1'],
  },
  text: {
    type: String,
    required: [true, 'Verse text is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bookmarkSchema.index({ userId: 1 });
bookmarkSchema.index({ userId: 1, book: 1, chapter: 1, verse: 1 }, { unique: true });

const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);

export default Bookmark;
