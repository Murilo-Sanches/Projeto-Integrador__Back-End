import { Request, Response, NextFunction } from 'express';

interface IExtError extends Error {
  statusCode: number;
  status: string;
}

const globalErrorHandler = (err: IExtError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

export default globalErrorHandler;
