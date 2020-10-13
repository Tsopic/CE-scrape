export default <TResult>(ms: number, result?: TResult) =>
  new Promise((resolve) => setTimeout(() => resolve(result), ms));
