const { ZodError } = require('zod');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const notFound = (req, _res, next) => next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details;

  if (err instanceof ZodError) {
    status = 400; code = 'VALIDATION_ERROR'; message = 'Invalid request';
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err instanceof AppError) {
    ({ status, code, message, details } = err);
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400; code = 'VALIDATION_ERROR'; message = 'Invalid identifier';
  } else if (err && err.code === 11000) {
    status = 409; code = 'DUPLICATE'; message = 'Resource already exists';
  } else if (err && err.type === 'entity.parse.failed') {
    status = 400; code = 'MALFORMED_JSON'; message = 'Malformed JSON body';
  } else if (err && err.type === 'entity.too.large') {
    status = 413; code = 'PAYLOAD_TOO_LARGE'; message = 'Request body too large';
  }

  if (status >= 500) req.log.error({ err }, 'unhandled error');
  res.status(status).json({ error: { code, message, details, requestId: req.id } });
};

module.exports = { notFound, errorHandler };
