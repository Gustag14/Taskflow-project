# Flujo de trabajo con Cursor IDE

> Documento de la Fase 2 — Experiencias, atajos y ejemplos usando Cursor como IDE asistido por IA en el proyecto TaskFlow.

---

## ¿Qué es Cursor?

Cursor es un IDE basado en VS Code que integra modelos de IA (Claude, GPT-4) directamente en el editor. Permite autocompletar código, refactorizar funciones, hacer preguntas sobre el proyecto y editar múltiples archivos a la vez mediante su función **Composer**.

---

## Instalación y configuración inicial

1. Descarga Cursor desde [https://cursor.sh](https://cursor.sh)
2. Al abrirlo por primera vez, importa tu configuración de VS Code (extensiones, atajos, tema)
3. Inicia sesión con tu cuenta (o crea una gratuita)
4. Abre el proyecto TaskFlow: `File > Open Folder`
5. Activa el modelo preferido en `Cursor Settings > Models` (recomendado: Claude Sonnet)

---

## Atajos de teclado más usados

| Atajo (Mac / Windows)       | Función                                              |
|-----------------------------|------------------------------------------------------|
| `Cmd+K` / `Ctrl+K`         | Edición inline — editar la selección con IA         |
| `Cmd+L` / `Ctrl+L`         | Abrir el chat lateral con contexto del archivo      |
| `Cmd+Shift+L` / `Ctrl+Shift+L` | Añadir selección al chat como contexto          |
| `Cmd+I` / `Ctrl+I`         | Abrir Composer (cambios multiarchivo)               |
| `Tab`                       | Aceptar sugerencia de autocompletado                |
| `Esc`                       | Rechazar sugerencia                                 |
| `Cmd+.` / `Ctrl+.`         | Ver acciones rápidas de IA sobre el cursor          |
| `Cmd+Shift+P`               | Paleta de comandos (igual que VS Code)              |
| `@`                         | En el chat, referencia un archivo concreto          |

---

## Funcionalidades exploradas

### Autocompletado con comentarios

Al escribir un comentario descriptivo, Cursor sugiere la implementación completa:

```javascript
// Filtra las tareas del array por estado y retorna solo las que coinciden
```

→ Cursor autocompleta la función `filtrarPorEstado` sin necesidad de escribirla.

**Ejemplo real en TaskFlow:**

```javascript
// Calcula el porcentaje de tareas completadas sobre el total
function calcularProgreso(tareas) { // ← Cursor completó este cuerpo automáticamente
  if (tareas.length === 0) return 0;
  const completadas = tareas.filter((t) => t.estado === "completada").length;
  return Math.round((completadas / tareas.length) * 100);
}
```

---

### Chat contextual (`Cmd+L`)

Permite hacer preguntas sobre el código abierto en el editor.

**Ejemplo de uso:**

> Pregunta: `"¿Por qué esta función muta el array original y cómo puedo evitarlo?"`

Cursor analiza la función seleccionada y responde con:
- Explicación del problema
- Código corregido con spread operator
- Consejo sobre inmutabilidad en JavaScript

---

### Edición inline (`Cmd+K`)

Selecciona una función y pide una mejora directamente:

> `"Añade validación de tipos y manejo de errores a esta función"`

Cursor modifica el código en el lugar, sin salir del editor. Se puede aceptar, rechazar o pedir ajustes.

**Ejemplo aplicado a TaskFlow:**

Antes (seleccionado con `Cmd+K`):
```javascript
function guardarTarea(tarea) {
  localStorage.setItem("tareas", JSON.stringify(tarea));
}
```

Prompt inline: `"Valida que tarea sea un objeto con propiedad titulo no vacía"`

Después:
```javascript
function guardarTarea(tarea) {
  if (!tarea || typeof tarea !== "object") {
    throw new TypeError("Se esperaba un objeto de tarea");
  }
  if (!tarea.titulo || tarea.titulo.trim() === "") {
    throw new Error("La tarea debe tener un título");
  }
  localStorage.setItem("tareas", JSON.stringify(tarea));
}
```

---

### Composer (`Cmd+I`) — Cambios multiarchivo

Composer permite describir un cambio y aplicarlo en varios archivos a la vez.

**Ejemplo usado en TaskFlow:**

> Prompt en Composer: `"Añade una función de búsqueda por texto al módulo de tareas y actualiza el HTML para incluir un input de búsqueda"`

Cursor propone cambios en:
- `taskflow.js` — nueva función `buscarTareas()`
- `index.html` — nuevo `<input>` de búsqueda
- `styles.css` — estilos para el input

Se revisan los diffs antes de aceptar cada cambio.

---

## Ejemplos concretos donde Cursor mejoró el código

### Ejemplo 1 — Refactorización de función larga

**Situación:** La función `renderizarTareas()` tenía 60 líneas mezclando lógica de filtrado, creación de DOM y manejo de eventos.

**Acción:** Selección completa + `Cmd+K` con prompt:
> `"Divide esta función en tres funciones más pequeñas: una para filtrar, una para crear elementos DOM y una para asignar eventos"`

**Resultado:** Cursor extrajo tres funciones limpias y actualizó las llamadas. El código pasó de 60 líneas en una función a tres funciones de ~15 líneas cada una, mucho más legibles y testeables.

---

### Ejemplo 2 — Añadir JSDoc automáticamente

**Situación:** El proyecto no tenía documentación en ninguna función.

**Acción:** Abrir el chat (`Cmd+L`) con el archivo completo en contexto:
> `"Añade comentarios JSDoc a todas las funciones de este archivo"`

**Resultado:** Cursor generó JSDoc completo con `@param`, `@returns` y descripción para cada función. Solo fue necesario revisar y ajustar algunos tipos.

```javascript
/**
 * Añade una nueva tarea al array y actualiza el almacenamiento local
 * @param {string} titulo - Título de la tarea
 * @param {string} [descripcion=""] - Descripción opcional
 * @returns {Object} La tarea recién creada
 */
function crearTarea(titulo, descripcion = "") {
  const tarea = {
    id: Date.now(),
    titulo,
    descripcion,
    estado: "pendiente",
    fechaCreacion: new Date().toISOString(),
  };
  tareas.push(tarea);
  persistirTareas();
  return tarea;
}
```

---

## Configuración de MCP en Cursor

> Ver documento `experiments.md` para el detalle completo de instalación.

En `~/.cursor/mcp.json` (o desde `Cursor Settings > MCP`):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/ruta/a/taskflow"]
    }
  }
}
```

Una vez configurado, el chat de Cursor puede acceder directamente a los archivos del proyecto con comandos como:
> `"Lee el archivo taskflow.js y dime qué funciones tienen más de 20 líneas"`

---

## Observaciones generales

- **Lo que funciona muy bien:** autocompletado, edición inline de funciones aisladas, generación de JSDoc, explicación de código legacy.
- **Lo que requiere revisión:** Composer en proyectos grandes puede generar cambios en archivos no esperados. Siempre revisar el diff antes de aceptar.
- **Consejo:** usar `@archivo.js` en el chat para dar contexto preciso en lugar de dejar que Cursor adivine qué archivo es relevante.
