/* ===========================
   TaskFlow — app.js
   =========================== */

// ── Modelo de datos ──────────────────────────────────────────────────────────

/**
 * Estructura de una tarea:
 * { id: string, title: string, completed: boolean, createdAt: string (ISO) }
 */

// ── Estado de la aplicación ──────────────────────────────────────────────────

let tasks  = [];
let filter = "todas";
let search = "";

// ── Persistencia (LocalStorage) ──────────────────────────────────────────────

function loadTasks() {
  try {
    const raw = localStorage.getItem("taskflow_tasks");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
  } catch (e) {
    console.error("No se pudo guardar en LocalStorage:", e);
  }
}

function loadDarkMode() {
  try {
    return localStorage.getItem("taskflow_dark") === "true";
  } catch {
    return false;
  }
}

function saveDarkMode(isDark) {
  try {
    localStorage.setItem("taskflow_dark", isDark);
  } catch {}
}

// ── Utilidades ───────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Operaciones sobre tareas ─────────────────────────────────────────────────

function addTask(title) {
  const trimmed = title.trim();
  if (!trimmed) return false;

  const newTask = {
    id:          generateId(),
    title:       trimmed,
    completed:   false,
    createdAt:   new Date().toISOString(),
  };

  tasks.unshift(newTask);
  saveTasks();
  return true;
}

function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
}

function editTask(id, newTitle) {
  const trimmed = newTitle.trim();
  if (!trimmed) return;
  tasks = tasks.map(t =>
    t.id === id ? { ...t, title: trimmed } : t
  );
  saveTasks();
}

function markAllCompleted() {
  tasks = tasks.map(t => ({ ...t, completed: true }));
  saveTasks();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
}

// ── Filtrado ─────────────────────────────────────────────────────────────────

function getFilteredTasks() {
  return tasks.filter(t => {
    const matchFilter =
      filter === "todas" ||
      (filter === "pendientes"  && !t.completed) ||
      (filter === "completadas" &&  t.completed);

    const matchSearch = t.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });
}

// ── Renderizado ──────────────────────────────────────────────────────────────

function renderStats() {
  const total     = tasks.length;
  const done      = tasks.filter(t => t.completed).length;
  const pending   = total - done;
  const pct       = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("stat-total").textContent   = total;
  document.getElementById("stat-pending").textContent = pending;
  document.getElementById("stat-done").textContent    = done;

  const progressWrap = document.getElementById("progress-wrap");
  const progressFill = document.getElementById("progress-fill");
  const progressLabel = document.getElementById("progress-label");

  if (total > 0) {
    progressWrap.classList.add("visible");
    progressFill.style.width = pct + "%";
    progressLabel.textContent = pct + "% completado";
    progressWrap.setAttribute("aria-valuenow", pct);
  } else {
    progressWrap.classList.remove("visible");
  }
}

function renderTask(task) {
  const li = document.createElement("li");
  li.className = "task-item" + (task.completed ? " task-item--done" : "");
  li.dataset.id = task.id;

  li.innerHTML = `
    <input
      type="checkbox"
      class="task-item__check"
      ${task.completed ? "checked" : ""}
      aria-label="${escapeHtml(task.completed ? "Marcar como pendiente: " + task.title : "Marcar como completada: " + task.title)}"
    />
    <span class="task-item__title">${escapeHtml(task.title)}</span>
    <div class="task-item__actions">
      <button class="icon-btn btn-edit" aria-label="Editar: ${escapeHtml(task.title)}" title="Editar">✎</button>
      <button class="icon-btn icon-btn--danger btn-delete" aria-label="Eliminar: ${escapeHtml(task.title)}" title="Eliminar">✕</button>
    </div>
  `;

  // Checkbox
  li.querySelector(".task-item__check").addEventListener("change", () => {
    toggleTask(task.id);
    render();
  });

  // Editar
  li.querySelector(".btn-edit").addEventListener("click", () => {
    startEditing(li, task);
  });

  // Eliminar
  li.querySelector(".btn-delete").addEventListener("click", () => {
    deleteTask(task.id);
    render();
  });

  return li;
}

function startEditing(li, task) {
  const titleSpan  = li.querySelector(".task-item__title");
  const actionsDiv = li.querySelector(".task-item__actions");

  // Crear campo de edición
  const editInput = document.createElement("input");
  editInput.type      = "text";
  editInput.className = "task-item__edit-input";
  editInput.value     = task.title;
  editInput.maxLength = 200;
  editInput.setAttribute("aria-label", "Editar título de la tarea");

  titleSpan.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  // Ocultar botones mientras se edita
  actionsDiv.style.display = "none";

  function confirmEdit() {
    editTask(task.id, editInput.value);
    actionsDiv.style.display = "";
    render();
  }

  editInput.addEventListener("keydown", e => {
    if (e.key === "Enter")  { e.preventDefault(); confirmEdit(); }
    if (e.key === "Escape") { actionsDiv.style.display = ""; render(); }
  });

  editInput.addEventListener("blur", confirmEdit);
}

function renderList() {
  const list      = document.getElementById("task-list");
  const empty     = document.getElementById("empty-state");
  const footer    = document.getElementById("list-footer");
  const filtered  = getFilteredTasks();

  list.innerHTML = "";

  if (filtered.length === 0) {
    empty.classList.add("visible");
    empty.textContent = tasks.length === 0
      ? "Añade tu primera tarea arriba."
      : "No hay tareas con ese filtro.";
  } else {
    empty.classList.remove("visible");
    const fragment = document.createDocumentFragment();
    filtered.forEach(task => fragment.appendChild(renderTask(task)));
    list.appendChild(fragment);
  }

  footer.textContent = tasks.length > 0
    ? `${filtered.length} de ${tasks.length} tarea${tasks.length !== 1 ? "s" : ""}`
    : "";
}

function renderFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("filter-btn--active", btn.dataset.filter === filter);
  });
}

function renderBulkButtons() {
  const pending = tasks.filter(t => !t.completed).length;
  const done    = tasks.filter(t => t.completed).length;
  document.getElementById("btn-all").disabled   = pending === 0;
  document.getElementById("btn-clear").disabled = done === 0;
}

function render() {
  renderStats();
  renderList();
  renderFilters();
  renderBulkButtons();
}

// ── Modo oscuro ──────────────────────────────────────────────────────────────

function applyDarkMode(isDark) {
  document.body.classList.toggle("dark", isDark);
  document.getElementById("dark-label").textContent = isDark ? "☀ Claro" : "☾ Oscuro";
  document.getElementById("btn-dark").setAttribute(
    "aria-label",
    isDark ? "Activar modo claro" : "Activar modo oscuro"
  );
}

// ── Inicialización y eventos ─────────────────────────────────────────────────

function init() {
  // Cargar datos
  tasks = loadTasks();

  // Modo oscuro
  let isDark = loadDarkMode();
  applyDarkMode(isDark);

  document.getElementById("btn-dark").addEventListener("click", () => {
    isDark = !isDark;
    applyDarkMode(isDark);
    saveDarkMode(isDark);
  });

  // Añadir tarea
  const taskInput = document.getElementById("task-input");
  const errorMsg  = document.getElementById("error-msg");

  function handleAdd() {
    const val = taskInput.value;
    const ok  = addTask(val);
    if (!ok) {
      errorMsg.textContent = "El título no puede estar vacío.";
      taskInput.classList.add("input--error");
      taskInput.focus();
      return;
    }
    errorMsg.textContent = "";
    taskInput.classList.remove("input--error");
    taskInput.value = "";
    taskInput.focus();
    render();
  }

  document.getElementById("btn-add").addEventListener("click", handleAdd);

  taskInput.addEventListener("keydown", e => {
    if (e.key === "Enter") handleAdd();
  });

  taskInput.addEventListener("input", () => {
    if (taskInput.value.trim()) {
      errorMsg.textContent = "";
      taskInput.classList.remove("input--error");
    }
  });

  // Búsqueda
  document.getElementById("search-input").addEventListener("input", e => {
    search = e.target.value;
    render();
  });

  // Filtros
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      render();
    });
  });

  // Acciones masivas
  document.getElementById("btn-all").addEventListener("click", () => {
    markAllCompleted();
    render();
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    clearCompleted();
    render();
  });

  // Primer render
  render();
}

// Arrancar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", init);
