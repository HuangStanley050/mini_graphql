const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.port || 8081;
app.use(bodyParser.json());

app.listen(port, () => console.log("server running"));
