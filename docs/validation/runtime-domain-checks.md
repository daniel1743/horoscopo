# Runtime checks de dominio

**Fecha:** 27 de agosto de 2026
**Rama:** `redesign/fases-1-5`
**Alcance:** ejecución local temporal fuera del repositorio, sin Supabase, sin datos de usuario y sin persistencia remota.

| Motor | Resultado |
| --- | --- |
| Tarot | Baraja local de 78 cartas; Carta del Día determinista; toggle de reversos respetado; decisión con 2 cartas únicas |
| Carta natal | 10 placements, 12 casas, 4 ángulos y 15 aspectos; resultado determinista para la misma entrada |
| Tránsitos | 10 cuerpos, 25 contactos finitos y velocidades deterministas |
| Sinastría | 10 placements por persona y 34 contactos finitos; resultado determinista |
| Numerología | `1980-10-22` → mes 1, día maestro 22, año 9, suma 32, camino de vida 5; fecha futura rechazada |

El chequeo se ejecutó con `npx --yes tsx --tsconfig tsconfig.json /home/ubuntu/creovision-runtime-final-check.ts`. El archivo temporal vive fuera del repositorio y debe eliminarse después de la validación final. Estos resultados prueban invariantes locales, no precisión profesional, E2E, RLS ni comportamiento en producción.
