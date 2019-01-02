const express = require("express");
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const mongoose = require("mongoose");
const isAuth = require("./middlewares/is-auth");
const graphQlSchema = require("./graphql/schemas/index.js");
const graphQlResolvers = require("./graphql/resolvers/index.js");
const app = express();
const port = process.env.PORT || 8081;

app.use(bodyParser.json());
app.use(isAuth);
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
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
