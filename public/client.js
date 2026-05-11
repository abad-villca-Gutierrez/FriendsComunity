let socket = null;
let datosUsuario = null;

// Elementos DOM
const loginDiv = document.getElementById('login');
const chatDiv = document.getElementById('chat');
const nombreUsuarioSpan = document.getElementById('nombreUsuario');
const areaMensajes = document.getElementById('areaMensajes');
const mensajeInput = document.getElementById('mensaje');
const listaUsuariosDiv = document.getElementById('listaUsuarios');
const contadorUsuariosSpan = document.getElementById('contadorUsuarios');

// Botones
const btnNombrePropio = document.getElementById('btnNombrePropio');
const btnGoogle = document.getElementById('btnGoogle');
const btnEnviar = document.getElementById('btnEnviar');

// Función para generar nombre aleatorio
function generarNombreAleatorio() {
  const adjetivos = ['Feliz', 'Tierno', 'Astuto', 'Valiente', 'Sabio', 'Amable'];
  const sustantivos = ['Lobo', 'Águila', 'Tigre', 'Delfin', 'León', 'Panda'];
  const num = Math.floor(Math.random() * 1000);
  return `${adjetivos[Math.floor(Math.random() * adjetivos.length)]}${sustantivos[Math.floor(Math.random() * sustantivos.length)]}_${num}`;
}

// Conectar WebSocket
function conectarWebSocket(nombre, tipoLogin) {
  datosUsuario = { nombre: nombre, tipoLogin: tipoLogin };
  
  const protocolo = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(`${protocolo}//${window.location.host}`);
  
  socket.onopen = () => {
    socket.send(JSON.stringify(datosUsuario));
    loginDiv.style.display = 'none';
    chatDiv.style.display = 'grid';
    nombreUsuarioSpan.textContent = nombre;
    mensajeInput.focus();
  };
  
  socket.onmessage = (evento) => {
    const datos = JSON.parse(evento.data);
    
    if (datos.tipo === 'chat') {
      mostrarMensajeChat(datos.usuario, datos.mensaje, datos.color);
    } 
    else if (datos.tipo === 'sistema') {
      mostrarMensajeSistema(datos.mensaje);
    }
    else if (datos.tipo === 'historial') {
      datos.mensajes.forEach(msg => {
        if (msg.tipo === 'chat') mostrarMensajeChat(msg.usuario, msg.mensaje, msg.color);
        else if (msg.tipo === 'sistema') mostrarMensajeSistema(msg.mensaje);
      });
    }
    else if (datos.tipo === 'usuarios_en_linea') {
      actualizarListaUsuarios(datos.usuarios);
    }
  };
  
  socket.onerror = () => mostrarMensajeSistema('❌ Error de conexión');
  socket.onclose = () => {
    mostrarMensajeSistema('🔌 Conexión perdida. Recarga la página.');
    chatDiv.style.display = 'none';
    loginDiv.style.display = 'block';
  };
}