const express = require("express");
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");
const { buildSchema } = require("graphql");
const app = express();
const port = process.env.port || 8081;
const events = [];
app.use(bodyParser.json());
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
         
       }
       
       input EventInput {
          title:String!
          description:String!
          price:Float!
          date:String!
       }
    
       type RootQuery {
           events: [Event!]!
       }
       
       type RootMutation {
           createEvent(eventInput:EventInput): Event
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
              const _id = event.id;
              clone._id = _id;
              //console.log(clone);
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
          date: new Date(args.eventInput.date)
        });
        return event
          .save()
          .then(res => {
            const clone = Object.assign({}, res._doc);
            clone._id = res.id;
            return clone;
          })
          .catch(err => {
            console.log(err);
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
    app.listen(port, () => console.log("server running"));
  })
  .catch(err => console.log(err));
