import { Request, Response } from 'express';
import { Teacher } from '../Models/Teacher';
import { AppError } from '../Utils/Apperrors';
import { assertString } from '../Utils/validators';

// Helper API (not in the assignment): POST /teachers
export const createTeacher = async (req: Request, res: Response) => {
  const fullName = assertString(req.body.fullName, 'fullName');
  const email = assertString(req.body.email, 'email');
  const specialization = assertString(req.body.specialization, 'specialization');

  const experience = Number(req.body.experience);
  if (!Number.isFinite(experience) || experience < 0) {
    throw new AppError(400, 'experience must be a non-negative number');
  }

  const teacher = await Teacher.create({ fullName, email, specialization, experience });
  res.status(201).json({ success: true, data: teacher });
};