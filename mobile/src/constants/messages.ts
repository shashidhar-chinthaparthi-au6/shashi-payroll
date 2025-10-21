const MSG = Object.freeze({
  // Auth
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_EMAIL_IN_USE: 'Email already registered',
  AUTH_REGISTER_SUCCESS: 'Registration successful',
  AUTH_LOGIN_SUCCESS: 'Login successful',
  AUTH_UNAUTHORIZED: 'Unauthorized',

  // User/Profile
  USER_NOT_FOUND: 'User not found',
  USER_UPDATED: 'User profile updated successfully',
  EMPLOYEE_NOT_FOUND: 'Employee profile not found',
  EMPLOYEE_UPDATED: 'Employee profile updated successfully',

  // Generic
  BAD_REQUEST: 'Bad request',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal Server Error',
});

export default MSG;
