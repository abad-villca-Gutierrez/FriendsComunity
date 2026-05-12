const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

// historial de mensajes 
const HISTORIAL_FILE = 'mensajes.json';
let historial = [];

if (fs.existsSync(HISTORIAL_FILE)) {
  const data = fs.readFileSync(HISTORIAL_FILE, 'utf8');
  historial = JSON.parse(data);
}
//se guardara los ultimos 100 mensajes del chat
function guardarEnHistorial(mensaje) {
  historial.push(mensaje);
  if (historial.length > 100) {
    historial = historial.slice(-100);
  }
  fs.writeFileSync(HISTORIAL_FILE, JSON.stringify(historial, null, 2));
}

// colores aleatorios para cada usuario que se una al chat
const colores = [
  '#FF6B6B', '#4ECDC4', '#ba55d3', '#fa8072', '#008080',
  '#DDA0DD', '#3340b6', '#F7B731', '#00ff00', '#ffff00'
];

const clients = new Map(); 

// para ver lista de usuarios conectados visible para todos
function broadcastUsuariosEnLinea() {
  const usuariosLista = Array.from(clients.values()).map(u => ({
    nombre: u.nombre,
    color: u.color
  }));
  
  broadcast({
    tipo: 'usuarios_en_linea',
    usuarios: usuariosLista
  });
}

wss.on('connection', (ws) => {
  let userData = null;

  ws.on('message', (data) => {
    const mensaje = data.toString();
    
    if (userData === null) {
      try {
        const loginData = JSON.parse(mensaje);
        userData = {
          nombre: loginData.nombre,
          color: colores[Math.floor(Math.random() * colores.length)],
          tipoLogin: loginData.tipoLogin
        };
        clients.set(ws, userData);
        
        // Enviar historial al nuevo usuario
        ws.send(JSON.stringify({
          tipo: 'historial',
          mensajes: historial
        }));
        
        // Notificar a todos que alguien se unió 
        broadcast({
          tipo: 'sistema',
          mensaje: ` ${userData.nombre} se unió al chat`
        });
        
        // Enviar bienvenida personal 
        ws.send(JSON.stringify({
          tipo: 'sistema',
          mensaje: `✅ Bienvenido ${userData.nombre}`
        }));
        
        // Actualizar lista de usuarios en línea
        broadcastUsuariosEnLinea();
        
      } catch(e) {
        console.log('Error:', e);
      }
    } 
    else {
      const mensajeChat = {
        tipo: 'chat',
        usuario: userData.nombre,
        color: userData.color,
        mensaje: mensaje
      };
      
      guardarEnHistorial(mensajeChat);
      broadcast(mensajeChat);
    }
  });

  ws.on('close', () => {
    if (clients.has(ws)) {
      const data = clients.get(ws);
      broadcast({
        tipo: 'sistema',
        mensaje: `🌐 ${data.nombre} salió del chat`
      });
      clients.delete(ws);
      broadcastUsuariosEnLinea();
    }
  });
});

function broadcast(data) {
  const mensaje = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(mensaje);
    }
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
