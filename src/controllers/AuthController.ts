/* eslint-disable no-underscore-dangle */
/* eslint-disable comma-dangle */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import Email from '../utils/Email';

import User from '../models/schemas/User';
import Following from '../models/schemas/Following';
import IUser from '../models/interfaces/IUser';

interface IToken extends jwt.SignCallback {
  id?: any;
  iat?: any;
}

interface IRequestUser extends Request {
  user?: any;
  role?: any;
  tooken?: any;
}

abstract class AuthController {
  protected req: IRequestUser;

  protected res: Response;

  protected signUp = catchAsync(async (req: Request, res: Response): Promise<object> => {
    this.req = req;
    this.res = res;
    // const list = await Following.create({});
    const newUser = await User.create({
      name: req.body.name,
      username: req.body.username,
      birth: req.body.birth,
      gender: req.body.gender,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      // following: list._id,
    });
    return AuthController.createSendToken(newUser, 201, this.req, this.res);
  });

  protected login = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    this.req = req;
    this.res = res;
    const { email, password } = this.req.body;
    if (!email || !password) {
      return next(new AppError('Preencha email e senha para efetuar o login', 401));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Não foi possível efetuar o login, email ou senha incorretos', 400));
    }
    return AuthController.createSendToken(user, 200, this.req, this.res);
  });

  protected logout = (req: Request, res: Response): Response<object> => {
    this.req = req;
    this.res = res;
    this.res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
    });
    return this.res.status(200).json({ status: 'success', message: 'loggedout' });
  };

  protected protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    this.req = req;
    this.res = res;
    let token: string;
    if (this.req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // eslint-disable-next-line prefer-destructuring
      token = this.req.headers.authorization.split(' ')[1];
    } else if (this.req.cookies.jwt) {
      // console.log(this.req.cookies);
      // console.log('=========================================================');
      token = this.req.cookies.jwt;
    }
    // console.log(token);
    if (!token) {
      return next(new AppError('Você não está logado', 401));
    }
    const decoded: IToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    /* { id: '62f6946219776246f1973e7d', iat: 1660401576, exp: 1668177576 } */
    /* iat: timestamp creation exp: timestamp expiration */
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('Esse token não existe mais', 401));
    }
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('A senha foi mudada recentemente', 401));
    }
    this.req.user = user;
    this.req.tooken = token;
    return next();
  });

  protected forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    this.req = req;
    this.res = res;
    const user = await User.findOne({ email: this.req.body.email });
    if (!user) {
      return next(new AppError('Esse email não existe', 404));
    }
    const resetToken = await user.createPasswordResetToken();
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
    try {
      await new Email(user, resetURL).sendPasswordReset();
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Ouve um erro ao mandar o email, tente novamente mais tarde', 500));
    }
    return this.res.status(200).json({ status: 'success', message: 'Token de recuperação enviado por email' });
  });

  protected resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    this.req = req;
    this.res = res;
    const encodedToken = crypto.createHash('sha256').update(this.req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: encodedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new AppError('Esse token não existe ou já foi expirado', 404));
    }
    user.password = this.req.body.password;
    user.passwordConfirm = this.req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return AuthController.createSendToken(user, 200, this.req, this.res);
  });

  protected updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    this.req = req;
    this.res = res;
    const user = await User.findById(this.req.user.id).select('+password');
    if (!(await user.correctPassword(this.req.body.passwordCurrent, user.password))) {
      return next(new AppError('Sua senha atual está errada', 401));
    }
    user.password = this.req.body.password;
    user.passwordConfirm = this.req.body.passwordConfirm;
    await user.save();
    return AuthController.createSendToken(user, 200, this.req, this.res);
  });

  protected static restrictTo(...roles: string[]) {
    return (req: IRequestUser, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError('Você não tem permissão para performar essa ação', 403));
      }
      return next();
    };
  }

  private static createSendToken = (user: IUser, statusCode: number, req: Request, res: Response): object => {
    const token = AuthController.signToken(user._id);
    /* 24 * 60 * 60 * 1000 = 24 horas * 60 minutos * 60 segundos * 1000 milésimos */
    const cookieOptions = {
      expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      // secure: true,
    };
    res.cookie('jwt', token, cookieOptions);
    // Remover a senha do output
    // eslint-disable-next-line no-param-reassign
    user.password = undefined;
    return res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  };

  private static signToken(id: string): string {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }
}

export default AuthController;
