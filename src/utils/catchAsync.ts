import { Request, Response, NextFunction } from 'express';

function catchAsync(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: unknown) => next(err));
  };
}

export default catchAsync;
/*
   CatchAsync é uma função que tem como objetivo receber como argumento
  todas as funções assíncronas do projeto inteiro. Essa função segue o
  princípio DRY (Do Not Repeat Yourself), porque usando ela, não precisamos
  escrever o bloco Try Catch para toda função assíncrona.
   Essa função recebe uma função assíncrona como argumento e retorna uma
  função anônima com a função que foi passada como argumento dentro do
  CatchAsync. Precisamos intermediar o CatchAsync e a chamada da função que
  passamos como argumento com a função anônima para que o código não seja
  executado logo de cara.
   Assim, CatchAsync retornará uma função anônima que dentro dela estará uma
  função assíncrona com o bloco catch já embutido. Se ao invés de retornar a
  função anônima, retornar a função assíncrona logo de cara, ela seria executada.

   Dado isso, se não tivéssemos envolvido fn dentro da função anônima
  que retornamos, fn seria executado imediatamente. Nós não queremos isso.
  Queremos express para executá-lo quando uma solicitação é feita. Então,
  envolvendo-o dentro da função anônima, não o estamos executando, porque
  não é uma chamada de função. Agora, como o Express está esperando uma função
  como argumento sempre que uma solicitação é feita, o Express só então
  executará codeblock e, portanto, executará fn. Agora, como lembramos,
  fn é uma função assíncrona, portanto, se a promessa retornada de fn não
  for resolvida, ela será rejeitada e deverá ser capturada, então anexaremos o .catch.
*/
