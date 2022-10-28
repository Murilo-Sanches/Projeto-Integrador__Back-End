class APIFeatures {
  public query;

  public queryString;

  public constructor(query, queryString) {
    /* query é o objeto passada para ser executado no banco, ex: User.find(),
        queryString é a própria req.query do express  
    */
    this.query = query;
    this.queryString = queryString;
  }

  public filter = () => {
    /* Precisamos criar uma cópia exata da requisição, porque se mudar a variável que contém a requisição
      o valor original também mudará, afinal quando se cria uma variável que contém um valor não-primitivo
      essa variável é uma referência na memória para o objeto original e não uma cópia independente
      🠟 Desse jeito arrancamos todo o conteúdo da requisição e depois criamos um objeto a partir disso.
    */
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    /* Deletar, se houver na query as palavras bloqueadas, ForEach não espera por promessas, então async await
      para não barrar o event loop 🠟
    */
    excludedFields.forEach(async (blacklist) => await delete queryObj[blacklist]);
    // 🠟 Jeito com mongoose
    // const users = await User.find().where('username').equals('@murilo').where('age').equals(18);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // 🠟 User.find - armazenamos a query em si na variavel, se tivesse await a query seria executada
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  };

  public sort = () => {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-created_at');
    }
    return this;
  };

  public limit = () => {
    if (this.queryString.fields) {
      const fields: string = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      /* Não é uma boa prática remover o __v porque o mongoose/mongo usa internamente, mas podemos nunca
        🠟 mandar para o usuário
      */
      this.query = this.query.select('-__v');
    }
    return this;
  };

  public paginate = async () => {
    // 🠟 page=2&limit=10
    // 1 - 10 docs na página 1 e 11 - 20 ná página 2
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //   const numUsers = await User.countDocuments();
    //   if (skip >= numUsers) {
    //     next(new AppError('Essa página não existe', 400));
    //   }
    // }
    return this;
  };
}

export default APIFeatures;
