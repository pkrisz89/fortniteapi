const {User} = require('../../models/User');

class FriendsService {
  findAndDelete(req) {
    return User
      .findById(req.session.user.id)
      .then(user => {
        const updatedList = user
          .friends
          .filter(friend => friend.toString() !== req.params.id);

        return user.update({friends: updatedList});
      });
  }

  getAllFriends(req) {
    return User
      .findById(req.session.user.id)
      .then(user => Promise.all(user.friends.map(id => User.findById(id).then(user => ({id: user._id, username: user.username, platform: user.platform})))));
  }

  addFriend(self, user, res) {
    const alreadyFriends = self
      .friends
      .some(friend => friend.toString() === user._id.toString());

    if (alreadyFriends) {
      res.json({msg: 'already friends'});
    } else {

      self
        .update({
          $push: {
            friends: user._id
          }
        })
        .then(() => {
          res.json({msg: 'friend added'});
        })
        .catch(err => {
          throw err;
        });
    }
  }

  addFriendAndRegister(self, username, platform, res) {
    const newUser = new User({username, platform});
    newUser
      .save()
      .then(user => {
        self
          .update({
            $push: {
              friends: user._id
            }
          })
          .then(() => {
            res.json({msg: 'friend added'});
          })
          .catch(err => {
            throw err;
          });
      });
  }
}

module.exports = new FriendsService();
