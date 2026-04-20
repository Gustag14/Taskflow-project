# TaskFlow 

Una aplicación de gestión de tareas construida con JavaScript vanilla, sin frameworks ni dependencias externas.

## Características principales

- ✅ **Crear tareas** con título, descripción y prioridad (alta / media / baja)
- ✏️ **Editar tareas** existentes desde un modal
- 🗑️ **Eliminar tareas** con confirmación
- 🔄 **Marcar como completadas** con un checkbox
- 🔍 **Buscar** por texto en título o descripción (con debounce)
- 🏷️ **Filtrar** por estado: todas / pendientes / completadas
- 📊 **Ordenar** por fecha de creación o prioridad
- 📈 **Barra de progreso** con el porcentaje de tareas completadas
- 💾 **Persistencia automática** en `localStorage`

---

## Tecnologías usadas

| Tecnología     | Uso                          |
|---------------|------------------------------|
| HTML5          | Estructura semántica          |
| CSS3           | Estilos y animaciones         |
| JavaScript ES2020+ | Lógica de la aplicación  |
| localStorage   | Persistencia de datos         |

Sin dependencias externas. Sin frameworks. Sin bundlers.

---


O con servidor local (opcional):

```bash
npx serve .
# http://localhost:3000
```

---

## Estructura del proyecto

```
taskflow/
├── index.html          # Estructura HTML principal
├── taskflow.js         # Lógica de la aplicación
├── styles.css          # Estilos
└── docs/
    └── ai/
        ├── ai-comparison.md      
        ├── cursor-workflow.md    # Flujo de trabajo con Cursor IDE
        ├── prompt-engineering.md # Prompts útiles documentados
        ├── experiments.md        # Experimentos con/sin IA + MCP
        └── reflection.md         # Reflexión final
```

---

## Funcionalidades en detalle

### Crear una tarea

Rellena el formulario con título (obligatorio), descripción (opcional) y prioridad. La tarea aparece en la lista al instante y se guarda automáticamente.

### Buscar tareas

El campo de búsqueda filtra en tiempo real por título y descripción. La búsqueda ignora mayúsculas y minúsculas.

### Filtrar por estado

Los botones de filtro muestran solo las tareas en el estado seleccionado: todas, pendientes o completadas.

### Ordenar

Elige entre ordenar por fecha de creación (más reciente primero) o por prioridad (alta → media → baja).

### Editar una tarea

Haz clic en el botón de cualquier tarea para abrirla en un modal de edición. Los cambios se guardan al pulsar "Guardar".

