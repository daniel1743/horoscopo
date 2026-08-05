# Backlog de funciones pendientes Creovision

Fecha: 2026-08-04

## P0

### Paginas legales reales

- Rutas: `/privacidad`, `/terminos`, `/cookies`, `/aviso-de-responsabilidad`
- Estado actual: SOLO_VISUAL
- Que existe: route files y componente `Placeholder`.
- Que falta: contenido legal real revisado para el servicio, privacidad, cookies, terminos y aviso de responsabilidad.
- Dependencias: definicion legal/compliance, politica de datos, cookies reales usadas, contacto responsable.
- Complejidad estimada: media.
- Agente recomendado: redaccion legal + Codex para integracion.
- Criterios para habilitar launch: contenido real publicado, sin placeholder, enlaces visibles revisados.

### Horoscopo publico

- Rutas: `/horoscopo`, `/horoscopo/hoy`, `/horoscopo/semana`, `/horoscopo/mes`, `/horoscopo/:sign`
- Estado actual: FUNCIONAL_CON_DATOS_PENDIENTES
- Que existe: rutas, componentes, repositorio Supabase, estados vacios.
- Que falta: contenido publicado real. La verificacion runtime encontro 0 horoscopos publicados accesibles.
- Dependencias: tabla `horoscopes`, proceso editorial/publicacion, calendario de periodos.
- Complejidad estimada: media.
- Agente recomendado: contenido/editorial + Codex si hace falta validar queries.
- Criterios para volver a habilitar: al menos 12 entradas publicadas para el periodo diario actual y estrategia para semana/mes; smoke test sin estado vacio.

### Rutas 404 anunciables de Astrologia

- Rutas: `/astrologia/carta-natal`, `/astrologia/ascendente`, `/astrologia/signo-lunar`
- Estado actual: ROTO_RUNTIME
- Que existe: RouteKeys en `src/config/routes.ts`.
- Que falta: route files, UI de entrada, calculos, validacion y contenido interpretativo.
- Dependencias: motor astrologico, modelo de datos de fecha/hora/lugar, UX de privacidad.
- Complejidad estimada: alta.
- Agente recomendado: Codex + especialista de dominio.
- Criterios para volver a habilitar: rutas HTTP 200, flujo completo de usuario, calculo verificable, manejo de errores y no placeholders.

## P1

### Hub Astrologia

- Ruta: `/astrologia`
- Estado actual: SOLO_VISUAL
- Que existe: route file y `Placeholder`.
- Que falta: propuesta funcional real o hub que solo enlace funciones implementadas.
- Dependencias: priorizacion de carta natal/ascendente/signo lunar.
- Complejidad estimada: media.
- Agente recomendado: Codex.
- Criterios para volver a habilitar: hub sin placeholder y sin enlaces a 404.

### Compatibilidad completa

- Rutas: `/compatibilidad`, `/compatibilidad/:signA/:signB`
- Estado actual: FUNCIONAL_PARCIAL
- Que existe: selector, hub, detalle, estado vacio, repositorio Supabase.
- Que falta: cobertura de datos. Runtime encontro 3 perfiles accesibles, no 78.
- Dependencias: completar `compatibility_profiles`.
- Complejidad estimada: media.
- Agente recomendado: editorial/data + Codex para auditoria.
- Criterios para considerar FUNCIONAL_VALIDADO: cobertura publicada suficiente o UX que comunique claramente disponibilidad parcial sin prometer cobertura total.

### Contenido lunar editorial

- Rutas: `/luna/fases`, `/luna/fases/:slug`
- Estado actual: FUNCIONAL_PARCIAL
- Que existe: calculos lunares reales y paginas.
- Que falta: `moon_content` accesible o fuente editorial alternativa. Runtime REST devolvio 404 para `moon_content`.
- Dependencias: tabla/contenido o adaptacion a contenido local.
- Complejidad estimada: baja-media.
- Agente recomendado: Codex + editorial.
- Criterios para completar: las cuatro fases principales tienen contenido editorial visible o la UI declara que solo muestra datos astronomicos.

### Asistente y Mi espacio

- Rutas: `/asistente`, `/mi-espacio/*`
- Estado actual: FUNCIONAL_PARCIAL / REQUIERE_AUTENTICACION
- Que existe: paginas, auth guard, componentes.
- Que falta: prueba runtime autenticada con usuario real de QA; validar memoria, favoritos, historial y lecturas guardadas.
- Dependencias: cuenta de prueba, Supabase Auth, RLS.
- Complejidad estimada: media.
- Agente recomendado: Codex con credenciales de prueba provistas por usuario.
- Criterios para completar: login, logout, memoria, favoritos, historial y lectura guardada probados sin errores criticos.

## P2

### Paginas informativas

- Rutas: `/nosotros`, `/metodo`, `/ayuda`, `/contacto`
- Estado actual: SOLO_VISUAL
- Que existe: route files y placeholders.
- Que falta: contenido real; contacto necesita formulario o canal claro.
- Dependencias: copy de marca y soporte.
- Complejidad estimada: baja.
- Agente recomendado: Codex + contenido.
- Criterios para completar: sin `Placeholder`, texto real, contacto accionable.

### Catalogo de tiradas

- Ruta anterior en Home: `/tarot/tiradas`
- Estado actual: ROTO_RUNTIME, no existe route file.
- Que existe: Home tenia CTA configurado; tarjetas destacadas usan estados `enabled`/`coming_soon`.
- Que falta: ruta de catalogo si se quiere una pagina "todas las tiradas".
- Dependencias: definicion de tiradas disponibles y futuras.
- Complejidad estimada: baja.
- Agente recomendado: Codex.
- Criterios para habilitar: route file existe, lista tiradas reales, no enlaza funciones ocultas.

## Reactivacion

Para volver a exponer funciones ocultas:

1. Cambiar datos/configuracion solo cuando runtime valide el flujo.
2. Restaurar visibilidad en `src/config/navigation.ts`, `src/config/footer.ts`, `src/routes/sitemap[.]xml.ts`, `src/config/search-static-content.ts` y `src/config/home.ts` segun corresponda.
3. Ejecutar smoke test de rutas visibles.
4. Ejecutar lint acotado y `npm run build`.
