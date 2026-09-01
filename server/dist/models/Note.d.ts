import mongoose, { Document, Types } from 'mongoose';
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
declare const Note: mongoose.Model<INote, {}, {}, {}, mongoose.Document<unknown, {}, INote, {}, {}> & INote & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Note;
//# sourceMappingURL=Note.d.ts.map