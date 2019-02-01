const { dateToString } = require("../../helper/date");
const Booking = require("../../models/booking");
const Event = require("../../models/event");
const { user, singleEvent } = require("./merge");

const transformBooking = booking => {
  const booking_clone = Object.assign({}, booking._doc);
  booking_clone._id = booking.id;
  /*booking_clone.createdAt = new Date(
            booking._doc.createdAt
          ).toISOString();*/
  booking_clone.createdAt = dateToString(booking._doc.createdAt);
  /*booking_clone.updatedAt = new Date(
            booking._doc.updatedAt
          ).toISOString();*/
  booking_clone.updatedAt = dateToString(booking._doc.updatedAt);
  booking_clone.user = user.bind(this, booking._doc.user);
  booking_clone.event = singleEvent.bind(this, booking._doc.event);
  return booking_clone;
};

const transformEvent = event => {
  const date = dateToString(event._doc.date);
  const event_clone = Object.assign({}, event._doc);
  event_clone._id = event.id;
  event_clone.creator = user.bind(this, event.creator);
  event_clone.date = date;
  //console.log(event_clone);
  return event_clone;
};

module.exports = {
  bookings: (args, req) => {
    if (!req.isAuth) {
      throw new Error("Not authenticated");
    }
    return Booking.find({ user: req.userId })
      .then(bookings => {
        return bookings.map(booking => {
          return transformBooking(booking);
        });
      })
      .catch(err => {
        throw err;
      });
  },

  bookEvent: (args, req) => {
    if (!req.isAuth) {
      throw new Error("Not authenticated");
    }
    return Event.findOne({ _id: args.eventId })
      .then(event => {
        const booking = new Booking({
          user: req.userId,
          event: event
        });
        return booking.save();
      })
      .then(res => {
        /*const clone = Object.assign({}, res._doc);
        clone._id = res.id;
        //clone.createdAt = new Date(res._doc.createdAt).toISOString();
        clone.createdAt = dateToString(res._doc.createdAt);
        //clone.updatedAt = new Date(res._doc.updatedAt).toISOString();
        clone.updatedAt = dateToString(res._doc.updatedAt);
        clone.user = user.bind(this, res._doc.user);
        clone.event = singleEvent.bind(this, res._doc.event);*/

        return transformBooking(res);
      })
      .catch(err => {
        throw err;
      });
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Not authenticated");
    }
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
