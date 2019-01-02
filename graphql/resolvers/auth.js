const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { secretToken } = require("../../tokenSecret");

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
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User Doesn't exits");
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error("Password is not correct");
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secretToken,
      { expiresIn: "1h" }
    );
    return {
      userId: user.id,
      token: token,
      tokenExpiration: 1
    };
  }
};
