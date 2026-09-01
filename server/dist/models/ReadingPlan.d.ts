import mongoose, { Document, Types } from 'mongoose';
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
declare const ReadingPlan: mongoose.Model<IReadingPlan, {}, {}, {}, mongoose.Document<unknown, {}, IReadingPlan, {}, {}> & IReadingPlan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default ReadingPlan;
//# sourceMappingURL=ReadingPlan.d.ts.map