# Handoff: Rediseño Estructural de la Tirada de Amor (UI a Lógica)

Este documento detalla la arquitectura visual creada para la experiencia de Tirada de Amor (Tres cartas). La interfaz ha sido rediseñada para ofrecer una experiencia inmersiva basada en estados, pero actualmente funciona con **mocks** y callbacks simulados.

## Objetivo para Codex / Claude (Próxima Fase)
Conectar la lógica de `tarotService.drawThreeCards`, la obtención de cartas reales (Supabase) y el prompt de IA, reemplazando la simulación actual en `ThreeCardLoveExperienceShell.tsx`.

## 1. Componentes Creados

Ubicación: `src/components/tarot/experience/`

- **`ThreeCardLoveExperienceShell.tsx`**: Contenedor principal y máquina de estados.
- **`ThreeCardPositionSlots.tsx`**: Las 3 áreas de colocación.
- **`TarotDeckVisual.tsx`**: Animación de barajado.
- **`TarotCardPicker.tsx`**: Carrusel/abanico de selección de cartas boca abajo.
- **`TarotCardBack.tsx`**: Reverso reutilizable (preparado con `cardBackSrc`).
- **`TarotSelectionProgress.tsx`**: Indicadores de selección.
- **`ThreeCardReadingActions.tsx`**: Acciones principales.
- **`types.ts`**: Tipos locales y estados (`ThreeCardExperienceState`).

## 2. Máquina de Estados Visual Esperada

El componente `ThreeCardLoveExperienceShell` utiliza el tipo `ThreeCardExperienceState`:

1. `preparing`: El usuario ingresa su situación (contexto).
2. `shuffling`: Animación del mazo (duración controlada por timeout o señal del servidor).
3. `selecting`: Muestra el carrusel de 10-78 cartas boca abajo. El usuario hace click.
4. `selected`: El usuario completó las 3 selecciones. Espera acción "Revelar".
5. `revealing`: Las cartas se giran secuencialmente hacia arriba.
6. `interpreting`: Loader mientras se genera la interpretación de la IA.
7. `completed`: Muestra la interpretación final usando `InteractiveThreeCardResult`.

## 3. Puntos de Conexión (Lo que debe hacer Codex)

Actualmente, `ThreeCardLoveExperienceShell.tsx` tiene constantes `MOCK_CANDIDATES`, `MOCK_REVEALED_DATA`, `MOCK_INTERPRETATIONS` y una síntesis hardcodeada en `InteractiveThreeCardResult`.

Codex debe:
1. **Inyectar el Mazo Real**: Modificar `ThreeCardLoveExperienceShell` para recibir la baraja cargada (`useTarotDeck`) y generar las `candidateCards` aleatorias (pueden ser 10, o el mazo completo) y asociarlas a los IDs de Supabase de forma encubierta en el frontend, para que la selección sea aleatoria pero válida.
2. **Llamar a la API**: Cuando se confirma la selección, o en el paso previo a `interpreting`, llamar a `tarotService.drawThreeCards`.
3. **Mapear Resultado Real**: Actualizar el estado `revealedCards` con los datos reales (`name`, `image`) retornados por la API.
4. **Pasar la Lectura Final al Resultado**: Enviar la interpretación y la síntesis generada por la IA al componente `InteractiveThreeCardResult` en lugar de usar el array `MOCK_INTERPRETATIONS`.

## 4. Qué NO Debe Reconstruir Codex

- **No modificar la estructura de los componentes presentacionales** (Slots, Deck, Picker). Ya manejan su propia lógica de UI, animaciones de tailwind e in/out.
- **No alterar el Layout CSS/Tailwind** a menos que sea un fallo real en un dispositivo específico.
- **No reinventar el reverso**. Usar la prop `cardBackSrc` en el Shell si el usuario sube una imagen final.

## 5. Riesgos Responsive y Notas

- El `TarotCardPicker` es un carrusel horizontal estricto (`snap-x`) en móvil. No se recomienda enviar las 78 cartas al DOM en este carrusel (por rendimiento de renders y saturación visual). Se recomienda un subconjunto representativo (ej: 10 cartas preseleccionadas aleatoriamente) para la UI de selección.
- La animación de flip 3D en `ThreeCardPositionSlots` utiliza utilidades estándar de `tailwindcss-animate` (`animate-in flip-in-y`).

---

**Estado Final**: El esqueleto de presentación está listo. Reemplazar los `mocks` por el hook `useTarotDeck` y `tarotService.drawThreeCards`.
