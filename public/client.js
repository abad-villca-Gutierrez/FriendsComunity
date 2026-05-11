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
