const { dateToString } = require("../../helper/date");
const Event = require("../../models/event");
const User = require("../../models/user");
const { user, transformEvent } = require("./merge");

// const transformEvent = event => {
//   const date = dateToString(event._doc.date);
//   const event_clone = Object.assign({}, event._doc);
//   event_clone._id = event.id;
//   event_clone.creator = user.bind(this, event.creator);
//   event_clone.date = date;
//   //console.log(event_clone);
//   return event_clone;
// };

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

  createEvent: (args, req) => {
    if (!req.isAuth) {
      throw new Error("Not authenticated");
    }
    //use req.userId from the middleware instead of hard coded in
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      //date: new Date(args.eventInput.date),
      date: dateToString(args.eventInput.date),
      creator: req.userId
    });
    let createdEvent;

    return event
      .save()
      .then(res => {
        // createdEvent = Object.assign({}, res._doc);
        // createdEvent.creator = user.bind(this, res._doc.creator);
        createdEvent = transformEvent(res);
        return User.findById(req.userId);
      })
      .then(user => {
        if (!user) {
          throw new Error("User doesn't exist");
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then(() => createdEvent)
      .catch(err => {
        console.log(err);
        throw err;
      });
  }
};
