const bcrypt = require('bcrypt');
const { RegisteredUser, User } = require('../../models/User');

class AuthenticationService {
  getUserByEmail(email) {
    const query = { email };
    return RegisteredUser.findOne(query);
  }

  comparePassword(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
      if (err) throw err;
      callback(null, isMatch);
    });
  }

  doesUserExist(username) {
    const query = { username };
    return User.findOne(query);
  }
}

module.exports = new AuthenticationService();
