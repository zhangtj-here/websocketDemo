// Websoket server
const WebSocket = require("ws");

let group = {};

let oldWs = null;

const wss = new WebSocket.Server({
  port: 8000
});

wss.on('connection', function (ws) {
  // console.log(oldWs === ws);
  oldWs = ws;
  console.log("a new client is connected")
  ws.on('message', function (data) {
    let dataObj = JSON.parse(data);
    if (dataObj.name) {
      ws.name = dataObj.name;
    }

    if (typeof ws.roomId === "undefined" && dataObj.roomId) {
      ws.roomId = dataObj.roomId;
      if (typeof group[ws.roomId] === "undefined") {
        group[ws.roomId] = 1;
      } else {
        group[ws.roomId]++;
      }
    }


   



    dataObj.num = group[ws.roomId]; //wss.clients.size;
    // dataObj.roomId = ws.roomId;
    wss.clients.forEach(function each(client) {
      // 广播给非自己的其他客户端
      if (client.readyState === WebSocket.OPEN && client.roomId === ws.roomId) {
        client.send(JSON.stringify(dataObj));
      }  
      // if (client.readyState === WebSocket.OPEN) {
      //   client.send(JSON.stringify(dataObj));
      // }
    });
  })
  // ws.send("Message from server!");

  ws.on('close', function () {
    // console.log('one client is closed :' + ws.name);
    if (ws.name !== undefined) {
      group[ws.roomId]--;
      wss.clients.forEach(function each(client) {
        // 广播给非自己的其他客户端
        if (client !== ws && client.readyState === WebSocket.OPEN && ws.roomId === client.roomId) {
          client.send(JSON.stringify({
            name: ws.name,
            event: "logout",
            num: group[ws.roomId],
            // roomId: ws.roomId
          }));
        }
      });
    }
  })

})