const statusCodes = require('./statusCodes');

exports.success = (res, data, message = 'Success', statusCode = statusCodes.OK) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

exports.error = (res, message = 'Error', statusCode = statusCodes.INTERNAL_SERVER_ERROR) => {
  res.status(statusCode).json({
    success: false,
    message
  });
}; 