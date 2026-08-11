/** Every backoff ladder in the project waits with this one. */
export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
