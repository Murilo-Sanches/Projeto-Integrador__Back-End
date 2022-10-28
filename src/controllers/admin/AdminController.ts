import { Request, Response, NextFunction } from 'express';

import UserController from '../UserController';
import catchAsync from '../../utils/catchAsync';
import User from '../../models/schemas/User';
import AppError from '../../utils/AppError';
import APIFeatures from '../../utils/APIFeatures';

class AdminController extends UserController {
  protected getDashboard = (req: Request, res: Response) => {
    this.req = req;
    this.res = res;
    this.res.send('DASHBOARD DE ADM');
  };

  protected reported = (req: Request, res: Response, next: NextFunction) => {
    req.query.limit = '10';
    req.query.sort = '-reports,name';
    req.query.fields = 'name,username,location,reports,following,created_at';
    next();
  };

  protected getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    this.req = req;
    this.res = res;
    // async function APIFeatureS() {
    //   /*
    //   // pink Filter
    //   /* Precisamos criar uma cópia exata da requisição, porque se mudar a variável que contém a requisição
    //   o valor original também mudará, afinal quando se cria uma variável que contém um valor não-primitivo
    //   essa variável é uma referência na memória para o objeto original e não uma cópia independente
    //   🠟 Desse jeito arrancamos todo o conteúdo da requisição e depois criamos um objeto a partir disso.
    // */
    //   const queryObj = { ...this.req.query };
    //   const excludedFields = ['page', 'sort', 'limit', 'fields'];
    //   /* Deletar, se houver na query as palavras bloqueadas, ForEach não espera por promessas, então async await
    //   para não barrar o event loop 🠟
    // */
    //   excludedFields.forEach(async (blacklist) => await delete queryObj[blacklist]);
    //   // 🠟 Jeito com mongoose
    //   // const users = await User.find().where('username').equals('@murilo').where('age').equals(18);
    //   let queryStr = JSON.stringify(queryObj);
    //   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //   // 🠟 User.find - armazenamos a query em si na variavel, se tivesse await a query seria executada
    //   let query = User.find(JSON.parse(queryStr));
    //   // pink Filter
    //   // purple Sort
    //   if (req.query.sort) {
    //     const sortBy = req.query.sort.split(',').join(' ');
    //     query = query.sort(sortBy);
    //   } else {
    //     query = query.sort('-created_at');
    //   }
    //   // purple Sort
    //   // red Limit
    //   if (req.query.fields) {
    //     const fields: string = req.query.fields.split(',').join(' ');
    //     query = query.select(fields);
    //   } else {
    //     /* Não é uma boa prática remover o __v porque o mongoose/mongo usa internamente, mas podemos nunca
    //     🠟 mandar para o usuário
    //   */
    //     query = query.select('-__v');
    //   }
    //   // red Limit
    //   // yellow Pagination
    //   // 🠟 page=2&limit=10
    //   // 1 - 10 docs na página 1 e 11 - 20 ná página 2
    //   const page = req.query.page * 1 || 1;
    //   const limit = req.query.limit * 1 || 100;
    //   const skip = (page - 1) * limit;
    //   query = query.skip(skip).limit(limit);
    //   if (req.query.page) {
    //     const numUsers = await User.countDocuments();
    //     if (skip >= numUsers) {
    //       next(new AppError('Essa página não existe', 400));
    //     }
    //   }
    //   // yellow Pagination
    //   const users = await query;
    // }
    const features = new APIFeatures(User.find(), this.req.query).filter().sort().limit().paginate();
    console.log(features);
    const users = await (await features).query;
    console.log(users);
    this.res.status(200).json({
      status: 'success',
      lenght: users.length,
      data: { users },
    });
  });

  protected getOneUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    this.req = req;
    this.res = res;
    const { username } = this.req.params;
    const user = await User.findOne({ username });
    this.res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  protected updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    this.req = req;
    this.res = res;
    const { id } = this.req.params;
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    this.res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  protected deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    this.req = req;
    this.res = res;
    const { username } = this.req.params;
    await User.findOneAndDelete({ username });
    this.res.status(204).json({
      status: 'success',
      data: {},
    });
  });

  protected AggregatePipeline = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await User.aggregate([
      // Cada objeto é um estágio
      {
        // filtrar os documentos
        $match: { commentLikes: { $gte: 80000 }, commentDislikes: { $lte: 1000 } },
      },
      {
        // Agrupar por _id, quero null agora para calcular as estatísticas dos comentários
        $group: {
          // _id: '$tags',
          _id: null,
          numberOfPersonPosts: { $sum: 1 },
          avgPersonLikes: { $avg: '$commentLikes' },
          avgPersonDislikes: { $avg: '$commentDislikes' },
        },
      },
      {
        // Ordenar os resultados
        $sort: { avgPersonLikes: 1 },
      },
      // Outros úteils: $unwind, $addFields, $project, $limit
      // https://www.mongodb.com/docs/manual/reference/operator/aggregation/
    ]);
  });
}

export default AdminController;
