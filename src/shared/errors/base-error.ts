import { ErrorCode } from './error-codes';

export abstract class BaseError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: ErrorCode, statusCode: number, isOperational = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
