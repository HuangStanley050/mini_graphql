const { dateToString } = require("../../helper/date");
const Event = require("../../models/event");
const User = require("../../models/user");
const { user } = require("./merge");

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

  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      //date: new Date(args.eventInput.date),
      date: dateToString(args.eventInput.date),
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
  }
};
