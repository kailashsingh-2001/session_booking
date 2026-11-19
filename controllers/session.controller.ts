import { Request, Response } from 'express';
import { PipelineStage, Types } from 'mongoose';
import { Session } from '../Models/Session';
import { Teacher } from '../Models/Teacher';
import { User } from '../Models/User';
import { AppError } from '../Utils/Apperrors';
import { assertDate, assertObjectId } from '../Utils/validators';

const DAY_MS = 24 * 60 * 60 * 1000;

// API 2 - POST /sessions
export const createSession = async (req: Request, res: Response) => {
  const teacherId = assertObjectId(req.body.teacherId, 'teacherId');
  const startTime = assertDate(req.body.startTime, 'startTime');
  const endTime = assertDate(req.body.endTime, 'endTime');

  if (endTime <= startTime) {
    throw new AppError(400, 'endTime must be greater than startTime');
  }

  const teacherExists = await Teacher.exists({ _id: teacherId });
  if (!teacherExists) throw new AppError(404, 'Teacher not found');

  const session = await Session.create({ teacherId, startTime, endTime }); // status defaults to AVAILABLE
  res.status(201).json({ success: true, data: session });
};

// API 3 - GET /sessions/available?dateTimestamp={timestamp}  (Aggregation Pipeline)
// dateTimestamp is a Unix timestamp in milliseconds; the whole UTC day of that timestamp is searched.
export const getAvailableSessions = async (req: Request, res: Response) => {
  const raw = req.query.dateTimestamp;
  const timestamp = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
  if (!Number.isFinite(timestamp) || Number.isNaN(new Date(timestamp).getTime())) {
    throw new AppError(400, 'dateTimestamp query param must be a valid timestamp (milliseconds)');
  }

  const date = new Date(timestamp);
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayEnd = new Date(dayStart.getTime() + DAY_MS);

  const pipeline: PipelineStage[] = [
    { $match: { status: 'AVAILABLE', startTime: { $gte: dayStart, $lt: dayEnd } } },
    { $sort: { startTime: 1 } },
    {
      $lookup: {
        from: 'teachers',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      },
    },
    { $unwind: '$teacher' },
    {
      $project: {
        _id: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        teacher: {
          _id: '$teacher._id',
          fullName: '$teacher.fullName',
          email: '$teacher.email',
          specialization: '$teacher.specialization',
          experience: '$teacher.experience',
        },
      },
    },
  ];

  const sessions = await Session.aggregate(pipeline);
  res.status(200).json({ success: true, count: sessions.length, data: sessions });
};

// API 4 - POST /sessions/:id/book
export const bookSession = async (req: Request, res: Response) => {
  const sessionId = assertObjectId(req.params.id, 'id');
  const userId = assertObjectId(req.body.userId, 'userId');

  const userExists = await User.exists({ _id: userId });
  if (!userExists) throw new AppError(404, 'User not found');

  // Atomic update: only an AVAILABLE session can be booked, so two users can never book the same one
  const session = await Session.findOneAndUpdate(
    { _id: sessionId, status: 'AVAILABLE' },
    { $set: { status: 'BOOKED', userId: new Types.ObjectId(userId) } },
    { new: true }
  );

  if (!session) {
    const exists = await Session.exists({ _id: sessionId });
    if (!exists) throw new AppError(404, 'Session not found');
    throw new AppError(409, 'Session is not available for booking');
  }

  res.status(200).json({ success: true, data: session });
};

// API 5 - PATCH /sessions/:id/complete
export const completeSession = async (req: Request, res: Response) => {
  const sessionId = assertObjectId(req.params.id, 'id');

  const session = await Session.findOneAndUpdate(
    { _id: sessionId, status: 'BOOKED' },
    { $set: { status: 'COMPLETED', completedAt: new Date() } },
    { new: true }
  );

  if (!session) {
    const exists = await Session.exists({ _id: sessionId });
    if (!exists) throw new AppError(404, 'Session not found');
    throw new AppError(409, 'Only BOOKED sessions can be marked as completed');
  }

  res.status(200).json({ success: true, data: session });
}; 