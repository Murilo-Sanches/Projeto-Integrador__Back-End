import { Request, Response } from 'express';

class ViewController {
  private req: Request;

  private res: Response;

  protected getHome = (req: Request, res: Response): void => {
    // console.log(req.ip);
    this.req = req;
    this.res = res;
    console.log(this.req.headers.authorization);
    this.res.json({ data: '<h1>Homepage</h1>' });
  };

  protected getSignUp = (req: Request, res: Response): void => {
    this.req = req;
    this.res = res;
    this.res.send('<h1>SignUp</h1>');
  };

  protected getLogin = (req: Request, res: Response): void => {
    this.req = req;
    this.res = res;
    this.res.send('<h1>Login</h1>');
  };

  protected getForgotPassword = (req: Request, res: Response): void => {
    this.req = req;
    this.res = res;
    this.res.send('<h1>Esqueceu a senha?</h1>');
  };
}

export default ViewController;
