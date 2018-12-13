const express = require("express");
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const mongoose = require("mongoose");
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
        return events;
      },
      createEvent: args => {
        const event = {
          _id: Math.random().toString(),
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date().toString()
        };
        events.push(event);
        return event;
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
