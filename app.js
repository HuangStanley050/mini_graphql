const express = require("express");
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Event = require("./models/event");
const User = require("./models/user");
const { buildSchema } = require("graphql");
const app = express();
const port = process.env.PORT || 8081;
//const events = [];

app.use(bodyParser.json());

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
        console.log(event_clone);
        return event_clone;
      });
    })
    .catch(err => {
      throw err;
    });
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
       type Event {
          _id: ID!
          title:String!
          description:String!
          price:Float!
          date:String!
          creator:User!
         
       }
       
       type User {
         _id:ID!
         email:String!
         password:String
         createdEvents:[Event!]
       }
       
       input EventInput {
          title:String!
          description:String!
          price:Float!
          date:String!
       }
       
       input UserInput {
         email:String!
         password:String!
       }
    
       type RootQuery {
           events: [Event!]!
       }
       
       type RootMutation {
           createEvent(eventInput:EventInput): Event
           createUser(userInput:UserInput): User
       }
       
       schema {
           query: RootQuery
           mutation: RootMutation
       }
    `),
    rootValue: {
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
            return User.findById("5c186fda0d2dd70833de0584");
            /*const clone = Object.assign({}, res._doc);
            clone._id = res.id;
            return clone;*/
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
    },
    graphiql: true
  })
);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-cjli2.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(port, () => console.log("server running on: " + port));
  })
  .catch(err => console.log(err));
