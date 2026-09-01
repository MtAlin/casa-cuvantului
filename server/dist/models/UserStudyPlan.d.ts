import mongoose, { Document, Types } from 'mongoose';
export interface IUserStudyPlan extends Document {
    userId: Types.ObjectId;
    studyPlanId: Types.ObjectId;
    status: 'active' | 'canceled' | 'completed';
    completedGroups: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const UserStudyPlan: mongoose.Model<IUserStudyPlan, {}, {}, {}, mongoose.Document<unknown, {}, IUserStudyPlan, {}, {}> & IUserStudyPlan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default UserStudyPlan;
//# sourceMappingURL=UserStudyPlan.d.ts.map