import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../Utils/Apperrors';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Centralized error handler
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${field} already exists`;
  } else if (err?.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON body';
  }

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ success: false, message });
};