import { IRouter, Router } from 'express';

import ViewController from '../controllers/ViewController';

class ViewRoutes extends ViewController {
  public router: IRouter;

  public constructor() {
    super();
    this.router = Router();
    this.getHomePage();
    this.getSignUpPage();
    this.getLoginPage();
    this.getForgotPasswordPage();
  }

  private getHomePage = () => {
    this.router.get('/', this.getHome);
  };

  private getSignUpPage = () => {
    this.router.get('/criar-conta', this.getSignUp);
  };

  private getLoginPage = () => {
    this.router.get('/login', this.getLogin);
  };

  private getForgotPasswordPage = () => {
    this.router.get('/esqueci-a-senha', this.getForgotPassword);
  };
}

export default ViewRoutes;
