// Websoket server
const Websocket = require("ws");

const wss = new Websocket.Server({
  port: 8000
});

wss.on('connection', function (ws) {
  ws.on('message', function (msg) {
    console.log(msg);
  })
  ws.send("Message from server!");

})