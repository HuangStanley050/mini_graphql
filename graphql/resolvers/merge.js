const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../helper/date");

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

const transformEvent = event => {
  const date = dateToString(event._doc.date);
  const event_clone = Object.assign({}, event._doc);
  event_clone._id = event.id;
  event_clone.creator = user.bind(this, event.creator);
  event_clone.date = date;
  //console.log(event_clone);
  return event_clone;
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

exports.user = user;
exports.events = events;
exports.singleEvent = singleEvent;
exports.transformEvent = transformEvent;
