import mongoose, { Document } from 'mongoose';
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
declare const StudyPlan: mongoose.Model<IStudyPlan, {}, {}, {}, mongoose.Document<unknown, {}, IStudyPlan, {}, {}> & IStudyPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default StudyPlan;
//# sourceMappingURL=StudyPlan.d.ts.map