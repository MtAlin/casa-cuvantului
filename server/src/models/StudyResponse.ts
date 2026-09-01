import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestionAnswer {
  questionId: string;
  answer: string;
}

export interface IStudyResponse extends Document {
  user: mongoose.Types.ObjectId;
  studyPlan: mongoose.Types.ObjectId;
  bookName: string;
  chapterGroupId: string;
  answers: IQuestionAnswer[];
}

const QuestionAnswerSchema = new Schema({
  questionId: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const StudyResponseSchema = new Schema<IStudyResponse>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studyPlan: { type: Schema.Types.ObjectId, ref: 'StudyPlan', required: true },
  bookName: { type: String, required: true },
  chapterGroupId: { type: String, required: true },
  answers: [QuestionAnswerSchema]
}, { timestamps: true });

export const StudyResponse = mongoose.model<IStudyResponse>('StudyResponse', StudyResponseSchema);
export default StudyResponse;
