/**
 * TaskFlow — Gestión de tareas en JavaScript vanilla
 * Fase 2: Refactorizado y ampliado con ayuda de IA
 *
 * Funcionalidades:
 *  - Crear, editar y eliminar tareas
 *  - Marcar tareas como completadas
 *  - Filtrar por estado (todas / pendientes / completadas)
 *  - Buscar tareas por texto (título o descripción)
 *  - Ordenar por fecha o prioridad
 *  - Prioridad por tarea (alta / media / baja)
 *  - Persistencia en localStorage
 */

// ─── Estado global ────────────────────────────────────────────────────────────

/** @type {Array<Object>} Lista de tareas en memoria */
let tareas = [];

/** @type {string} Filtro activo: 'todas' | 'pendientes' | 'completadas' */
let filtroActivo = "todas";

/** @type {string} Criterio de ordenación: 'fecha' | 'prioridad' */
let ordenActivo = "fecha";

/** @type {string} Texto de búsqueda activo */
let textoBusqueda = "";

// ─── Constantes ───────────────────────────────────────────────────────────────

const CLAVE_LOCAL_STORAGE = "taskflow_tareas";

const PRIORIDAD_ORDEN = { alta: 0, media: 1, baja: 2 };

// ─── Persistencia ─────────────────────────────────────────────────────────────

/**
 * Carga las tareas desde localStorage al iniciar la aplicación
 * @returns {Array<Object>} Array de tareas (vacío si no hay datos)
 */
function cargarTareas() {
  try {
    const datos = localStorage.getItem(CLAVE_LOCAL_STORAGE);
    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    console.error("Error al cargar tareas:", error);
    return [];
  }
}

/**
 * Guarda el array de tareas actual en localStorage
 */
function persistirTareas() {
  try {
    localStorage.setItem(CLAVE_LOCAL_STORAGE, JSON.stringify(tareas));
  } catch (error) {
    console.error("Error al guardar tareas:", error);
  }
}

// ─── CRUD de tareas ───────────────────────────────────────────────────────────

/**
 * Crea una nueva tarea y la añade al array global
 * @param {string} titulo - Título de la tarea (obligatorio)
 * @param {string} [descripcion=""] - Descripción opcional
 * @param {string} [prioridad="media"] - Prioridad: 'alta' | 'media' | 'baja'
 * @returns {Object} La tarea recién creada
 * @throws {Error} Si el título está vacío
 */
function crearTarea(titulo, descripcion = "", prioridad = "media") {
  if (!titulo || titulo.trim() === "") {
    throw new Error("El título de la tarea no puede estar vacío");
  }

  const tarea = {
    id: Date.now(),
    titulo: titulo.trim(),
    descripcion: descripcion.trim(),
    prioridad,
    estado: "pendiente",
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: null,
  };

  tareas.push(tarea);
  persistirTareas();
  return tarea;
}

/**
 * Elimina una tarea del array por su id
 * @param {number} id - Id único de la tarea
 * @returns {boolean} true si se eliminó correctamente, false si no se encontró
 */
function eliminarTarea(id) {
  const indice = tareas.findIndex((t) => t.id === id);
  if (indice === -1) return false;

  tareas.splice(indice, 1);
  persistirTareas();
  return true;
}

/**
 * Actualiza los campos de una tarea existente
 * @param {number} id - Id de la tarea a actualizar
 * @param {Object} cambios - Objeto con los campos a actualizar
 * @returns {Object|null} La tarea actualizada, o null si no se encontró
 */
function actualizarTarea(id, cambios) {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return null;

  Object.assign(tarea, cambios, {
    fechaModificacion: new Date().toISOString(),
  });

  persistirTareas();
  return tarea;
}

/**
 * Alterna el estado de una tarea entre 'pendiente' y 'completada'
 * @param {number} id - Id de la tarea
 * @returns {Object|null} La tarea actualizada o null si no existe
 */
function toggleEstadoTarea(id) {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return null;

  tarea.estado = tarea.estado === "pendiente" ? "completada" : "pendiente";
  tarea.fechaModificacion = new Date().toISOString();
  persistirTareas();
  return tarea;
}

// ─── Filtrado y búsqueda ──────────────────────────────────────────────────────

/**
 * Filtra las tareas por estado
 * @param {Array<Object>} listaTareas - Array de tareas a filtrar
 * @param {string} estado - 'todas' | 'pendientes' | 'completadas'
 * @returns {Array<Object>} Tareas filtradas
 */
function filtrarPorEstado(listaTareas, estado) {
  if (estado === "todas") return listaTareas;
  return listaTareas.filter((t) => t.estado === estado.replace("s", "").replace("ientes", "iente"));
}

/**
 * Filtra tareas cuyo título o descripción contengan el texto indicado
 * @param {Array<Object>} listaTareas - Array de tareas a filtrar
 * @param {string} texto - Texto de búsqueda (case-insensitive)
 * @returns {Array<Object>} Tareas que coinciden con la búsqueda
 */
function buscarTareas(listaTareas, texto) {
  if (!texto || texto.trim() === "") return listaTareas;

  const termino = texto.toLowerCase().trim();
  return listaTareas.filter(
    (tarea) =>
      tarea.titulo?.toLowerCase().includes(termino) ||
      tarea.descripcion?.toLowerCase().includes(termino)
  );
}

/**
 * Ordena un array de tareas según el criterio indicado
 * @param {Array<Object>} listaTareas - Array de tareas a ordenar
 * @param {string} criterio - 'fecha' | 'prioridad'
 * @returns {Array<Object>} Nuevo array ordenado (no muta el original)
 */
function ordenarTareas(listaTareas, criterio) {
  const copia = [...listaTareas];

  if (criterio === "prioridad") {
    return copia.sort(
      (a, b) =>
        (PRIORIDAD_ORDEN[a.prioridad] ?? 3) - (PRIORIDAD_ORDEN[b.prioridad] ?? 3)
    );
  }

  // Orden por fecha descendente (más reciente primero)
  return copia.sort(
    (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
  );
}

/**
 * Aplica filtro, búsqueda y ordenación al array de tareas
 * @returns {Array<Object>} Lista procesada lista para renderizar
 */
function obtenerTareasVisibles() {
  let resultado = [...tareas];
  resultado = filtrarPorEstado(resultado, filtroActivo);
  resultado = buscarTareas(resultado, textoBusqueda);
  resultado = ordenarTareas(resultado, ordenActivo);
  return resultado;
}

// ─── Cálculos y estadísticas ──────────────────────────────────────────────────

/**
 * Calcula el porcentaje de tareas completadas
 * @returns {number} Porcentaje entre 0 y 100
 */
function calcularProgreso() {
  if (tareas.length === 0) return 0;
  const completadas = tareas.filter((t) => t.estado === "completada").length;
  return Math.round((completadas / tareas.length) * 100);
}

// ─── Renderizado del DOM ──────────────────────────────────────────────────────

/**
 * Crea el elemento HTML para una tarea
 * @param {Object} tarea - Objeto tarea
 * @returns {HTMLElement} Elemento <li> de la tarea
 */
function crearElementoTarea(tarea) {
  const li = document.createElement("li");
  li.className = `tarea tarea--${tarea.estado} tarea--prioridad-${tarea.prioridad}`;
  li.dataset.id = tarea.id;

  li.innerHTML = `
    <div class="tarea__cabecera">
      <input
        type="checkbox"
        class="tarea__check"
        ${tarea.estado === "completada" ? "checked" : ""}
        aria-label="Marcar como completada"
      />
      <span class="tarea__titulo ${tarea.estado === "completada" ? "tarea__titulo--completada" : ""}">
        ${escaparHTML(tarea.titulo)}
      </span>
      <span class="tarea__prioridad tarea__prioridad--${tarea.prioridad}">
        ${tarea.prioridad}
      </span>
    </div>
    ${
      tarea.descripcion
        ? `<p class="tarea__descripcion">${escaparHTML(tarea.descripcion)}</p>`
        : ""
    }
    <div class="tarea__acciones">
      <button class="btn btn--editar" data-id="${tarea.id}">✏️ Editar</button>
      <button class="btn btn--eliminar" data-id="${tarea.id}">🗑️ Eliminar</button>
    </div>
    <small class="tarea__fecha">
      Creada: ${formatearFecha(tarea.fechaCreacion)}
      ${tarea.fechaModificacion ? ` · Modificada: ${formatearFecha(tarea.fechaModificacion)}` : ""}
    </small>
  `;

  asignarEventosTarea(li, tarea);
  return li;
}

/**
 * Asigna los event listeners a los elementos interactivos de una tarea
 * @param {HTMLElement} elemento - Elemento <li> de la tarea
 * @param {Object} tarea - Objeto tarea asociado
 */
function asignarEventosTarea(elemento, tarea) {
  elemento.querySelector(".tarea__check").addEventListener("change", () => {
    toggleEstadoTarea(tarea.id);
    renderizarTareas();
    actualizarProgreso();
  });

  elemento.querySelector(".btn--eliminar").addEventListener("click", () => {
    if (confirm(`¿Eliminar "${tarea.titulo}"?`)) {
      eliminarTarea(tarea.id);
      renderizarTareas();
      actualizarProgreso();
    }
  });

  elemento.querySelector(".btn--editar").addEventListener("click", () => {
    abrirModalEdicion(tarea);
  });
}

/**
 * Renderiza la lista de tareas visibles en el DOM
 */
function renderizarTareas() {
  const lista = document.getElementById("lista-tareas");
  if (!lista) return;

  const tareasVisibles = obtenerTareasVisibles();
  lista.innerHTML = "";

  if (tareasVisibles.length === 0) {
    lista.innerHTML = `<li class="tarea tarea--vacia">No hay tareas que mostrar</li>`;
    return;
  }

  tareasVisibles.forEach((tarea) => {
    lista.appendChild(crearElementoTarea(tarea));
  });
}

/**
 * Actualiza la barra de progreso en el DOM
 */
function actualizarProgreso() {
  const progreso = calcularProgreso();
  const barra = document.getElementById("barra-progreso");
  const texto = document.getElementById("texto-progreso");

  if (barra) barra.style.width = `${progreso}%`;
  if (texto) texto.textContent = `${progreso}% completado`;
}

// ─── Modal de edición ─────────────────────────────────────────────────────────

/**
 * Abre el modal de edición con los datos de la tarea seleccionada
 * @param {Object} tarea - Tarea a editar
 */
function abrirModalEdicion(tarea) {
  const modal = document.getElementById("modal-edicion");
  if (!modal) return;

  document.getElementById("editar-id").value = tarea.id;
  document.getElementById("editar-titulo").value = tarea.titulo;
  document.getElementById("editar-descripcion").value = tarea.descripcion;
  document.getElementById("editar-prioridad").value = tarea.prioridad;

  modal.classList.add("modal--visible");
}

/**
 * Cierra el modal de edición
 */
function cerrarModalEdicion() {
  const modal = document.getElementById("modal-edicion");
  if (modal) modal.classList.remove("modal--visible");
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto con caracteres HTML escapados
 */
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(texto));
  return div.innerHTML;
}

/**
 * Formatea una fecha ISO a formato legible en español
 * @param {string} fechaISO - Fecha en formato ISO 8601
 * @returns {string} Fecha formateada (ej: "15 abr 2026, 10:30")
 */
function formatearFecha(fechaISO) {
  return new Date(fechaISO).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Inicialización y event listeners ────────────────────────────────────────

/**
 * Configura todos los event listeners de la interfaz
 */
function inicializarEventListeners() {
  // Formulario de nueva tarea
  const formulario = document.getElementById("formulario-tarea");
  formulario?.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo = document.getElementById("input-titulo")?.value;
    const descripcion = document.getElementById("input-descripcion")?.value;
    const prioridad = document.getElementById("input-prioridad")?.value;

    try {
      crearTarea(titulo, descripcion, prioridad);
      formulario.reset();
      renderizarTareas();
      actualizarProgreso();
    } catch (error) {
      alert(error.message);
    }
  });

  // Filtros de estado
  document.querySelectorAll("[data-filtro]").forEach((btn) => {
    btn.addEventListener("click", () => {
      filtroActivo = btn.dataset.filtro;
      document
        .querySelectorAll("[data-filtro]")
        .forEach((b) => b.classList.remove("filtro--activo"));
      btn.classList.add("filtro--activo");
      renderizarTareas();
    });
  });

  // Búsqueda por texto (con debounce)
  const inputBusqueda = document.getElementById("input-busqueda");
  inputBusqueda?.addEventListener(
    "input",
    debounce((e) => {
      textoBusqueda = e.target.value;
      renderizarTareas();
    }, 300)
  );

  // Ordenación
  const selectOrden = document.getElementById("select-orden");
  selectOrden?.addEventListener("change", (e) => {
    ordenActivo = e.target.value;
    renderizarTareas();
  });

  // Modal de edición — guardar cambios
  document.getElementById("btn-guardar-edicion")?.addEventListener("click", () => {
    const id = Number(document.getElementById("editar-id").value);
    const titulo = document.getElementById("editar-titulo").value;
    const descripcion = document.getElementById("editar-descripcion").value;
    const prioridad = document.getElementById("editar-prioridad").value;

    if (!titulo.trim()) {
      alert("El título no puede estar vacío");
      return;
    }

    actualizarTarea(id, { titulo: titulo.trim(), descripcion: descripcion.trim(), prioridad });
    cerrarModalEdicion();
    renderizarTareas();
  });

  // Modal de edición — cerrar
  document.getElementById("btn-cancelar-edicion")?.addEventListener("click", cerrarModalEdicion);

  // Cerrar modal al hacer clic fuera
  document.getElementById("modal-edicion")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) cerrarModalEdicion();
  });
}

/**
 * Función debounce — retrasa la ejecución hasta que cesen las llamadas
 * @param {Function} fn - Función a ejecutar
 * @param {number} delay - Tiempo de espera en ms
 * @returns {Function} Función con debounce aplicado
 */
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Inicializa la aplicación al cargar el DOM
 */
function inicializarApp() {
  tareas = cargarTareas();
  inicializarEventListeners();
  renderizarTareas();
  actualizarProgreso();
}

// ─── Arranque ─────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", inicializarApp);
