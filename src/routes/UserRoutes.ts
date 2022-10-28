/* eslint-disable comma-dangle */
import { IRouter, Router } from 'express';

import UserController from '../controllers/UserController';

class UserRoutes extends UserController {
  public router: IRouter;

  public constructor() {
    super();
    this.router = Router();
    this.signUpPath();
    this.loginPath();
    this.logoutPath();
    this.forgotPasswordPath();
    this.resetPasswordPath();
    this.updatePasswordPath();
    this.createPostPath();
    this.createCommentPath();
    this.getPostPath();
    this.followPath();
    this.whoIFollowPath();
    this.updateMePath();
    this.deleteMePath();
  }

  private signUpPath = (): void => {
    this.router.post('/signup', this.signUp);
  };

  private loginPath = (): void => {
    this.router.post('/login', this.login);
  };

  private logoutPath = (): void => {
    this.router.post('/logout', this.logout);
  };

  private forgotPasswordPath = (): void => {
    this.router.post('/forgot-password', this.forgotPassword);
  };

  private resetPasswordPath = (): void => {
    this.router.patch('/reset-password/:token', this.resetPassword);
  };

  private updatePasswordPath = (): void => {
    this.router.patch('/update-my-password', this.protect, this.updatePassword);
  };

  private updateMePath = (): void => {
    this.router.patch('/update-me', this.protect, this.updateMe);
  };

  private deleteMePath = (): void => {
    this.router.delete('/delete-me', this.protect, this.deleteMe);
  };

  private createPostPath = (): void => {
    this.router.post('/create-post', this.protect, this.parseField, this.createPost);
  };

  private createCommentPath = (): void => {
    this.router.post('/create-comment/:postId', this.protect, this.createComment);
  };

  private followPath = (): void => {
    this.router.post('/follow/:username', this.protect, this.follow);
  };

  private whoIFollowPath = (): void => {
    this.router.get('/who-i-follow', this.protect, this.whoIFollow);
  };

  private getPostPath = (): void => {
    this.router.get('/post/:postId', this.getPost);
  };
}

export default UserRoutes;
