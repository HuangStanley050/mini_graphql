const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");
const bcrypt = require("bcryptjs");

const transformEvent = event => {
  const date = new Date(event._doc.date).toISOString();
  const event_clone = Object.assign({}, event._doc);
  event_clone._id = event.id;
  event_clone.creator = user.bind(this, event.creator);
  event_clone.date = date;
  //console.log(event_clone);
  return event_clone;
};

const user = userId => {
  return User.findById(userId)
    .then(user => {
      const _id = user.id;
      const clone_user = Object.assign({}, user._doc);
      clone_user._id = _id;
      clone_user.createdEvents = events.bind(this, user._doc.createdEvents);
      //console.log(clone_user);
      return clone_user;
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    /*const clone = Object.assign({}, event._doc);
    clone._id = event.id;
    clone.creator = user.bind(this, event.creator);
    return clone;*/

    return transformEvent(event);
  } catch (err) {
    throw err;
  }
};

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        /*const date = new Date(event._doc.date).toISOString();
        const event_clone = Object.assign({}, event._doc);
        event_clone._id = event.id;
        event_clone.creator = user.bind(this, event.creator);
        event_clone.date = date;
        
        return event_clone;*/
        return transformEvent(event);
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
          /*const clone = Object.assign({}, event._doc);
    
          const _id = event.id;
          clone._id = _id;
          const date = new Date(event._doc.date).toISOString();

          clone.creator = user.bind(this, event._doc.creator);
          clone.date = date;

        
          return clone;*/
          return transformEvent(event);
        });
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  },
  bookings: () => {
    return Booking.find()
      .then(bookings => {
        return bookings.map(booking => {
          const booking_clone = Object.assign({}, booking._doc);
          booking_clone._id = booking.id;
          booking_clone.createdAt = new Date(
            booking._doc.createdAt
          ).toISOString();
          booking_clone.updatedAt = new Date(
            booking._doc.updatedAt
          ).toISOString();
          booking_clone.user = user.bind(this, booking._doc.user);
          booking_clone.event = singleEvent.bind(this, booking._doc.event);
          return booking_clone;
        });
      })
      .catch(err => {
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
  },
  bookEvent: args => {
    return Event.findOne({ _id: args.eventId })
      .then(event => {
        const booking = new Booking({
          user: "5c186fda0d2dd70833de0584",
          event: event
        });
        return booking.save();
      })
      .then(res => {
        const clone = Object.assign({}, res._doc);
        clone._id = res.id;
        clone.createdAt = new Date(res._doc.createdAt).toISOString();
        clone.updatedAt = new Date(res._doc.updatedAt).toISOString();
        clone.user = user.bind(this, res._doc.user);
        clone.event = singleEvent.bind(this, res._doc.event);
        //console.log(clone);
        return clone;
      })
      .catch(err => {
        throw err;
      });
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      /*
      const clone = Object.assign({}, booking.event._doc);
      clone._id = booking.event.id;
      clone.creator = user.bind(this, booking.event._doc.creator);*/

      await Booking.deleteOne({ _id: args.bookingId });

      return transformEvent(booking.event);
    } catch (err) {
      throw err;
    }
  }
};
