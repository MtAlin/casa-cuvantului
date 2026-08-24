import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyQuestion {
  text: string;
  expectedAnswer?: string;
  type?: string;
  isActive?: boolean;
}

export interface IChapterGroup {
  title: string;
  startChapter?: number;
  endChapter?: number;
  customChapters?: string;
  questions: IStudyQuestion[];
}

export interface IStudyBook {
  bookName: string;
  chapterGroups: IChapterGroup[];
}

export interface IStudyPlan extends Document {
  title: string;
  description: string;
  year: number;
  books: IStudyBook[];
  isActive: boolean;
  startDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const studyQuestionSchema = new Schema<IStudyQuestion>({
  text: { type: String, required: true },
  expectedAnswer: { type: String, default: '' },
  type: { type: String, default: 'reflection' },
  isActive: { type: Boolean, default: true },
});

const chapterGroupSchema = new Schema<IChapterGroup>({
  title: { type: String, required: true },
  startChapter: { type: Number },
  endChapter: { type: Number },
  customChapters: { type: String, default: "" },
  questions: [studyQuestionSchema],
});

const studyBookSchema = new Schema<IStudyBook>({
  bookName: { type: String, required: true },
  chapterGroups: [chapterGroupSchema],
});

const studyPlanSchema = new Schema<IStudyPlan>(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, default: '' },
    year: { type: Number, required: true, default: () => new Date().getFullYear() },
    books: [studyBookSchema],
    isActive: { type: Boolean, default: false },
    startDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const StudyPlan = mongoose.model<IStudyPlan>('StudyPlan', studyPlanSchema);

export default StudyPlan;
