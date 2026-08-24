import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserStudyPlan extends Document {
  userId: Types.ObjectId;
  studyPlanId: Types.ObjectId;
  status: 'active' | 'canceled' | 'completed';
  completedGroups: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userStudyPlanSchema = new Schema<IUserStudyPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    studyPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'StudyPlan',
      required: [true, 'Study Plan ID is required'],
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'completed'],
      default: 'active',
    },
    completedGroups: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true }
);

userStudyPlanSchema.index({ userId: 1, studyPlanId: 1 }, { unique: true });

const UserStudyPlan = mongoose.model<IUserStudyPlan>('UserStudyPlan', userStudyPlanSchema);

export default UserStudyPlan;
