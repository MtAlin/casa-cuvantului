import mongoose, { Document } from 'mongoose';
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
export declare const StudyResponse: mongoose.Model<IStudyResponse, {}, {}, {}, mongoose.Document<unknown, {}, IStudyResponse, {}, {}> & IStudyResponse & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default StudyResponse;
//# sourceMappingURL=StudyResponse.d.ts.map