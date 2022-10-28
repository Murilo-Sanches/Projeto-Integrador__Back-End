/* eslint-disable comma-dangle */
import { IRouter, Router } from 'express';

import AuthController from '../../controllers/AuthController';
import AdminController from '../../controllers/admin/AdminController';

// class AdminRoutes extends AuthController {
class AdminRoutes extends AdminController {
  public router: IRouter;

  public constructor() {
    super();
    this.router = Router();
    this.getDashboardPage();
    this.postSignUp();
    this.postLogin();
    this.postLogout();
    this.getUsersPath();
    this.getUserPath();
    this.updateUserPath();
    this.deleteUserPath();
    this.mostReportedPath();
  }

  private getDashboardPage = (): void => {
    this.router.get('/', this.protect, AuthController.restrictTo('admin'), this.getDashboard);
  };

  private postSignUp = (): void => {
    this.router.post('/signup');
  };

  private postLogin = (): void => {
    this.router.post('/login');
  };

  private postLogout = (): void => {
    this.router.post('/logout');
  };

  private getUsersPath = (): void => {
    this.router.get('/users', this.protect, AuthController.restrictTo('admin'), this.getAllUsers);
  };

  private getUserPath = (): void => {
    this.router.get('/user/:username', this.protect, AuthController.restrictTo('admin'), this.getOneUser);
  };

  private updateUserPath = (): void => {
    this.router.patch('/user/:id', this.protect, AuthController.restrictTo('admin'), this.updateUser);
  };

  private deleteUserPath = (): void => {
    this.router.delete('/user/:username', this.protect, AuthController.restrictTo('admin'), this.deleteUser);
  };

  private mostReportedPath = (): void => {
    this.router.get(
      '/user-most-reported/',
      this.protect,
      AuthController.restrictTo('admin'),
      this.reported,
      this.getAllUsers
    );
  };
}

export default AdminRoutes;
