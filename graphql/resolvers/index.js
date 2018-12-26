const Event = require("../../models/event");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

const user = userId => {
  return User.findById(userId)
    .then(user => {
      const _id = user.id;
      const clone_user = Object.assign({}, user._doc);
      clone_user._id = _id;
      clone_user.createdEvents = events.bind(this, user._doc.createdEvents);
      return clone_user;
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        const event_clone = Object.assign({}, event._doc);
        event_clone._id = event.id;
        event_clone.creator = user.bind(this, event.creator);
        //console.log(event_clone);
        return event_clone;
      });
    })
    .catch(err => {
      throw err;
    });
};

module.exports = {
  events: () => {
    return Event.find()
      .then(events => {
        return events.map(event => {
          //const newObj = {};
          const clone = Object.assign({}, event._doc);
          //const creator_clone = Object.assign({}, event._doc.creator._doc);
          const _id = event.id;
          clone._id = _id;

          //const creator_id = clone.creator.id;
          //creator_clone._id = creator_id;
          //console.log(creator_id.toString());
          //console.log(event._doc);
          clone.creator = user.bind(this, event._doc.creator);

          //console.log(creator_clone);
          return clone;
        });
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  },
  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5c186fda0d2dd70833de0584"
    });
    let createdEvent;

    return event
      .save()
      .then(res => {
        createdEvent = Object.assign({}, res._doc);
        createdEvent.creator = user.bind(this, res._doc.creator);
        return User.findById("5c186fda0d2dd70833de0584");
      })
      .then(user => {
        if (!user) {
          throw new Error("User doesn't exist");
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then(result => createdEvent)
      .catch(err => {
        console.log(err);
        throw err;
      });
  },
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
