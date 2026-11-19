import { Request, Response } from 'express';
import { PipelineStage, Types } from 'mongoose';
import { Session } from '../Models/Session';
import { User } from '../Models/User';
import { AppError } from '../Utils/Apperrors';
import { assertObjectId, assertString } from '../Utils/validators';

// API 1 - POST /users
export const createUser = async (req: Request, res: Response) => {
  const fullName = assertString(req.body.fullName, 'fullName');
  const email = assertString(req.body.email, 'email');
  const phone = assertString(req.body.phone, 'phone');

  // Duplicate email becomes a 409 in the central error handler (unique index, code 11000)
  const user = await User.create({ fullName, email, phone });
  res.status(201).json({ success: true, data: user });
};

// API 6 - GET /users/:id/sessions  (Aggregation Pipeline)
export const getUserSessions = async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(assertObjectId(req.params.id, 'id'));

  const userExists = await User.exists({ _id: userId });
  if (!userExists) throw new AppError(404, 'User not found');

  const sessionPipeline = (status: 'BOOKED' | 'COMPLETED'): PipelineStage.FacetPipelineStage[] => [
    { $match: { status } },
    { $sort: { startTime: status === 'BOOKED' ? 1 : -1 } },
    {
      $lookup: {
        from: 'teachers',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      },
    },
    { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        completedAt: 1,
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

  const [result] = await Session.aggregate([
    { $match: { userId } },
    {
      $facet: {
        upcomingSessions: sessionPipeline('BOOKED'),
        completedSessions: sessionPipeline('COMPLETED'),
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      upcomingSessions: result?.upcomingSessions ?? [],
      completedSessions: result?.completedSessions ?? [],
    },
  });
};