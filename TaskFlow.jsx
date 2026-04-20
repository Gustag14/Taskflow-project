import { useState, useEffect, useRef } from "react";

const FILTERS = ["todas", "pendientes", "completadas"];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadTasks() {
  try {
    const raw = localStorage.getItem("taskflow_tasks");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
  } catch {}
}

function loadDark() {
  try {
    return localStorage.getItem("taskflow_dark") === "true";
  } catch {
    return false;
  }
}

export default function TaskFlow() {
  const [tasks, setTasks] = useState(loadTasks);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("todas");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [dark, setDark] = useState(loadDark);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => {
    localStorage.setItem("taskflow_dark", dark);
  }, [dark]);

  const updateTasks = (fn) => setTasks((prev) => fn(prev));

  const addTask = () => {
    const title = input.trim();
    if (!title) { setError("El título no puede estar vacío."); return; }
    setError("");
    updateTasks((prev) => [
      { id: generateId(), title, completed: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTask = (id) =>
    updateTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const deleteTask = (id) =>
    updateTasks((prev) => prev.filter((t) => t.id !== id));

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditValue(task.title);
  };

  const saveEdit = (id) => {
    const val = editValue.trim();
    if (val) updateTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: val } : t)));
    setEditingId(null);
  };

  const markAll = () =>
    updateTasks((prev) => prev.map((t) => ({ ...t, completed: true })));

  const clearCompleted = () =>
    updateTasks((prev) => prev.filter((t) => !t.completed));

  const filtered = tasks.filter((t) => {
    const matchFilter =
      filter === "todas" ||
      (filter === "pendientes" && !t.completed) ||
      (filter === "completadas" && t.completed);
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const total = tasks.length;
  const completadas = tasks.filter((t) => t.completed).length;
  const pendientes = total - completadas;

  // Color system using inline styles matching the design system
  const c = {
    bg: dark ? "#1a1a1a" : "#ffffff",
    surface: dark ? "#242424" : "#f7f6f3",
    card: dark ? "#2a2a2a" : "#ffffff",
    border: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    borderStrong: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
    text: dark ? "#e8e6e0" : "#1a1a18",
    muted: dark ? "#888780" : "#888780",
    accent: dark ? "#7f77dd" : "#534ab7",
    accentBg: dark ? "#26215c" : "#eeedfe",
    accentText: dark ? "#cecbf6" : "#534ab7",
    danger: dark ? "#e24b4a" : "#a32d2d",
    dangerBg: dark ? "#501313" : "#fcebeb",
    success: dark ? "#1d9e75" : "#0f6e56",
    successBg: dark ? "#04342c" : "#e1f5ee",
    successText: dark ? "#9fe1cb" : "#0f6e56",
    inputBg: dark ? "#1e1e1e" : "#ffffff",
  };

  const pill = (active) => ({
    padding: "5px 14px",
    borderRadius: 999,
    border: `0.5px solid ${active ? c.accent : c.border}`,
    background: active ? c.accentBg : "transparent",
    color: active ? c.accentText : c.muted,
    fontSize: 13,
    cursor: "pointer",
    fontWeight: active ? 500 : 400,
    transition: "all 0.15s",
  });

  const btn = (variant = "default") => ({
    padding: "7px 14px",
    borderRadius: 8,
    border: `0.5px solid ${variant === "danger" ? c.danger : c.borderStrong}`,
    background: "transparent",
    color: variant === "danger" ? c.danger : c.text,
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 400,
  });

  const statCard = (value, label, color) => (
    <div style={{
      background: c.surface,
      borderRadius: 8,
      padding: "12px 16px",
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 24, fontWeight: 500, color: color || c.text }}>{value}</div>
      <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ background: c.bg, minHeight: "100vh", color: c.text, fontFamily: "var(--font-sans, system-ui)", padding: "0 0 2rem" }}>
      {/* Header */}
      <header style={{
        background: c.card,
        borderBottom: `0.5px solid ${c.border}`,
        padding: "0 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <span style={{ fontWeight: 500, fontSize: 17, letterSpacing: "-0.01em" }}>TaskFlow</span>
        </div>
        <button
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
          style={{
            background: "transparent",
            border: `0.5px solid ${c.border}`,
            borderRadius: 8,
            padding: "5px 10px",
            cursor: "pointer",
            color: c.muted,
            fontSize: 14,
          }}
        >
          {dark ? "☀ Claro" : "☾ Oscuro"}
        </button>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem 0" }}>
        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem" }}>
          {statCard(total, "total")}
          {statCard(pendientes, "pendientes", c.accent)}
          {statCard(completadas, "completadas", c.success)}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ height: 4, background: c.surface, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.round((completadas / total) * 100)}%`,
                background: c.success,
                borderRadius: 4,
                transition: "width 0.3s",
              }} />
            </div>
            <div style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>
              {Math.round((completadas / total) * 100)}% completado
            </div>
          </div>
        )}

        {/* Add task form */}
        <div style={{
          background: c.card,
          border: `0.5px solid ${c.border}`,
          borderRadius: 12,
          padding: "1rem 1.25rem",
          marginBottom: "1rem",
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Nueva tarea..."
              aria-label="Título de la nueva tarea"
              style={{
                flex: 1,
                padding: "8px 12px",
                border: `0.5px solid ${error ? c.danger : c.borderStrong}`,
                borderRadius: 8,
                background: c.inputBg,
                color: c.text,
                fontSize: 15,
                outline: "none",
              }}
            />
            <button
              onClick={addTask}
              style={{
                padding: "8px 18px",
                background: c.accent,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Añadir
            </button>
          </div>
          {error && <p style={{ color: c.danger, fontSize: 13, margin: "6px 0 0", paddingLeft: 2 }}>{error}</p>}
        </div>

        {/* Search + filters */}
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tarea..."
            aria-label="Buscar tareas"
            style={{
              width: "100%",
              padding: "7px 12px",
              border: `0.5px solid ${c.border}`,
              borderRadius: 8,
              background: c.inputBg,
              color: c.text,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 10,
            }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={pill(filter === f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button onClick={markAll} style={btn()} disabled={pendientes === 0}
                title="Marcar todas como completadas">
                Completar todo
              </button>
              <button onClick={clearCompleted} style={btn("danger")} disabled={completadas === 0}
                title="Eliminar tareas completadas">
                Limpiar completadas
              </button>
            </div>
          </div>
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: c.muted,
            fontSize: 14,
          }}>
            {tasks.length === 0
              ? "Añade tu primera tarea arriba."
              : "No hay tareas con ese filtro."}
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((task) => (
              <li key={task.id} style={{
                background: c.card,
                border: `0.5px solid ${task.completed ? c.border : c.border}`,
                borderLeft: `3px solid ${task.completed ? c.success : c.accent}`,
                borderRadius: "0 8px 8px 0",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: task.completed ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}>
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Marcar "${task.title}" como ${task.completed ? "pendiente" : "completada"}`}
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: c.success, flexShrink: 0 }}
                />

                {/* Title or edit field */}
                {editingId === task.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(task.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => saveEdit(task.id)}
                    style={{
                      flex: 1,
                      border: `0.5px solid ${c.borderStrong}`,
                      borderRadius: 6,
                      padding: "3px 8px",
                      background: c.inputBg,
                      color: c.text,
                      fontSize: 14,
                      outline: "none",
                    }}
                    aria-label="Editar título de la tarea"
                  />
                ) : (
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? c.muted : c.text,
                      wordBreak: "break-word",
                    }}
                  >
                    {task.title}
                  </span>
                )}

                {/* Date */}
                <span style={{ fontSize: 11, color: c.muted, flexShrink: 0, display: "none" /* hidden on mobile */ }}>
                  {new Date(task.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                </span>

                {/* Actions */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(task)}
                    aria-label={`Editar "${task.title}"`}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: c.muted, padding: "3px 6px", borderRadius: 6, fontSize: 13 }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Eliminar "${task.title}"`}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: c.danger, padding: "3px 6px", borderRadius: 6, fontSize: 14 }}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer count */}
        {tasks.length > 0 && (
          <p style={{ fontSize: 12, color: c.muted, textAlign: "center", marginTop: "1.5rem" }}>
            {filtered.length} de {tasks.length} tarea{tasks.length !== 1 ? "s" : ""}
          </p>
        )}
      </main>
    </div>
  );
}
