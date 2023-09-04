//attempt: time in ms
export const retryPolicy = {
  1: 2 * 60 * 1000,
  2: 6 * 60 * 1000,
  3: 30 * 60 * 1000,
  4: 1 * 60 * 60 * 1000,
  5: 5 * 50 * 60 * 1000,
  6: 1 * 24 * 60 * 60 * 1000,
  7: 2 * 24 * 60 * 60 * 1000,
};
