const express = require("express");
const app = express();
var http = require('http').createServer(app);
const io = require("socket.io")(http);
const port = parseInt(Math.random() * 3000 + 4000);
const max = require("max-api")

var dict = {};
var dictName;
var lastDict = {};

http.listen(port, () => {
  console.log('listening on *:' + port);
});
app.use(express.static("app"));
io.on('connection', (socket) => {
  loadDict(dictName);
  console.log('a user connected');
  socket.on("edit", (data) => {
    dict = data;
    if (dictName != undefined) {
      max.setDict(dictName, dict);
	  max.outlet(["changed"]);
    }
  });
  socket.on("clicked", (data) => {
    max.outlet(["clicked", data[0]])
  });
});

max.addHandler("set", (arg1) => {

  dictName = arg1;
  loadDict(dictName);
});

function loadDict(dictName) {
  if (dictName != undefined) {
    max.getDict(dictName).then((data) => {
      dict = data
      lastDict = dict;
      io.emit("loadJSON", dict);
      io.emit("setName", dictName);
      max.outlet(["set", dictName]);

    })
  }
}

max.addHandler("replace", (key, ...args) => {

});

max.addHandler("refresh", () => {
  loadDict(dictName)
});

max.addHandler("bang", () => {
  loadDict(dictName)
  max.outlet(["port", port]);
});

max.outlet(["port", port]);
max.outlet(["ready", "bang"]);