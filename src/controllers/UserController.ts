import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

import AuthController from './AuthController';

import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

import User from '../models/schemas/User';
import Post from '../models/schemas/Post';
import Comment from '../models/schemas/Comment';

class UserController extends AuthController {
  private multerStorage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'src/public/images');
    },
    filename: (req, file, callback) => {
      const ext = file.mimetype.split('/')[1];
      callback(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    },
  });

  // eslint-disable-next-line class-methods-use-this
  private multerFilter = (req, file, callback): multer.FileFilterCallback => {
    if (file.mimetype.startsWith('image')) {
      return callback(null, true);
    }
    return callback(new AppError('Não é uma imagem. Por enquanto só aceitamos o upload de imagens', 400), false);
  };

  protected parseField = multer({
    storage: this.multerStorage,
    fileFilter: this.multerFilter,
  }).single('photo');

  protected createPost = catchAsync(async (req: Request, res: Response): Promise<Response> => {
    this.req = req;
    this.res = res;
    const post = await Post.create({
      creator: this.req.user.id,
      text: this.req.body.text,
      images: [this.req.file.filename],
      tags: this.req.body.tags,
      status: this.req.body.status,
    });
    return this.res.status(201).json({
      status: 'success',
      data: { post },
    });
  });

  // eslint-disable-next-line class-methods-use-this
  protected isLogged = (req: Request, res: Response, next: NextFunction) => {
    console.log('Você está logado');
    next();
  };

  // protected parseField = multer({ dest: 'src/public/images' }).single('photo');

  protected updateMe = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    this.req = req;
    this.res = res;
    // Permitir a atualização apenas de algumas informações
    const filterObj = (obj: object, ...allowedFields: Array<String>) => {
      const newObj: object = {};
      Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
          newObj[el] = obj[el];
        }
      });
      return newObj;
    };
    const filteredBody = filterObj(this.req.body, 'email', 'name', 'username');
    const user = await User.findByIdAndUpdate(this.req.user.id, filteredBody, { new: true, runValidators: true });
    return this.res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  protected deleteMe = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    this.req = req;
    this.res = res;
    await User.findByIdAndUpdate(this.req.user.id, { active: false });
    return this.res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  protected follow = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    this.req = req;
    this.res = res;
    const { username } = this.req.params;
    const user = await User.findOne({ username, active: { $ne: false } }).select({ _id: 1 });
    if (!user) {
      return next(new AppError('O usuário que você tentou seguir não existe, foi banido ou desativou a conta', 400));
    }
    // const following = await Following.findByIdAndUpdate(
    //   this.req.user.following,
    //   { $addToSet: { following: user.id } },
    //   { new: true }
    // );
    const following = await User.findByIdAndUpdate(
      this.req.user.id,
      { $addToSet: { following: user.id } },
      { new: true }
    );
    /* 
      The $addToSet operator adds a value to an array unless the value is already present, in which case 
      $addToSet does nothing to that array.
    */
    return this.res.status(200).json({
      status: 'success',
      data: { following },
    });
  });

  protected whoIFollow = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    this.req = req;
    this.res = res;
    // const following = await User.findOne({ _id: this.req.user.id }).populate('following');
    const following = await this.req.user.populate({
      path: 'following',
      select: 'username name profile_picture background_photo biography status',
    });
    // const following = await this.req.user;
    return this.res.status(200).json({
      status: 'success',
      data: { following },
    });
  });

  protected createComment = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    this.req = req;
    this.res = res;
    const comment = await Comment.create({
      creator: this.req.user.id,
      target: this.req.params.postId,
      text: this.req.body.text,
      images: this.req.body.images,
      status: this.req.body.status,
    });
    return this.res.status(201).json({
      status: 'success',
      data: { comment },
    });
  });

  protected getPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    this.req = req;
    this.res = res;
    const post = await Post.findById(req.params.postId).populate('comments');
    // const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(new AppError('Nenhum post encontrado', 404));
    }
    this.res.status(200).json({
      status: 'success',
      data: { post },
    });
  });
}

export default UserController;
