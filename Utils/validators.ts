import mongoose from 'mongoose';
import { AppError } from './Apperrors';

export const assertObjectId = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
    throw new AppError(400, `${field} must be a valid ObjectId`);
  }
  return value;
};

export const assertString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, `${field} is required`);
  }
  return value.trim();
};

export const assertDate = (value: unknown, field: string): Date => {
  const date = new Date(value as string | number);
  if (value === undefined || value === null || value === '' || Number.isNaN(date.getTime())) {
    throw new AppError(400, `${field} must be a valid date`);
  }
  return date;
};