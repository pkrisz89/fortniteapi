const { Strategy, ExtractJwt } = require('passport-jwt');
const { getUserById } = require('../models/User');
const { secret } = require('../config');

module.exports = passport => {
  const opts = {};

  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = secret;
  passport.use(
    new Strategy(opts, (jwt_payload, done) => {
      getUserById(jwt_payload._id, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
};
