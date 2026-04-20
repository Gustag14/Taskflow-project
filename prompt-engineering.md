# Prompt Engineering aplicado al desarrollo

> Colección de prompts efectivos utilizados durante la Fase 2.  
> Cada prompt incluye el contexto de uso, el resultado obtenido y por qué funciona.

---

## Fundamentos de prompt engineering

Antes de los prompts, un resumen de las técnicas más útiles en desarrollo:

| Técnica              | Descripción                                                      |
|---------------------|------------------------------------------------------------------|
| **Role prompting**  | Asignas un rol al modelo ("eres un senior developer…")          |
| **Few-shot**        | Das ejemplos del input/output esperado antes de la pregunta     |
| **Chain of thought**| Pides que razone paso a paso antes de dar la respuesta final    |
| **Constraining**    | Defines restricciones explícitas (formato, longitud, lenguaje)  |
| **Context loading** | Proporcionas código o contexto completo antes de pedir algo     |

---

## Los 10 prompts más útiles

---

### Prompt 1 — Role + revisión de código

```
Actúa como un desarrollador senior de JavaScript con experiencia en clean code.
Revisa el siguiente código e identifica: 
1. Problemas de rendimiento
2. Malas prácticas
3. Posibles bugs

Sé directo y constructivo. Para cada problema, explica por qué es un problema y propón una solución concreta.

[PEGAR CÓDIGO AQUÍ]
```

**Por qué funciona:** El rol de "senior developer" orienta el modelo hacia un análisis crítico y técnico. Pedir tres categorías específicas evita respuestas genéricas. La instrucción de ser "constructivo" mejora el tono de la respuesta.

**Resultado obtenido en TaskFlow:** Detectó tres funciones que recalculaban el array de tareas en cada render, una variable global innecesaria y un event listener que se añadía repetidamente en cada llamada.

---

### Prompt 2 — Few-shot para generar funciones consistentes

```
Quiero que generes funciones JavaScript siguiendo este estilo:

Ejemplo 1:
Input: "Elimina una tarea por id"
Output:
/**
 * Elimina una tarea del array por su id
 * @param {number} id - Id de la tarea a eliminar
 * @returns {boolean} true si se eliminó, false si no se encontró
 */
function eliminarTarea(id) {
  const index = tareas.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tareas.splice(index, 1);
  persistirTareas();
  return true;
}

Ahora genera con el mismo estilo:
Input: "Marca una tarea como completada por id"
```

**Por qué funciona:** El ejemplo concreto (few-shot) establece el formato exacto esperado: JSDoc, manejo de edge cases, nombre de función en español, llamada a `persistirTareas()`. El modelo replica el patrón de forma muy fiel.

---

### Prompt 3 — Chain of thought para depurar

```
Analiza este bug paso a paso antes de dar la solución:

1. ¿Qué debería hacer el código?
2. ¿Qué hace realmente?
3. ¿En qué línea o lógica está el error?
4. ¿Cuál es la solución más simple?
5. ¿Hay algún riesgo o efecto secundario en la solución?

[PEGAR CÓDIGO CON BUG]
```

**Por qué funciona:** Obligar al modelo a razonar en 5 pasos antes de dar la respuesta final produce diagnósticos más precisos. Sin este prompt, el modelo suele saltar directamente a "la solución" sin verificar los supuestos.

**Resultado obtenido:** Al analizar un bug de `undefined is not a function`, el modelo detectó en el paso 3 que el problema era una función llamada antes de que el DOM estuviera listo, algo que una solución directa podría haber pasado por alto.

---

### Prompt 4 — Refactorización con restricciones

```
Refactoriza la siguiente función JavaScript con estas restricciones:
- No uses librerías externas
- Mantén el mismo comportamiento observable (mismos inputs → mismos outputs)
- Reduce el número de líneas sin sacrificar legibilidad
- Usa ES2020+ (optional chaining, nullish coalescing, etc.)
- Añade JSDoc si no lo tiene

[PEGAR FUNCIÓN]
```

**Por qué funciona:** Las restricciones claras evitan que el modelo reescriba el código con un enfoque completamente diferente o añada dependencias no deseadas. "Mismo comportamiento observable" es clave para no introducir regresiones.

---

### Prompt 5 — Generación de tests unitarios

```
Eres un experto en testing de JavaScript. 
Genera tests unitarios para la siguiente función usando solo funciones nativas (sin frameworks).
Para cada test:
- Da un nombre descriptivo al caso
- Prueba el caso feliz
- Prueba casos límite (array vacío, null, valores inesperados)
- Verifica que los errores se lancen correctamente

[PEGAR FUNCIÓN]
```

**Por qué funciona:** Sin mencionar frameworks (Jest, Mocha), el modelo genera tests simples con `console.assert` o comparaciones directas, útiles para proyectos sin dependencias. Pedir casos límite explícitamente hace que los tests sean realmente útiles.

---

### Prompt 6 — Documentación de proyecto (context loading)

```
Aquí está el código completo del módulo principal de TaskFlow:

[PEGAR TODO EL CÓDIGO]

Con base en este código, escribe:
1. Una descripción general del módulo (2-3 frases)
2. Lista de todas las funciones públicas con su propósito
3. Dependencias o variables globales que necesita
4. Posibles mejoras futuras

Formato: Markdown con headers y código inline donde sea relevante.
```

**Por qué funciona:** Cargar todo el contexto antes de pedir documentación permite que el modelo entienda las interdependencias entre funciones, en lugar de documentar cada función de forma aislada.

---

### Prompt 7 — Generar README con estructura definida

```
Escribe el README.md para el proyecto TaskFlow con esta estructura exacta:

# TaskFlow
## ¿Qué es?
## Características principales
## Tecnologías usadas
## Instalación y uso
## Estructura del proyecto
## Funcionalidades
## Contribuir
## Licencia

Usa un tono técnico pero accesible. Incluye emojis moderados. 
El proyecto es: una aplicación de gestión de tareas en JavaScript vanilla sin frameworks.
```

**Por qué funciona:** Definir la estructura exacta del README elimina la variabilidad del modelo. Sin esto, el modelo puede generar secciones irrelevantes o saltarse partes importantes.

---

### Prompt 8 — Comparativa técnica entre enfoques

```
Compara estos dos enfoques para [PROBLEMA] en JavaScript:

Enfoque A: [código o descripción]
Enfoque B: [código o descripción]

Para cada uno evalúa:
- Rendimiento
- Legibilidad
- Mantenibilidad
- Casos en los que es más apropiado

Concluye con una recomendación clara.
```

**Por qué funciona:** Pedir evaluación en dimensiones concretas (rendimiento, legibilidad…) hace que la comparativa sea accionable. La recomendación final fuerza al modelo a no quedarse en un "depende" ambiguo.

---

### Prompt 9 — Generación de ideas de funcionalidades

```
Actúa como un product manager técnico. 
El proyecto es TaskFlow: una app de gestión de tareas en JavaScript vanilla.

Propón 10 funcionalidades que aporten valor real al usuario final.
Para cada una indica:
- Nombre de la funcionalidad
- Descripción en una frase
- Dificultad de implementación (Baja / Media / Alta)
- Impacto para el usuario (Bajo / Medio / Alto)

Ordénalas de más a menos impacto.
```

**Por qué funciona:** El rol de "product manager técnico" hace que las sugerencias sean equilibradas entre valor de usuario y viabilidad técnica. La tabla de dificultad/impacto facilita tomar decisiones de priorización.

---

### Prompt 10 — Code review simulado

```
Simula que eres el revisor en un pull request profesional.
Lee el siguiente código y escribe comentarios de revisión como lo haría un equipo de desarrollo real:
- Comenta cada problema o mejora con la línea aproximada
- Usa un tono constructivo, no condescendiente
- Distingue entre bloqueantes (must fix) y sugerencias (nice to have)
- Valora también lo que está bien hecho

[PEGAR CÓDIGO]
```

**Por qué funciona:** La simulación de un code review profesional hace que el modelo sea más sistemático y matizado. Distinguir "must fix" de "nice to have" es muy útil para priorizar antes de hacer commit.

---

## Patrones de prompt que NO funcionan bien

| Patrón                          | Problema                                              |
|--------------------------------|-------------------------------------------------------|
| `"Mejora este código"`          | Demasiado vago, el modelo puede cambiar todo          |
| `"¿Está bien este código?"`     | Tiende a responder "sí" sin análisis real             |
| `"Escribe código para X"`       | Sin restricciones, puede usar librerías no deseadas   |
| `"Explícame todo sobre X"`      | Respuestas largas y poco accionables                  |
| Prompts sin contexto de código  | El modelo inventa o supone la estructura del proyecto |

---

## Plantilla base reutilizable

```
Contexto: [describe brevemente el proyecto y tecnologías]
Rol: [qué tipo de experto debe ser el modelo]
Tarea: [qué necesitas exactamente]
Restricciones: [lo que NO debe hacer o incluir]
Formato de respuesta: [Markdown / código / lista / etc.]

[CÓDIGO O INFORMACIÓN RELEVANTE]
```
