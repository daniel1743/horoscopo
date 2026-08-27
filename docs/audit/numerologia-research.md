# Investigación de referencia: módulo de numerología

## Criterio adoptado

El módulo se implementará como una herramienta **simbólica y educativa**, no como un diagnóstico ni una predicción. La fecha de nacimiento se procesará en memoria en el navegador; no se guardará en Supabase, no aparecerá en URLs, metadata, sitemap, analytics ni publicaciones de Comunidad.

## Fuentes consultadas

1. [Encyclopaedia Britannica — Numerology](https://www.britannica.com/topic/numerology). Define la numerología como el uso de números para interpretar el carácter de una persona o adivinar el futuro, y relaciona la práctica moderna con el nombre y la fecha de nacimiento. Esta referencia justifica mostrar un aviso de límites y no presentar los resultados como hechos científicos.
2. [Numerology.com — Life Path Number: How to Calculate and Its Meaning](https://www.numerology.com/articles/your-numerology-chart/life-path-number-meanings/). Describe un método habitual: reducir por separado mes, día y año, conservar 11, 22 y 33 como números maestros durante la reducción, sumar los tres valores y volver a reducir salvo que el resultado sea uno de esos números maestros.

## Decisión de producto

Se implementará una primera vertical acotada de **Número de camino de vida** con cálculo determinista, explicación del procedimiento visible, significados editoriales propios para 1–9, 11, 22 y 33, pregunta de reflexión y aviso de privacidad. No se añadirán compatibilidad numerológica, pronósticos, nombres ni informes de terceros en esta fase porque ampliarían el tratamiento de datos personales y el alcance editorial sin una necesidad verificada.

## Límites

El resultado es una interpretación cultural de entretenimiento y reflexión. No debe utilizarse para decisiones médicas, psicológicas, legales, financieras o vitales. La implementación no afirma validez científica ni capacidad predictiva.

> La investigación externa se utiliza como referencia de método y lenguaje, no como evidencia de que la numerología prediga hechos.
