const loggedInOnly = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.send('Not logged in');
};

const loggedOutOnly = (req, res, next) => {
  if (req.isUnauthenticated()) next();
  else res.send('Not logged out');
};

module.exports = {
  loggedInOnly,
  loggedOutOnly
};
