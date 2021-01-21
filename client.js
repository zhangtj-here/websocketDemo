// Websoket客户端
const Websocket = require('ws');

const wss = new Websocket('ws://127.0.0.1:8000');

wss.on('open', function () {
  for(let i = 0; i < 3; i++) {
    wss.send("hello from client: " + i);
  }
  
})

wss.on('message', function(msg) {
  console.log(msg);
})