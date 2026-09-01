import mongoose, { Document, Types } from 'mongoose';
export interface IProgress {
    dayIndex: number;
    completed: boolean;
    completedAt?: Date;
}
export interface IUserPlan extends Document {
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    startDate: Date;
    progress: IProgress[];
    currentDay: number;
    streakCount: number;
    lastStudyDate?: Date;
    isCompleted: boolean;
    status: 'active' | 'canceled';
    createdAt: Date;
}
declare const UserPlan: mongoose.Model<IUserPlan, {}, {}, {}, mongoose.Document<unknown, {}, IUserPlan, {}, {}> & IUserPlan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default UserPlan;
//# sourceMappingURL=UserPlan.d.ts.map