/* eslint-disable no-unused-vars */
import { Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  username: string;
  birth: string;
  gender: string;
  email: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
  role: string;
  acrive: boolean;
  following: Array<object>;
  correctPassword(candidatePassword: string, userPassword: string): boolean;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): any;
}

export default IUser;

/*
   Para conseguir usar os atributos e métodos de um new mongoose.Schema
  precisa criar uma interface com todos os atributos e métodos desse
  schema. Porém se só fizer isso e definir o tipo da model como sendo
  esse schema, perderá todas as funções do mongoose porque você vai
  estar sobrescrevendo o tipo padrão de todo schema que é - Document -
   Para conseguir utilizar todo o poder do Document e ter acesso
  aos atributos e métodos do schema, precisa criar uma interface com
  todos os atributos e métodos do schema e extender para o tipo Document
  do mongoose
*/
