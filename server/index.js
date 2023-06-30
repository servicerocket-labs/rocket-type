const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });

// Keep track of all connected clients
let clients = [];

wss.on('connection', ws => {
  // Add the client to the client array
  clients.push(ws);
  console.log('New client connected!');
  console.log('Total clients connected:', clients.length);

  ws.on('message', message => {
    console.log('received:', message);

    let data;
    try {
      // Try to parse the message as JSON
      data = JSON.parse(message.toString());
    } catch (error) {
      console.error('Could not parse message as JSON:', error);
      return;
    }

    // Stringify the JSON data
    const dataString = JSON.stringify(data);

    // Broadcast the message to all clients
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(dataString);
      }
    });
  });

  ws.on('close', () => {
    // Remove the client from the array
    clients = clients.filter(client => client !== ws);
  });
});
