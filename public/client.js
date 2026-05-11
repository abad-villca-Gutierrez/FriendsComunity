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

// Actualizar lista de usuarios en línea
function actualizarListaUsuarios(usuarios) {
  contadorUsuariosSpan.textContent = usuarios.length;
  listaUsuariosDiv.innerHTML = '';
  usuarios.forEach(usuario => {
    const div = document.createElement('div');
    div.className = 'usuario-item';
    div.innerHTML = `<span class="usuario-color" style="background-color: ${usuario.color}"></span><span class="usuario-nombre">${usuario.nombre}</span>`;
    listaUsuariosDiv.appendChild(div);
  });
}

// mostrar mensaje de chat
function mostrarMensajeChat(usuario, mensaje, color) {
  const divMensaje = document.createElement('div');
  divMensaje.className = 'mensaje-chat';
  const esMiMensaje = (usuario === datosUsuario?.nombre);
  
  const cabecera = document.createElement('div');
  cabecera.className = 'cabecera-mensaje';
  const nombreSpan = document.createElement('span');
  nombreSpan.className = 'nombre-usuario';
  nombreSpan.textContent = usuario;
  nombreSpan.style.color = color;
  cabecera.appendChild(nombreSpan);
  
  const textoDiv = document.createElement('div');
  textoDiv.className = 'texto-mensaje';
  textoDiv.textContent = mensaje;
  
  if (esMiMensaje) {
    divMensaje.style.alignItems = 'flex-end';
    textoDiv.style.backgroundColor = '#DCF8C6';
  } else {
    textoDiv.style.backgroundColor = color + '20';
  }
  
  divMensaje.appendChild(cabecera);
  divMensaje.appendChild(textoDiv);
  areaMensajes.appendChild(divMensaje);
  areaMensajes.scrollTop = areaMensajes.scrollHeight;
}

function mostrarMensajeSistema(mensaje) {
  const div = document.createElement('div');
  div.className = 'mensaje-sistema';
  div.textContent = mensaje;
  areaMensajes.appendChild(div);
  areaMensajes.scrollTop = areaMensajes.scrollHeight;
}

// Enviar mensaje
function enviarMensaje() {
  const texto = mensajeInput.value.trim();
  if (texto === '') return;
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(texto);
    mensajeInput.value = '';
    mensajeInput.focus();
  }
}

// Eventos login
btnNombrePropio.onclick = () => {
  const nombre = document.getElementById('nombrePersonal').value.trim();
  if (nombre === '') {
    alert('Por favor ingresa un nombre');
    return;
  }
  conectarWebSocket(nombre, 'personal');
};

btnGoogle.onclick = () => {
  const email = document.getElementById('emailGoogle').value.trim();
  let nombre = '';
  
  if (email !== '' && email.includes('@')) {
    // Extraer nombre del email (lo que va antes del @)
    nombre = email.split('@')[0];
    // Capitalizar primera letra
    nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
  } else {
    // Asignar nombre aleatorio si el usuario no quiera entrar por los otros metodos
    nombre = generarNombreAleatorio();
  }
  conectarWebSocket(nombre, 'google');
};

// Eventos envío
btnEnviar.onclick = enviarMensaje;
mensajeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') enviarMensaje();
});