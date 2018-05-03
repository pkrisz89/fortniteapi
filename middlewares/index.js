const sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    next();
  } else {
    res.status(500).send('UNAUTHORIZED!');
  }
};

module.exports = sessionChecker;
