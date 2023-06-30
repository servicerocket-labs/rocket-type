const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });

// Store clients in an object instead of an array, using channels as keys
let clients = {};

wss.on('connection', (ws, req) => {
  // Get channel from the URL
  let channel = req.url.substr(1);  // remove the leading '/'

  // Initialize the channel array if it doesn't exist yet
  if(!clients[channel]) {
    clients[channel] = [];
  }

  // Add the client to the channel
  clients[channel].push(ws);
  console.log('New client connected!');
  console.log('Total clients connected in channel:', channel)
  console.log(clients.length);

  ws.on('message', message => {
    console.log(`Received from ${channel}: ${message}`);

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

    // Broadcast the message to all clients in the same channel
    clients[channel].forEach(client => {
      if(client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(dataString);
      }
    });
  });

  ws.on('close', () => {
    // Remove the client from the channel
    clients[channel] = clients[channel].filter(client => client !== ws);
  });

});
