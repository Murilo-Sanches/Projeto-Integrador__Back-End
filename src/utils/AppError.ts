import IAppError from '../interfaces/IAppError';

class AppError extends Error implements IAppError {
  status: any;

  statusCode: number;

  isOperacional: boolean;

  constructor(message: string, statusCode: number) {
    /*
      classe Error aceita apenas um argumento que é a string do erro,
      ao chamar o super() do construtor pai com a message gerada pela classe
      ela vai ser automaticamente a message
    */
    super(message);
    /*
      Usar super() no AppError que herda a classe Error para ter
      acesso ao construtore da classe pai new Error('mensagem')
    */
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperacional = true;
    /*
      Se o erro começar com 4 vai ser uma requisição mal formada,
      se começar com 500 o status do erro vai ser error, que indica
      erro interno do servidor (alguma coisa deu errada)
    */
    Error.captureStackTrace(this, this.constructor);
    /*
      Stack mostra onde o erro aconteceu, para evitar isso, apontamos
      para essa classe e para esse constructor
    */
  }
}

export default AppError;
