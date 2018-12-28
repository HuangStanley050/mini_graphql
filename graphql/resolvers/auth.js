const User = require("../../models/user");
const bcrypt = require("bcryptjs");

module.exports = {
  createUser: args => {
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error("User exists already");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        const clone = Object.assign({}, result._doc);
        clone._id = result.id;
        clone.password = null;
        return clone;
      })
      .catch(err => {
        throw err;
      });
  }
};
