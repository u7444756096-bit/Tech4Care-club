const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname)));

let onlineUsers = new Set();

wss.on('connection', (ws) => {
  // Generate a unique ID for this user
  const userId = Date.now() + Math.random();
  onlineUsers.add(userId);

  console.log(`User connected. Online users: ${onlineUsers.size}`);
  
  // Broadcast the current count to all connected clients
  broadcastOnlineCount();

  // Handle messages from clients
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });

  // Handle client disconnect
  ws.on('close', () => {
    onlineUsers.delete(userId);
    console.log(`User disconnected. Online users: ${onlineUsers.size}`);
    broadcastOnlineCount();
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
    onlineUsers.delete(userId);
    broadcastOnlineCount();
  });
});

function broadcastOnlineCount() {
  const count = onlineUsers.size;
  const message = JSON.stringify({ type: 'online-count', count: count });
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
