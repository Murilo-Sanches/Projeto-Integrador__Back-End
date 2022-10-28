/* eslint-disable comma-dangle */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import IUser from '../interfaces/IUser';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Você precisa preencher seu nome'],
    },
    username: {
      type: String,
      required: [true, 'Por favor escolha um nome de usuário'],
      unique: true,
      maxlength: [20, 'Apenas nomes de usuário com até 20 caracteres são permitidos'],
      minlength: [6, 'Por favor escolha um nome de usuário maior que 6 caracteres'],
      trim: true,
    },
    birth: {
      type: String,
      required: [true, 'Insira uma data de nascimento'],
    },
    gender: {
      type: String,
      enum: ['Masculino', 'Feminino', 'Cisgênero', 'Transgênero', 'Agênero', 'Não-binário'],
      required: [true, 'Por favor selecione como você se identifica'],
    },
    email: {
      type: String,
      required: [true, 'Você precisa especificar um email'],
      unique: true,
      lowercase: true,
      select: false,
    },
    password: {
      type: String,
      required: [true, 'Preencha a senha'],
      maxlength: [32, 'Crie uma senha com até 32 caracteres'],
      minlength: [6, 'Crie uma senha maior que 6 caracteres'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Confirme a sua senha'],
      /*
      Validate só funciona em CREATE e SAVE
    */
      validate: {
        validator(password: string) {
          return password === this.password;
        },
        message: 'Senhas não são iguais',
      },
      select: false,
    },
    role: {
      type: String,
      enum: ['common-user', 'admin'],
      default: 'common-user',
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    banned: {
      type: Boolean,
      default: false,
      select: false,
    },
    profile_picture: {
      type: String,
      default: 'ppdefault.jpg',
    },
    background_photo: {
      type: String,
      default: 'bpdefault.jpg',
    },
    location: {
      // GeoJSON // Latitude e Longitude 38.720958, -9.140571
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    biography: {
      type: String,
      maxlength: [150, 'A biografia do seu perfil não pode ultrapassar 150 caracteres'],
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'busy', 'invisible'],
      default: 'online',
    },
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    interests: [String],
    password_changed_at: { type: Date, select: false },
    password_reset_token: { type: String, select: false },
    password_reset_expires: { type: Date, select: false },
    created_at: { type: Date, default: Date.now() },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// 🠟 Virtuals permitem que você modifique os dados do schema sem de fato guardar as informações no schema
// userSchema.virtual('domain').get(function () {
//   return this.email.slice(this.email.indexOf('@') + 1);
// });
/* Middlewares que ocorrem antes ou depois de um certo evento. pre: (antes) evento: (save) 
  🠟 SÓ FUNCIONA EM .SAVE() e .CREATE(). this aponta para o documento sendo processado, por isso document middleware 
*/
userSchema.pre('save', function (next) {
  // console.log(this);
  next();
});
// eslint-disable-next-line func-names
userSchema.pre('save', async function (next): Promise<void> {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  /*
    PasswordConfirm undefined porque esse campo só serva pra validar
    no signup, não precisa manter no banco de dados esse campo
  */
  this.passwordConfirm = undefined;
  return next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // Menos 1 segundo porque a criação do token é mais rápida
  this.password_changed_at = Date.now() - 1000;
  // console.log(this.password_changed_at.toLocaleTimeString('pt-br'));
  next();
});
/* /^find/ todos os comandos começando com find
 */
userSchema.pre(/^find/, async function (next) {
  this.find({ $active: { $ne: true } });
  next();
});
userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { $active: { $ne: true } } });
  // console.log(this)
  // console.log(this.pipeline)
  next();
});
userSchema.pre(/^find/, function (next) {
  // Query middleware, this não aponta para o documento e sim para a query em questão
  this.find({ active: { $ne: false } });
  next();
});
/*
  🠟 Post middleware ocorre depois de todas as outras middlewares "pre" terem sido executadas,
    não temos this, e sim o próprio documento finalizado, além do next claro. 
*/
userSchema.post('save', async function (doc, next) {
  // console.log(doc);
  next();
});
// eslint-disable-next-line func-names
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  /* return await bcrypt.compare(candidatePassword, userPassword); redundante */
  return bcrypt.compare(candidatePassword, userPassword);
  /* https://eslint.org/docs/latest/rules/no-return-await */
};
// eslint-disable-next-line func-names
userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const passwordChangedMS = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < passwordChangedMS;
  }
  /* False significa que a senha não mudou */
  return false;
};
// eslint-disable-next-line func-names
userSchema.methods.createPasswordResetToken = function (): any {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000;
  this.save({ validateBeforeSave: false });
  return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
