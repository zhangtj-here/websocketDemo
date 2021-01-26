// Websoket server
const WebSocket = require("ws");

let group = {};
let timeInterval = 5000; // 定时去检测客户端的时长

let oldWs = null;

const wss = new WebSocket.Server({
  port: 8000
});

wss.on('connection', function (ws) {
  // 初始化客户端的连接状态量
  ws.isAlive = true;



  // console.log(oldWs === ws);
  oldWs = ws;
  console.log("a new client is connected")
  ws.on('message', function (data) {
    let dataObj = JSON.parse(data);

    /* // 鉴权机制 -> 检验token的有效性
    if (dataObj.event === "auth") {
      // 拿到token
    } */

    if (dataObj.event === "heartbeat" && dataObj.message === "pong") {
      ws.isAlive = true;
      return;
    }
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



const interval = setInterval(function () {
  // 遍历所有的客户端，发送一个ping消息
  // 检测是否有返回，如果没有返回或者超时则主动断开
  wss.clients.forEach(function each(ws) {
    if (!ws.isAlive) {
      console.log("client is disconneted!");
      group[ws.roomId]--;
      return ws.terminate();
    }

    ws.isAlive = false;
    // 主动发送ping/pong 消息
    // 客户端返回消息之后，主动设置isAlive的状态
    ws.send(JSON.stringify({
      event: 'heartbeat',
      message: "ping"
    }))
  })
}, timeInterval)