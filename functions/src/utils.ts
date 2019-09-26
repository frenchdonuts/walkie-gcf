export function executeAllLogErrors(tasks: Promise<any>[]) {
  return Promise.all(tasks.map(t => t.catch(e => console.log(e))))
}

export function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}