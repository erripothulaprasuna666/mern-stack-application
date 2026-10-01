// Wraps async controller functions so any error goes to our error handler
const asyncHandler = (fn) => (req, res, next) => {
 Promise.resolve(fn(req, res, next)).catch(next);
};
module.exports = asyncHandler;

