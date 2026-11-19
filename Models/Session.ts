import { Schema, model } from 'mongoose';

export const SESSION_STATUS = ['AVAILABLE', 'BOOKED', 'COMPLETED'] as const;
export type SessionStatus = (typeof SESSION_STATUS)[number];

const sessionSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: SESSION_STATUS, default: 'AVAILABLE' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

sessionSchema.index({ status: 1, startTime: 1 });

export const Session = model('Session', sessionSchema);