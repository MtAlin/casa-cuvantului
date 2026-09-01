import mongoose, { Document, Types } from 'mongoose';
export interface IBookmark extends Document {
    userId: Types.ObjectId;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    createdAt: Date;
}
declare const Bookmark: mongoose.Model<IBookmark, {}, {}, {}, mongoose.Document<unknown, {}, IBookmark, {}, {}> & IBookmark & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Bookmark;
//# sourceMappingURL=Bookmark.d.ts.map