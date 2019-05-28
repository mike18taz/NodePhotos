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
app.listen(3000, function() {
console.log("listening on port 3000!");
});
