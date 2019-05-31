/**
 * NodeExpressAuthServerDB
 * -- A Node.js file that starts an Express server and uses buffers or callbacks to transmit web traffic
 *    as well as session authentication and connection to a MongoDB database
 * -- Adapted from various files and scripts written by Marc Wandschneider in Learning Node.js book
 * Created by Downs on 4/18/2019.
 */
var express = require("express");
var app = express();
app.get("/", function(req, res) {
res.send("Hello World!");
});
const port = process.env.PORT || 8080;
//port = 1337
app.listen(port, function() {
console.log("listening on port 1337!");
});
