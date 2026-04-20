# Experimentos con IA en programación

> Documento de la Fase 2 — Comparativa de resolución de problemas con y sin asistencia de IA,  
> más el proceso completo de instalación y uso de servidores MCP.

---

## Parte 1 — Experimentos: con IA vs sin IA

### Metodología

Para cada problema:
1. Se resuelve primero **sin IA** (cronometrado)
2. Se resuelve después **con IA** (Claude en Cursor)
3. Se compara: tiempo, calidad de código y comprensión del problema

---

### Experimento 1 — Problema general: implementar un debounce

**Descripción:** Crear una función `debounce(fn, delay)` que retrasa la ejecución de `fn` hasta que hayan pasado `delay` ms sin que se la vuelva a llamar.

---

**Sin IA — Tiempo: 18 minutos**

```javascript
function debounce(fn, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
    }, delay);
  };
}
```

Problema encontrado: la función no pasa los argumentos originales. Tardé 8 minutos extra en darme cuenta.

Versión corregida (26 min total):
```javascript
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

**Con IA — Tiempo: 3 minutos**

Prompt: `"Implementa una función debounce en JavaScript que preserve el contexto this y los argumentos originales"`

```javascript
/**
 * Retrasa la ejecución de una función hasta que deje de llamarse durante `delay` ms
 * @param {Function} fn - Función a ejecutar
 * @param {number} delay - Tiempo de espera en ms
 * @returns {Function} Función con debounce aplicado
 */
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

La IA incluyó JSDoc, preservó `this` y los argumentos desde el primer intento.

**Comparativa:**

| Criterio              | Sin IA       | Con IA      |
|----------------------|--------------|-------------|
| Tiempo               | 26 min       | 3 min       |
| Primera versión correcta | ❌ (bug) | ✅           |
| JSDoc incluido        | ❌           | ✅           |
| Comprensión del problema | ✅ Alta   | ⚠️ Media (el proceso de resolución enseña más) |

---

### Experimento 2 — Problema general: implementar deep clone

**Descripción:** Función que haga una copia profunda de un objeto JavaScript sin usar `JSON.parse(JSON.stringify())`.

**Sin IA — Tiempo: 35 minutos**

```javascript
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  const clone = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}
```

No manejé `Date`, `RegExp`, ni referencias circulares.

**Con IA — Tiempo: 4 minutos**

```javascript
function deepClone(obj, seen = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (seen.has(obj)) return seen.get(obj); // referencias circulares
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);

  const clone = Array.isArray(obj) ? [] : {};
  seen.set(obj, clone);

  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key], seen);
  }
  return clone;
}
```

La IA manejó casos límite que yo no había considerado.

**Aprendizaje clave:** La IA reveló casos límite que no habría encontrado sin investigación adicional (referencias circulares, Date, RegExp). Esto fue educativo, pero también me hizo consciente de que sin resolver el problema por mi cuenta primero, no habría notado la diferencia.

---

### Experimento 3 — Problema en TaskFlow: sistema de prioridades

**Descripción:** Añadir un campo `prioridad` (alta/media/baja) a las tareas y ordenar la lista por prioridad.

**Sin IA — Tiempo: 20 minutos**

```javascript
const PRIORIDAD_ORDEN = { alta: 0, media: 1, baja: 2 };

function ordenarPorPrioridad(tareas) {
  return tareas.sort((a, b) =>
    (PRIORIDAD_ORDEN[a.prioridad] ?? 3) - (PRIORIDAD_ORDEN[b.prioridad] ?? 3)
  );
}
```

**Con IA — Tiempo: 5 minutos (incluyendo actualización del HTML)**

Prompt en Composer: `"Añade un campo de prioridad (alta/media/baja) al formulario y ordena la lista automáticamente al renderizar"`

La IA generó además:
- `<select>` en el HTML con las tres opciones
- Indicador visual de color en el CSS según prioridad
- Lógica de ordenación en la función de render

**Comparativa:**

| Criterio              | Sin IA       | Con IA      |
|----------------------|--------------|-------------|
| Tiempo               | 20 min       | 5 min       |
| Cambios en HTML/CSS   | No considerado | ✅ Incluido |
| Calidad del código    | Buena        | Buena       |

---

### Resumen de experimentos

| Experimento         | Tiempo sin IA | Tiempo con IA | Ahorro | Aprendizaje |
|--------------------|--------------|--------------|--------|-------------|
| Debounce           | 26 min       | 3 min        | 88%    | ⬆️ Mayor sin IA |
| Deep clone         | 35 min       | 4 min        | 89%    | ⬆️ Mayor sin IA |
| Sistema prioridades| 20 min       | 5 min        | 75%    | Similar     |

**Conclusión:** La IA ahorra tiempo de forma drástica, especialmente en implementaciones conocidas. Sin embargo, resolver problemas sin IA primero desarrolla intuición y pensamiento crítico que luego permite evaluar mejor el código generado.

---

## Parte 2 — Configuración de MCP (Model Context Protocol)

### ¿Qué es MCP?

El Model Context Protocol es un estándar abierto creado por Anthropic que permite a los modelos de lenguaje conectarse con herramientas externas de forma estandarizada. En lugar de que cada herramienta integre su propia API, MCP define un protocolo común que cualquier cliente (Cursor, Claude Desktop, etc.) puede usar.

**Analogía:** MCP es para IA lo que USB fue para periféricos: un conector estándar que elimina la necesidad de drivers específicos para cada dispositivo.

---

### Instalación del servidor MCP Filesystem

#### Prerrequisitos
- Node.js 18+ instalado
- Cursor 0.40+ (o Claude Desktop)

#### Paso 1 — Verificar Node.js

```bash
node --version   # debe ser >= 18
npm --version
```

#### Paso 2 — Crear el archivo de configuración de MCP en Cursor

En Mac/Linux:
```bash
mkdir -p ~/.cursor
touch ~/.cursor/mcp.json
```

En Windows:
```
%APPDATA%\Cursor\mcp.json
```

#### Paso 3 — Configurar el servidor filesystem

Edita `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/ruta/absoluta/a/tu/proyecto/taskflow"
      ]
    }
  }
}
```

> ⚠️ Sustituye `/ruta/absoluta/a/tu/proyecto/taskflow` por la ruta real de tu proyecto.

#### Paso 4 — Reiniciar Cursor

Cierra y vuelve a abrir Cursor. En la barra de chat verás el icono 🔌 si el servidor MCP se conectó correctamente.

#### Paso 5 — Verificar que funciona

En el chat de Cursor, escribe:
> `"Lista todos los archivos JavaScript del proyecto"`

Si el servidor está activo, el modelo responderá con la lista real de archivos del proyecto.

---

### 5 consultas realizadas con MCP filesystem

**Consulta 1:**
> `"¿Cuántas líneas tiene taskflow.js y cuáles son las funciones definidas?"`

Resultado: El modelo leyó el archivo directamente y devolvió el número de líneas y una lista de todas las funciones con sus líneas de inicio.

**Consulta 2:**
> `"¿Hay alguna función duplicada o con lógica similar en el proyecto?"`

Resultado: Identificó dos funciones que calculaban cosas similares sobre el array de tareas y sugirió extraerlas a una utilidad común.

**Consulta 3:**
> `"Lee el README actual y dime qué secciones le faltan para ser completo"`

Resultado: Comparó el README con buenas prácticas de documentación y señaló que faltaban: instrucciones de instalación, estructura del proyecto y ejemplos de uso.

**Consulta 4:**
> `"¿Qué archivos del proyecto no tienen comentarios o documentación?"`

Resultado: Listó los archivos sin JSDoc o comentarios y priorizó cuáles documentar primero según su tamaño.

**Consulta 5:**
> `"Genera un resumen técnico del proyecto para incluir en un portfolio"`

Resultado: El modelo leyó todos los archivos relevantes y generó una descripción técnica precisa con las tecnologías usadas, funcionalidades implementadas y decisiones de diseño.

---

### ¿Cuándo es útil MCP en proyectos reales?

| Caso de uso                         | Utilidad de MCP                                             |
|------------------------------------|-------------------------------------------------------------|
| Proyectos grandes                   | Permite analizar el código base sin copiar manualmente      |
| Auditorías de código                | El modelo puede revisar todos los archivos sistemáticamente |
| Generación de documentación         | Lee el código real y genera docs precisas                   |
| Onboarding de nuevos desarrolladores| "Explícame cómo funciona este módulo" con acceso real       |
| Integración con GitHub MCP          | Puede leer issues, PRs y commits directamente               |
| Integración con bases de datos      | Consultas en lenguaje natural a PostgreSQL o SQLite         |

---

### Servidor MCP de GitHub (bonus)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "tu_token_aquí"
      }
    }
  }
}
```

Con este servidor activo se pueden hacer consultas como:
> `"Lista los últimos 5 commits del repositorio TaskFlow"`  
> `"Crea un issue en GitHub con el título 'Añadir filtro por fecha'"`
