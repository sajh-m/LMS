// Express 4 doesn't automatically catch rejected promises from async route
// handlers - without this, a thrown error inside an async controller would
// hang the request instead of reaching errorHandler.js.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
