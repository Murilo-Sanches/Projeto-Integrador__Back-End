import { Application } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import App from './App';

class Server extends App {
  private server: Application;

  private DBAccess: string;

  private port: number;

  public constructor(PORT: number) {
    super();
    this.configurations(PORT);
    // this.server = new App().app;
    this.server = this.app;
    this.connection();
    this.server.listen(this.port);
  }

  private connection = (): void => {
    this.DBAccess = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    mongoose
      .connect(this.DBAccess, {})
      .then(() => console.log('\x1b[32m%s\x1b[0m', 'Conexão com o banco de dados estabelecida'))
      .catch((err) => console.log(err));
  };

  private configurations = (PORT: number = 3000): void => {
    dotenv.config({ path: '.env' });
    this.port = PORT;
  };
}

function start(application: any) {
  const server = application;
  console.log('\x1b[35m%s\x1b[0m', 'Aplicação iniciada');
  return server;
}

start(new Server(5050));
