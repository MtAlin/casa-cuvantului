import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, default: 'INFO' },
  createdAt: { type: Date, default: Date.now },
});

// Index to quickly fetch a user's notifications, sorted by newest first
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
