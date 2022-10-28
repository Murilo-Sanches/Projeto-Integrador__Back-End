/* eslint-disable comma-dangle */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import ViewRouter from './routes/ViewRoutes';
import UserRouter from './routes/UserRoutes';
import AdminRouter from './routes/admin/AdminRoutes';

import AppError from './utils/AppError';
import globalErrorHandler from './utils/globalErrorHandler';

interface IReqPlus extends express.Request {
  requestTime?: string;
}

class App {
  protected app: express.Application;

  private ViewRouter = new ViewRouter().router;

  private UserRouter = new UserRouter().router;

  private AdminRouter = new AdminRouter().router;

  public constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares = (): void => {
    this.app.use(helmet());
    this.app.use(
      '/api',
      rateLimit({
        max: 30,
        windowMs: 1 * 60 * 60 * 1000,
        message: 'muitas requisições vindas do mesmo endereço IP, por favor tente novamente em 1 hora',
      })
    );
    this.app.use(
      cors({
        origin: 'http://localhost:3000',
        credentials: true,
      })
    );
    // this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.json());
    this.app.use(mongoSanitize()); // Previnir NoSQL limpando os $
    this.app.use(xss()); // Previnir HTML com JS vindo do usuário convertendo símbolos em entidades
    this.app.use(hpp()); // Remover parâmetros duplicados
    this.app.use(cookieParser()); // Pegar os cookies da req
    this.app.use((req: IReqPlus, res, next) => {
      req.requestTime = new Date().toLocaleTimeString('pt-br');
      console.log(req.requestTime);
      // console.log(req.headers);
      // console.log(req.cookies);
      // console.log(helmet);
      // console.log(helmet());
      next();
    });
  };

  private routes = (): void => {
    this.app.use('/', this.ViewRouter);
    this.app.use('/api/v1/users', this.UserRouter);
    this.app.use('/api/v1/restricted/administrators/dashboard', this.AdminRouter);
    this.app.all('*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
      next(new AppError(`Procurei em tudo e não consegui achar ${req.originalUrl}`, 404));
      /*
      Quando houver algo dentro do next(), o express automaticamente vai
      identificar que é um erro e pular todas as outras middlewares para
      chegar no Global Error Handling Middleware
      */
    });
    this.app.use(globalErrorHandler);
  };
}

export default App;
