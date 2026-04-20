# Reflexión final sobre IA y programación

> Escrita con mis propias palabras al finalizar la Fase 2.  
> Esta reflexión recoge mi experiencia real usando herramientas de IA durante el desarrollo de TaskFlow.

---

## En qué tareas la IA me ha ayudado más

La diferencia más grande la noté en las tareas que antes me consumían tiempo sin enseñarme nada nuevo. Escribir JSDoc para diez funciones, por ejemplo, es un trabajo mecánico: sabés exactamente qué decir, pero tardás veinte minutos en escribirlo todo. Con IA, son dos minutos de revisión. Ese tiempo lo puse en pensar la arquitectura del proyecto, que sí me importa y sí me enseña.

También me ayudó mucho en la detección de bugs sutiles. Hay errores que cuando los mirás durante mucho tiempo dejan de ser visibles, el clásico "no veo el problema porque ya sé lo que debería hacer". Pasarle el código a Claude con el contexto del error me sacó de ese bloqueo más de una vez, no porque la IA sea más inteligente, sino porque no tiene el sesgo de haber escrito el código.

La generación de ideas fue una sorpresa positiva. Usar IA como un product manager imaginario ("¿qué funcionalidades debería tener TaskFlow?") me dio perspectiva sobre el proyecto que yo, por estar con la cabeza dentro del código, no tenía.

---

## Casos donde la IA falló o generó código incorrecto

El caso más frecuente fue cuando le pedía código sin darle suficiente contexto. La IA generaba algo plausible pero incompatible con la estructura real del proyecto: nombres de funciones que no existían, suposiciones sobre el formato de los datos que eran incorrectas. Aprendí rápido que el contexto no es opcional.

Hubo un caso concreto con la función de persistencia en localStorage. Le pedí a Claude que la refactorizara y generó una versión que usaba `try/catch` asincrónico con async/await, pero `localStorage` es completamente síncrono. El código se veía bien, compilaba, pero el manejo de errores no funcionaba como se esperaba. No era un error grotesco, pero sí uno que podría haber metido en producción sin darme cuenta si no lo hubiese revisado.

Otro fallo recurrente: cuando le pedía que "mejorara" algo sin definir qué significaba mejorar, el modelo tendía a reescribir todo con un enfoque diferente al mío. A veces el resultado era mejor objetivamente, pero perdía consistencia con el resto del proyecto. Aprendí a ser muy específico sobre qué parte quería cambiar y qué tenía que quedar igual.

---

## Riesgos de depender demasiado de la IA

El riesgo más serio que vi en mí mismo durante este proyecto fue dejar de pensar antes de preguntar. En los primeros días del ejercicio, me encontré buscando en Claude problemas que podría haber resuelto solo en cinco minutos. No porque no supiera, sino porque era más fácil delegar.

Eso es peligroso por dos razones. La primera es que si no resolvés el problema, no aprendés a resolverlo, y la próxima vez que aparezca sin IA disponible estarás igual de perdido. La segunda es que si no entendés el problema, tampoco podés evaluar bien si la solución que te da la IA es correcta. Y confiar ciegamente en código generado en un entorno de producción es una forma segura de introducir bugs difíciles de rastrear.

También hay un riesgo más sutil: el código generado por IA tiende a ser genérico. Funciona, pero no refleja las decisiones específicas de tu proyecto. Si todo el código lo escribe la IA, el proyecto termina sin una voz técnica propia, sin las decisiones conscientes que hacen que un codebase sea coherente.

---

## Cuándo prefiero programar sin asistencia

Prefiero hacerlo solo cuando estoy aprendiendo algo nuevo. Si estoy estudiando cómo funciona el event loop, o implementando un algoritmo por primera vez, la IA me roba el proceso. Resolver el problema con fricción es exactamente lo que lo hace memorable.

También prefiero programar sin IA en la fase de diseño: cuando tengo que decidir cómo estructurar los módulos, qué datos manejar y dónde. Esas son decisiones que requieren conocer el problema en profundidad, y delegarlas al modelo produce arquitecturas que técnicamente funcionan pero que no se adaptan bien a los requisitos reales del proyecto.

Y en general, cuando el problema es pequeño y ya sé cómo resolverlo, abrir el chat es más lento que simplemente escribir el código.

---

## Conclusión

Después de esta fase, mi relación con las herramientas de IA cambió. Antes las veía o como una trampa (hacer que pienses menos) o como magia (resuelven cualquier cosa). Ahora las veo como un colaborador con capacidades muy específicas: rápido en lo mecánico, útil para sacar perspectiva, pero dependiente de que yo sepa exactamente qué pedirle y que pueda evaluar lo que devuelve.

La habilidad que más desarrollé no fue usar la IA. Fue aprender a cuándo no usarla.
