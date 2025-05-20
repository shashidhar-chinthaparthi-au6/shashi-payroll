const logger = require('../utils/logger');
const responseHandler = require('../utils/responseHandler');

module.exports = (err, req, res, next) => {
  logger.error(err.stack);
  responseHandler.error(res, err.message || 'Internal Server Error');
}; 