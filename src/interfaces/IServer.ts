import { Application } from 'express';

export interface IServer {
  server: Application;
  DB: string;
  PORT: number;
}
