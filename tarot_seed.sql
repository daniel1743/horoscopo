-- Catalogo editorial de 78 cartas Rider-Waite-Smith.
-- Generado desde catalogo_tarot.json. No ejecutar sin revision y aprobacion.
-- Politica de conflicto:
-- - Conserva id y created_at porque no forman parte del INSERT ni del UPDATE.
-- - Sobrescribe todos los campos importables cuando la fila existente es demo.
-- - No modifica una fila existente cuando tarot_cards.is_demo = false.

INSERT INTO public.tarot_cards (
  card_key, slug, name, arcana, "number", suit, rank,
  summary, upright_meaning, reversed_meaning, keywords,
  reflection_question, yes_no_tendency, image_key,
  display_order, status, is_demo
)
VALUES
(
  'the_fool', 'el-loco', 'El Loco', 'major', 0, NULL, NULL,
  'El Loco simboliza el punto de partida: un momento en el que la libertad, la ligereza y la curiosidad pesan más que las certezas. Invita a mirar el camino con apertura, aceptando que aún no se conoce por completo.', 'Sugiere el inicio de una etapa. Aparece cuando conviene atreverse a moverse sin exigirse tenerlo todo resuelto. Es un impulso hacia lo nuevo, pero acompañado de sensatez. Observa qué te llama, qué te suelta el cuerpo, qué se abre si dejas ir el control. No implica que el camino sea sencillo, sí que aún no está escrito.', 'Puede señalar que la apertura se volvió impulsividad o que el miedo a equivocarse impide comenzar. Propone distinguir entre un riesgo elegido con conciencia y una huida de las responsabilidades presentes.', '["comienzo","libertad","confianza","apertura"]'::jsonb,
  '¿Qué paso pequeño podría dar hoy si suelto un poco la exigencia de tenerlo claro?', 'favorable', 'tarot_major_00_the_fool', 0, 'draft', true
),
(
  'the_magician', 'el-mago', 'El Mago', 'major', 1, NULL, NULL,
  'El Mago habla de recursos disponibles. Aparece cuando una intención puede empezar a tomar forma concreta si se combinan atención, voluntad y una acción sostenida.', 'Indica que las herramientas necesarias ya están al alcance, aunque falte organizarlas. Es momento de traducir una idea en un gesto concreto: una conversación, un plan simple, un primer paso. También pide honestidad para reconocer qué se está usando y con qué intención. La energía es de comienzo activo, no de resultado inmediato.', 'Invita a revisar si los recursos están dispersos, si falta práctica o si la intención no coincide con la manera de actuar. También advierte sobre usar la habilidad para impresionar en vez de construir algo honesto.', '["voluntad","recursos","iniciativa"]'::jsonb,
  '¿Qué recurso ya tengo y aún no he puesto al servicio de lo que me importa?', 'favorable', 'tarot_major_01_the_magician', 1, 'draft', true
),
(
  'the_high_priestess', 'la-sacerdotisa', 'La Sacerdotisa', 'major', 2, NULL, NULL,
  'La Sacerdotisa representa el saber interno que aún no tiene palabras. Es un llamado a hacer espacio al silencio antes de decidir, especialmente cuando la información externa no alcanza.', 'Aparece cuando la respuesta útil no viene desde el análisis inmediato, sino desde una escucha más lenta. Sugiere pausar, dormir sobre el tema, escribir sin editar o simplemente esperar sin forzar. No invita a la inacción, sino a no confundir prisa con claridad.', 'Puede reflejar desconexión de la propia percepción, secretos que pesan o una espera usada para evitar decidir. Conviene separar la intuición serena de las conclusiones nacidas del temor.', '["intuición","silencio","paciencia"]'::jsonb,
  '¿Qué me está diciendo mi intuición cuando dejo de intentar tener la razón?', 'open', 'tarot_major_02_the_high_priestess', 2, 'draft', true
),
(
  'the_empress', 'la-emperatriz', 'La Emperatriz', 'major', 3, NULL, NULL,
  'La Emperatriz habla de cuidado, creación y presencia. Señala un momento fértil para sostener aquello que ya vive: un vínculo, un proyecto, una parte de ti que pide atención amable.', 'Sugiere generar condiciones para que algo crezca sin apuros: descanso suficiente, tiempo con quienes te nutren, gestos concretos de cuidado. También puede señalar la necesidad de revisar dónde estás dando demasiado y dónde te estás olvidando. Fertilidad simbólica, no promesa material.', 'Señala cuidado agotado, creatividad bloqueada o dificultad para recibir apoyo. Pide atender las necesidades propias y revisar si proteger algo está dejando poco espacio para que crezca por sí mismo.', '["cuidado","creatividad","presencia"]'::jsonb,
  '¿Qué necesita hoy más presencia y menos exigencia por mi parte?', 'favorable', 'tarot_major_03_the_empress', 3, 'draft', true
),
(
  'the_emperor', 'el-emperador', 'El Emperador', 'major', 4, NULL, NULL,
  'El Emperador representa la capacidad de dar estructura a lo importante. Habla de límites claros, responsabilidad y decisiones que necesitan una base estable.', 'Sugiere ordenar prioridades, definir reglas comprensibles y asumir la parte de autoridad que corresponde. La firmeza resulta útil cuando protege un propósito compartido y deja espacio para escuchar.', 'Puede señalar rigidez, necesidad de control o una estructura que ya no sirve a quienes debía sostener. Conviene revisar qué norma aporta seguridad y cuál solo evita adaptarse.', '["estructura","responsabilidad","límites","estabilidad"]'::jsonb,
  '¿Qué límite claro ayudaría a sostener mejor lo que hoy depende de mí?', 'favorable', 'tarot_major_04_the_emperor', 4, 'draft', true
),
(
  'the_hierophant', 'el-sumo-sacerdote', 'El Sumo Sacerdote', 'major', 5, NULL, NULL,
  'El Sumo Sacerdote pone el foco en las tradiciones, los aprendizajes compartidos y las personas que transmiten experiencia. Invita a comprender una regla antes de aceptarla o cuestionarla.', 'Puede ser un buen momento para estudiar, buscar orientación responsable o participar en una práctica con sentido comunitario. También recuerda que el conocimiento se vuelve útil cuando puede aplicarse con criterio propio.', 'Advierte sobre obediencia automática, consejos que no consideran el contexto o rechazo de toda tradición por principio. Propone construir una relación más consciente con aquello que se ha heredado.', '["aprendizaje","tradición","criterio","comunidad"]'::jsonb,
  '¿Qué enseñanza heredada quiero comprender mejor antes de decidir si aún me representa?', 'open', 'tarot_major_05_the_hierophant', 5, 'draft', true
),
(
  'the_lovers', 'los-enamorados', 'Los Enamorados', 'major', 6, NULL, NULL,
  'Los Enamorados representan la elección consciente. Aparece cuando conviene mirar de frente aquello que valoras y decidir desde ahí, no desde la costumbre ni desde la presión externa.', 'Sugiere que hay una decisión importante en camino, no necesariamente amorosa. Puede tratarse de un vínculo, una prioridad, un modo de vivir. Invita a nombrar lo que realmente importa, ordenar los criterios y elegir con lucidez, sabiendo que toda elección deja algo fuera.', 'Puede mostrar una elección postergada, valores en conflicto o acuerdos que ya no representan a quienes participan. La claridad comienza al reconocer qué costo tiene seguir actuando por inercia.', '["elección","valores","vínculo"]'::jsonb,
  '¿Qué elegiría hoy si estuviera atendiendo primero a lo que me importa?', 'open', 'tarot_major_06_the_lovers', 6, 'draft', true
),
(
  'the_chariot', 'el-carro', 'El Carro', 'major', 7, NULL, NULL,
  'El Carro habla de avanzar coordinando fuerzas que tiran en direcciones distintas. La determinación importa, pero también la capacidad de elegir un rumbo sostenible.', 'Señala concentración, movimiento y voluntad para atravesar una etapa exigente. Conviene definir el destino, ajustar el ritmo y evitar que la urgencia convierta el progreso en atropello.', 'Puede mostrar prisa sin dirección, esfuerzos dispersos o una competencia que consume más de lo que aporta. Antes de insistir, ayuda recuperar el control del ritmo y revisar el objetivo.', '["dirección","determinación","avance","coordinación"]'::jsonb,
  '¿Qué necesito alinear para avanzar sin pelear conmigo durante el trayecto?', 'favorable', 'tarot_major_07_the_chariot', 7, 'draft', true
),
(
  'strength', 'la-fuerza', 'La Fuerza', 'major', 8, NULL, NULL,
  'La Fuerza sugiere sostener con firmeza y amabilidad. No habla de imponer, sino de acompañar aquello difícil sin desbordarse ni endurecerse.', 'Indica un momento donde conviene regular la reacción antes que ganar la discusión. La fuerza real aparece en el pulso lento: respirar antes de responder, poner un límite sin agresión, seguir haciendo lo que corresponde aunque no haya aplauso. Es una energía de paciencia activa, no de sumisión.', 'Sugiere cansancio, inseguridad o una reacción intensa que oculta vulnerabilidad. No pide dominar lo que se siente, sino recuperar el centro y elegir una respuesta proporcional.', '["paciencia","coraje","autocuidado"]'::jsonb,
  '¿En qué situación puedo hoy responder desde la calma en lugar de la reacción?', 'favorable', 'tarot_major_08_strength', 8, 'draft', true
),
(
  'the_hermit', 'el-ermitano', 'El Ermitaño', 'major', 9, NULL, NULL,
  'El Ermitaño invita a un tiempo de pausa consciente para revisar de dónde vienes, dónde estás y qué necesitas. Es una energía de retiro breve, no de aislamiento permanente.', 'Aparece cuando el ruido externo dificulta escuchar lo propio. Sugiere reducir estímulos, revisar decisiones con calma y consultar solo a quien realmente aporta claridad. También puede señalar que otras personas necesitan tu espacio de escucha, sin apurar respuestas ni imponer soluciones.', 'Puede indicar aislamiento prolongado, exceso de análisis o resistencia a pedir una mirada externa. El retiro deja de ser fértil cuando impide volver al vínculo y poner a prueba lo aprendido.', '["pausa","introspección","claridad"]'::jsonb,
  '¿Qué necesitaría escuchar mejor si bajara el volumen de lo externo?', 'caution', 'tarot_major_09_the_hermit', 9, 'draft', true
),
(
  'wheel_of_fortune', 'la-rueda-de-la-fortuna', 'La Rueda de la Fortuna', 'major', 10, NULL, NULL,
  'La Rueda de la Fortuna recuerda que las circunstancias cambian y que ningún momento permanece intacto. Su propuesta es reconocer el ciclo presente y responder con flexibilidad.', 'Puede aparecer ante un giro, una oportunidad inesperada o el cierre natural de una etapa. No garantiza buena suerte: invita a observar qué se mueve y qué decisión permite acompañar ese cambio.', 'Señala resistencia a una transición, repetición de un patrón o sensación de estar a merced de factores externos. Recuperar una pequeña área de elección puede romper la inercia.', '["ciclo","cambio","oportunidad","adaptación"]'::jsonb,
  '¿Qué cambio ya está ocurriendo y cómo puedo responder sin negar su movimiento?', 'open', 'tarot_major_10_wheel_of_fortune', 10, 'draft', true
),
(
  'justice', 'la-justicia', 'La Justicia', 'major', 11, NULL, NULL,
  'La Justicia invita a mirar hechos, consecuencias y responsabilidades con la mayor imparcialidad posible. Pide decisiones coherentes con los valores que se declaran.', 'Favorece revisar información, escuchar más de una perspectiva y hacerse cargo del efecto de los propios actos. La claridad no elimina la complejidad, pero permite elegir con mejores fundamentos.', 'Puede indicar sesgo, evasión de responsabilidad o un juicio apresurado. Conviene comprobar datos, reconocer intereses personales y reparar aquello que sea posible sin buscar excusas.', '["equidad","consecuencia","honestidad","decisión"]'::jsonb,
  '¿Qué hecho necesito considerar con más honestidad antes de tomar una posición?', 'open', 'tarot_major_11_justice', 11, 'draft', true
),
(
  'the_hanged_man', 'el-colgado', 'El Colgado', 'major', 12, NULL, NULL,
  'El Colgado representa una pausa que cambia la perspectiva. Algo no avanza al ritmo esperado y esa suspensión puede revelar una forma distinta de comprenderlo.', 'Sugiere dejar de forzar una respuesta, observar desde otro ángulo y aceptar temporalmente la incertidumbre. Soltar el control no equivale a rendirse, sino a crear espacio para una comprensión nueva.', 'Puede mostrar estancamiento sostenido por indecisión, sacrificios sin propósito o espera pasiva. Es momento de preguntar qué aprendizaje falta y qué acción pequeña permitiría salir del bloqueo.', '["pausa","perspectiva","entrega","revisión"]'::jsonb,
  '¿Qué podría comprender si dejo de mirar esta situación desde mi posición habitual?', 'caution', 'tarot_major_12_the_hanged_man', 12, 'draft', true
),
(
  'death', 'la-muerte', 'La Muerte', 'major', 13, NULL, NULL,
  'La Muerte simboliza el final necesario de una forma, una etapa o una identidad. No describe un hecho literal: señala que algo necesita concluir para liberar energía.', 'Acompaña procesos de cierre, duelo simbólico y transformación profunda. Invita a reconocer lo terminado, despedirlo con respeto y evitar llenar de inmediato el espacio que deja.', 'Puede reflejar apego a lo conocido, cierre incompleto o temor a una transición inevitable. Avanzar requiere nombrar qué se perdió y qué ya no conviene sostener.', '["cierre","transformación","despedida","renovación"]'::jsonb,
  '¿Qué final necesito reconocer para dejar de gastar energía en mantenerlo abierto?', 'caution', 'tarot_major_13_death', 13, 'draft', true
),
(
  'temperance', 'la-templanza', 'La Templanza', 'major', 14, NULL, NULL,
  'La Templanza habla de combinar elementos distintos hasta encontrar una medida habitable. Su equilibrio es dinámico y se ajusta con atención, no con perfección.', 'Sugiere moderar extremos, integrar aprendizajes y dar tiempo a un proceso que necesita madurar. Pequeños ajustes constantes pueden ser más eficaces que una solución drástica.', 'Puede señalar exceso, impaciencia o dificultad para conciliar necesidades legítimas. Conviene reducir estímulos, revisar el ritmo y buscar una proporción más realista.', '["moderación","integración","paciencia","armonía"]'::jsonb,
  '¿Qué ajuste pequeño devolvería una proporción más sana a mi día?', 'favorable', 'tarot_major_14_temperance', 14, 'draft', true
),
(
  'the_devil', 'el-diablo', 'El Diablo', 'major', 15, NULL, NULL,
  'El Diablo ilumina apegos, impulsos y acuerdos que limitan más de lo que parece. Mirarlos sin vergüenza permite recuperar capacidad de elección.', 'Puede mostrar una costumbre difícil de soltar, una relación de dependencia o una satisfacción inmediata con costo oculto. La carta invita a reconocer el patrón y buscar apoyo adecuado si hace falta.', 'Señala conciencia creciente sobre una atadura y disposición a cambiarla, aunque el proceso no sea lineal. También advierte contra creer que el problema desapareció antes de consolidar nuevos límites.', '["apego","sombra","elección","límite"]'::jsonb,
  '¿Qué hábito me ofrece alivio inmediato pero reduce mi libertad a largo plazo?', 'caution', 'tarot_major_15_the_devil', 15, 'draft', true
),
(
  'the_tower', 'la-torre', 'La Torre', 'major', 16, NULL, NULL,
  'La Torre representa una verdad o un cambio que desarma una estructura insostenible. Lo inesperado puede exigir reorganizar prioridades con rapidez y cuidado.', 'Aparece cuando una certeza pierde fundamento o un plan necesita rehacerse. Recomienda atender primero lo esencial, pedir apoyo y evitar decisiones impulsivas mientras baja la intensidad.', 'Puede indicar que se está posponiendo una conversación necesaria o intentando sostener una apariencia frágil. También refleja una crisis interna que otros aún no perciben.', '["ruptura","revelación","reorganización","verdad"]'::jsonb,
  '¿Qué estructura sigo defendiendo aunque ya no pueda sostener lo que necesito?', 'caution', 'tarot_major_16_the_tower', 16, 'draft', true
),
(
  'the_star', 'la-estrella', 'La Estrella', 'major', 17, NULL, NULL,
  'La Estrella representa un respiro después de un tiempo difícil. Aparece cuando algo vuelve a ser posible, sin prometer que la recuperación será rápida ni completa.', 'Sugiere que la esperanza puede volver a tener un lugar, sostenida por cuidado real y por pequeños actos concretos. Indica un tiempo para reparar vínculos, retomar prácticas de bienestar y volver a confiar con prudencia. No promete un giro milagroso, sí una dirección más amable.', 'Refleja desaliento, comparación o dificultad para reconocer avances discretos. Invita a sostener expectativas realistas y a cuidar la esperanza con acciones posibles, sin exigir una recuperación inmediata.', '["esperanza","serenidad","recuperación"]'::jsonb,
  '¿Qué gesto pequeño puedo hacer hoy para cuidar mi esperanza?', 'favorable', 'tarot_major_17_the_star', 17, 'draft', true
),
(
  'the_moon', 'la-luna', 'La Luna', 'major', 18, NULL, NULL,
  'La Luna señala un terreno de emociones intensas, señales ambiguas e imaginación activa. No todo está claro y conviene avanzar sin convertir una impresión en certeza.', 'Invita a escuchar sueños y sensaciones como pistas, no como pruebas definitivas. Dar tiempo, contrastar información y cuidar el descanso ayuda a atravesar la confusión.', 'Puede anunciar que una niebla emocional empieza a disiparse o que un temor oculto se vuelve reconocible. También pide vigilar la tendencia a negar lo incómodo por querer claridad inmediata.', '["incertidumbre","imaginación","emoción","discernimiento"]'::jsonb,
  '¿Qué parte de mi inquietud es un dato y qué parte todavía es una interpretación?', 'caution', 'tarot_major_18_the_moon', 18, 'draft', true
),
(
  'the_sun', 'el-sol', 'El Sol', 'major', 19, NULL, NULL,
  'El Sol representa claridad, vitalidad y una alegría que puede compartirse. Ilumina lo que funciona sin negar el trabajo que permitió llegar hasta aquí.', 'Favorece la expresión directa, el reconocimiento de avances y los vínculos donde es posible mostrarse con sencillez. Disfrutar el presente también puede ser una forma de cuidado.', 'Puede reflejar expectativas demasiado altas, dificultad para celebrar o entusiasmo que necesita descanso. La luz sigue disponible, pero quizá de una manera más discreta de la imaginada.', '["claridad","vitalidad","alegría","presencia"]'::jsonb,
  '¿Qué logro sencillo merece ser reconocido sin restarle valor?', 'favorable', 'tarot_major_19_the_sun', 19, 'draft', true
),
(
  'judgement', 'el-juicio', 'El Juicio', 'major', 20, NULL, NULL,
  'El Juicio habla de escuchar un llamado interno después de revisar la propia historia. Invita a responder desde lo aprendido, no desde la culpa.', 'Puede marcar una evaluación honesta, una segunda oportunidad o la decisión de actuar de acuerdo con una convicción madura. Reconocer errores permite reparar y elegir de otra manera.', 'Señala autocrítica paralizante, miedo a exponerse o resistencia a cerrar una evaluación pendiente. La responsabilidad resulta más útil cuando conduce a una acción concreta.', '["revisión","llamado","responsabilidad","renovación"]'::jsonb,
  '¿Qué decisión cambia cuando miro mi pasado como aprendizaje y no como condena?', 'favorable', 'tarot_major_20_judgement', 20, 'draft', true
),
(
  'the_world', 'el-mundo', 'El Mundo', 'major', 21, NULL, NULL,
  'El Mundo simboliza integración y cierre de un recorrido significativo. Permite reconocer cómo las partes dispersas han construido una experiencia completa.', 'Sugiere culminación, pertenencia y capacidad de compartir lo aprendido. Antes de abrir otra etapa, conviene celebrar, documentar el proceso y despedirse de la versión anterior.', 'Puede mostrar un asunto casi terminado que aún requiere atención o dificultad para aceptar que una etapa concluyó. Completar el último detalle evita llevar una deuda innecesaria al siguiente ciclo.', '["culminación","integración","pertenencia","cierre"]'::jsonb,
  '¿Qué falta reconocer o completar para dar por cerrado este recorrido?', 'favorable', 'tarot_major_21_the_world', 21, 'draft', true
),
(
  'wands_ace', 'as-de-bastos', 'As de Bastos', 'minor', 1, 'wands', 'ace',
  'El As de Bastos representa una chispa creativa que despierta ganas de comenzar. La energía está disponible, pero necesita un cauce concreto.', 'Favorece probar una idea, iniciar una práctica o acercarse a algo que devuelve entusiasmo. Un primer experimento pequeño permitirá saber si el impulso puede sostenerse.', 'Puede indicar entusiasmo bloqueado, agotamiento o una idea que todavía no encuentra forma. Conviene recuperar energía y reducir el comienzo a una acción posible.', '["impulso","creatividad","inicio","entusiasmo"]'::jsonb,
  '¿Qué idea merece hoy una primera prueba breve y concreta?', 'favorable', 'tarot_wands_ace', 100, 'draft', true
),
(
  'wands_two', 'dos-de-bastos', 'Dos de Bastos', 'minor', 2, 'wands', 'two',
  'El Dos de Bastos observa el horizonte desde una posición ya conocida. Hay potencial, pero avanzar exige elegir entre seguridad y expansión.', 'Invita a comparar opciones, definir alcance y preparar los recursos antes de moverse. La visión se vuelve plan cuando incorpora límites y próximos pasos.', 'Puede señalar temor a salir de lo familiar, planificación excesiva o un objetivo más grande que la capacidad actual. Ajustar la escala devuelve margen de decisión.', '["planificación","horizonte","elección","expansión"]'::jsonb,
  '¿Qué información me falta para convertir una posibilidad en un plan realista?', 'open', 'tarot_wands_two', 101, 'draft', true
),
(
  'wands_three', 'tres-de-bastos', 'Tres de Bastos', 'minor', 3, 'wands', 'three',
  'El Tres de Bastos habla de una iniciativa que ya fue puesta en marcha y ahora requiere perspectiva. Los resultados comienzan a depender también de otros tiempos y personas.', 'Sugiere ampliar contactos, observar señales tempranas y preparar la siguiente etapa. La espera es activa cuando se usa para ajustar y aprender.', 'Puede mostrar retrasos, expectativas poco realistas o falta de coordinación con colaboradores. Revisar acuerdos y contingencias ayuda a recuperar dirección.', '["proyección","colaboración","espera","crecimiento"]'::jsonb,
  '¿Qué puedo preparar mientras una parte del proceso ya no depende solo de mí?', 'favorable', 'tarot_wands_three', 102, 'draft', true
),
(
  'wands_four', 'cuatro-de-bastos', 'Cuatro de Bastos', 'minor', 4, 'wands', 'four',
  'El Cuatro de Bastos reconoce una base compartida y un motivo para reunirse. Celebra la estabilidad construida entre varias personas.', 'Favorece marcar un hito, agradecer apoyos y cuidar el espacio donde algo puede prosperar. La celebración no necesita ser grande para fortalecer el sentido de pertenencia.', 'Puede indicar tensiones en el hogar, una celebración postergada o sensación de no tener un lugar propio. Conviene hablar de expectativas y reconstruir acuerdos básicos.', '["celebración","hogar","estabilidad","comunidad"]'::jsonb,
  '¿Qué avance compartido conviene celebrar para fortalecer nuestros vínculos?', 'favorable', 'tarot_wands_four', 103, 'draft', true
),
(
  'wands_five', 'cinco-de-bastos', 'Cinco de Bastos', 'minor', 5, 'wands', 'five',
  'El Cinco de Bastos muestra diferencias que compiten por espacio. El conflicto puede ser fértil si se acuerdan reglas y un propósito común.', 'Señala debate, comparación o fricción entre estilos. Escuchar la intención detrás de cada postura puede transformar la competencia en aprendizaje.', 'Puede reflejar evitación del conflicto, resentimiento silencioso o desgaste por discusiones repetidas. Hace falta decidir qué diferencia merece conversación y cuál puede soltarse.', '["fricción","competencia","debate","aprendizaje"]'::jsonb,
  '¿Cómo puedo expresar mi diferencia sin convertirla en una lucha por imponerse?', 'caution', 'tarot_wands_five', 104, 'draft', true
),
(
  'wands_six', 'seis-de-bastos', 'Seis de Bastos', 'minor', 6, 'wands', 'six',
  'El Seis de Bastos señala reconocimiento después de un esfuerzo visible. Invita a recibir la valoración sin confundirla con el valor personal.', 'Puede traer apoyo, confianza renovada o un hito que confirma el rumbo. Compartir el mérito y mantener expectativas proporcionadas ayuda a sostener el avance.', 'Advierte sobre depender de la aprobación, sentir que el trabajo pasa inadvertido o exagerar una victoria. La referencia interna necesita recuperar peso.', '["reconocimiento","confianza","mérito","avance"]'::jsonb,
  '¿Qué parte de mi progreso puedo validar aunque nadie la aplauda todavía?', 'favorable', 'tarot_wands_six', 105, 'draft', true
),
(
  'wands_seven', 'siete-de-bastos', 'Siete de Bastos', 'minor', 7, 'wands', 'seven',
  'El Siete de Bastos representa la defensa de una posición ganada con esfuerzo. Mantenerla requiere claridad sobre qué vale la pena proteger.', 'Sugiere sostener límites frente a presión o cuestionamientos, sin responder a cada provocación. Elegir las batallas conserva energía.', 'Puede mostrar agotamiento defensivo, sensación de estar en minoría o límites poco firmes. Pedir apoyo y priorizar reduce la sobrecarga.', '["defensa","convicción","límite","resistencia"]'::jsonb,
  '¿Qué merece realmente mi energía de defensa y qué discusión puedo dejar pasar?', 'caution', 'tarot_wands_seven', 106, 'draft', true
),
(
  'wands_eight', 'ocho-de-bastos', 'Ocho de Bastos', 'minor', 8, 'wands', 'eight',
  'El Ocho de Bastos anuncia movimiento rápido y mensajes que aceleran un proceso. La velocidad puede ser útil si existe dirección.', 'Favorece responder, coordinar y aprovechar una ventana de acción. Mantener la comunicación simple evita que el impulso se disperse.', 'Puede indicar demoras, información cruzada o demasiados asuntos urgentes a la vez. Ordenar canales y secuencias permite recuperar fluidez.', '["velocidad","mensaje","coordinación","movimiento"]'::jsonb,
  '¿Qué comunicación directa permitiría que este proceso avance con menos fricción?', 'favorable', 'tarot_wands_eight', 107, 'draft', true
),
(
  'wands_nine', 'nueve-de-bastos', 'Nueve de Bastos', 'minor', 9, 'wands', 'nine',
  'El Nueve de Bastos muestra resistencia después de varias pruebas. Queda fuerza, aunque el cansancio pide administrar mejor los recursos.', 'Invita a proteger lo logrado, aprender de experiencias previas y terminar sin ignorar las señales de agotamiento. La perseverancia necesita pausas.', 'Puede reflejar hipervigilancia, desgaste acumulado o insistencia en una estrategia que ya no funciona. Revisar defensas ayuda a distinguir cuidado de miedo.', '["perseverancia","cautela","experiencia","reserva"]'::jsonb,
  '¿Qué ajuste me permitiría continuar sin tratar cada dificultad como una amenaza?', 'caution', 'tarot_wands_nine', 108, 'draft', true
),
(
  'wands_ten', 'diez-de-bastos', 'Diez de Bastos', 'minor', 10, 'wands', 'ten',
  'El Diez de Bastos evidencia una carga que se volvió difícil de sostener. La responsabilidad necesita límites para no convertirse en sacrificio permanente.', 'Señala muchas tareas, compromisos acumulados o una meta cercana que exige esfuerzo final. Delegar y renegociar son parte del trabajo, no una falla.', 'Puede indicar colapso por sobrecarga, resistencia a pedir ayuda o el comienzo de soltar obligaciones ajenas. Conviene decidir qué ya no corresponde cargar.', '["carga","responsabilidad","delegación","límite"]'::jsonb,
  '¿Qué responsabilidad puedo compartir, renegociar o dejar de asumir en silencio?', 'caution', 'tarot_wands_ten', 109, 'draft', true
),
(
  'wands_page', 'sota-de-bastos', 'Sota de Bastos', 'minor', 11, 'wands', 'page',
  'La Sota de Bastos encarna curiosidad, noticias estimulantes y disposición a explorar. Aprende haciendo y no teme empezar como principiante.', 'Invita a investigar un interés, comunicar una idea con frescura o aceptar una experiencia formativa. La espontaneidad funciona mejor con una mínima preparación.', 'Puede mostrar entusiasmo inconstante, promesas prematuras o miedo a parecer inexperto. Elegir una sola curiosidad permite darle continuidad.', '["curiosidad","exploración","mensaje","aprendizaje"]'::jsonb,
  '¿Qué puedo permitirme aprender sin exigirme dominarlo desde el primer intento?', 'favorable', 'tarot_wands_page', 110, 'draft', true
),
(
  'wands_knight', 'caballero-de-bastos', 'Caballero de Bastos', 'minor', 12, 'wands', 'knight',
  'El Caballero de Bastos se mueve con pasión, valentía y deseo de experiencia. Su desafío es sostener el rumbo después del impulso inicial.', 'Favorece tomar iniciativa, viajar o defender una propuesta con energía. Revisar consecuencias antes de actuar evita que la confianza se vuelva imprudencia.', 'Puede señalar impulsividad, frustración ante demoras o cambios de dirección frecuentes. Reducir la velocidad permite distinguir deseo genuino de reacción.', '["acción","pasión","aventura","iniciativa"]'::jsonb,
  '¿Cómo puedo honrar mi entusiasmo sin apresurar una decisión importante?', 'favorable', 'tarot_wands_knight', 111, 'draft', true
),
(
  'wands_queen', 'reina-de-bastos', 'Reina de Bastos', 'minor', 13, 'wands', 'queen',
  'La Reina de Bastos expresa una confianza cálida que anima a otras personas sin ocupar todo el espacio. Conoce su capacidad y la usa con generosidad.', 'Sugiere mostrarse, liderar desde la autenticidad y cuidar una visión creativa. La seguridad crece al actuar de acuerdo con los propios valores.', 'Puede reflejar comparación, celos o una imagen segura que esconde agotamiento. Recuperar la conexión con el deseo propio reduce la necesidad de competir.', '["confianza","carisma","creatividad","liderazgo"]'::jsonb,
  '¿En qué espacio puedo aportar confianza sin tener que demostrar superioridad?', 'favorable', 'tarot_wands_queen', 112, 'draft', true
),
(
  'wands_king', 'rey-de-bastos', 'Rey de Bastos', 'minor', 14, 'wands', 'king',
  'El Rey de Bastos representa visión sostenida y capacidad para movilizar a un grupo. Mira más allá de la tarea inmediata sin perder iniciativa.', 'Invita a asumir liderazgo, comunicar un propósito y crear condiciones para que otros actúen. La autoridad resulta más sólida cuando acepta perspectivas distintas.', 'Puede mostrar autoritarismo, expectativas desmedidas o proyectos guiados por ego. Escuchar límites y compartir decisiones devuelve credibilidad.', '["visión","liderazgo","inspiración","dirección"]'::jsonb,
  '¿Cómo puedo sostener una visión ambiciosa incluyendo las necesidades de quienes participan?', 'favorable', 'tarot_wands_king', 113, 'draft', true
),
(
  'cups_ace', 'as-de-copas', 'As de Copas', 'minor', 1, 'cups', 'ace',
  'El As de Copas abre un espacio para sentir, vincularse y recibir afecto. Es una posibilidad emocional que necesita presencia para desarrollarse.', 'Puede señalar un vínculo naciente, inspiración sensible o reconciliación con la propia vida emocional. Conviene acercarse con apertura y límites claros.', 'Puede reflejar emociones contenidas, dificultad para recibir o una entrega que vacía las reservas personales. Atenderse primero permite volver a compartir.', '["apertura","afecto","sensibilidad","renovación"]'::jsonb,
  '¿Qué emoción necesita ser recibida antes de que intente explicarla o cambiarla?', 'favorable', 'tarot_cups_ace', 200, 'draft', true
),
(
  'cups_two', 'dos-de-copas', 'Dos de Copas', 'minor', 2, 'cups', 'two',
  'El Dos de Copas representa encuentro, reciprocidad y voluntad de reconocer al otro. El vínculo se fortalece cuando ambas partes pueden elegir.', 'Favorece acuerdos, conversaciones honestas y relaciones basadas en respeto mutuo. La afinidad no elimina la necesidad de expresar expectativas.', 'Puede señalar desequilibrio, desencuentro o pérdida de confianza. Antes de reparar, conviene comprobar si existe disposición compartida.', '["reciprocidad","encuentro","acuerdo","confianza"]'::jsonb,
  '¿Qué necesito expresar para saber si este vínculo puede sostenerse de manera recíproca?', 'favorable', 'tarot_cups_two', 201, 'draft', true
),
(
  'cups_three', 'tres-de-copas', 'Tres de Copas', 'minor', 3, 'cups', 'three',
  'El Tres de Copas celebra amistad, apoyo y alegría compartida. Recuerda que los procesos personales también se sostienen en comunidad.', 'Invita a reunirse, reconocer una buena noticia o aceptar ayuda cercana. Compartir con medida puede devolver perspectiva y energía.', 'Puede indicar exceso social, rumores o sensación de quedar fuera de un grupo. Revisar afinidades y límites ayuda a elegir compañía nutritiva.', '["amistad","celebración","apoyo","comunidad"]'::jsonb,
  '¿Con quién puedo compartir este momento de una forma auténtica y cuidadosa?', 'favorable', 'tarot_cups_three', 202, 'draft', true
),
(
  'cups_four', 'cuatro-de-copas', 'Cuatro de Copas', 'minor', 4, 'cups', 'four',
  'El Cuatro de Copas muestra desconexión frente a opciones que no despiertan interés. La pausa puede aclarar una necesidad ignorada.', 'Sugiere retirar atención del ruido, reconocer el aburrimiento y observar una posibilidad antes descartada. No toda falta de entusiasmo exige una decisión inmediata.', 'Puede señalar regreso gradual de la motivación o deseo de salir de un aislamiento emocional. También advierte contra aceptar cualquier opción solo por escapar del estancamiento.', '["apatía","pausa","evaluación","receptividad"]'::jsonb,
  '¿Qué necesidad no atendida puede estar detrás de mi falta de interés?', 'caution', 'tarot_cups_four', 203, 'draft', true
),
(
  'cups_five', 'cinco-de-copas', 'Cinco de Copas', 'minor', 5, 'cups', 'five',
  'El Cinco de Copas reconoce una pérdida y la atención que queda fijada en ella. El dolor merece espacio, aunque no sea toda la historia.', 'Invita a lamentar lo que no resultó sin apresurar una lectura positiva. Cuando sea posible, también conviene mirar qué apoyo o vínculo permanece disponible.', 'Puede indicar aceptación gradual, disposición a reparar o dificultad para dejar una decepción atrás. El avance comienza al integrar lo ocurrido sin negarlo.', '["pérdida","duelo","aceptación","apoyo"]'::jsonb,
  '¿Qué puedo reconocer como perdido y qué sigue presente para acompañarme?', 'caution', 'tarot_cups_five', 204, 'draft', true
),
(
  'cups_six', 'seis-de-copas', 'Seis de Copas', 'minor', 6, 'cups', 'six',
  'El Seis de Copas vincula memoria, ternura y experiencias del pasado. Recordar puede nutrir, siempre que no sustituya la vida presente.', 'Puede traer un reencuentro, un gesto generoso o una mirada compasiva hacia la propia historia. Rescatar lo valioso no obliga a repetirlo todo.', 'Señala idealización del pasado, asuntos antiguos que limitan o necesidad de crecer más allá de una identidad conocida. La memoria requiere contexto.', '["memoria","ternura","reencuentro","historia"]'::jsonb,
  '¿Qué recuerdo puedo honrar sin convertirlo en una medida imposible para el presente?', 'open', 'tarot_cups_six', 205, 'draft', true
),
(
  'cups_seven', 'siete-de-copas', 'Siete de Copas', 'minor', 7, 'cups', 'seven',
  'El Siete de Copas presenta muchas posibilidades mezcladas con fantasía. Elegir requiere separar deseo, distracción y viabilidad.', 'Invita a imaginar sin comprometerse todavía y luego establecer criterios concretos. Una opción atractiva merece preguntas antes de convertirse en plan.', 'Puede mostrar que la confusión se reduce y una prioridad emerge, o que el exceso de opciones llevó a evitar toda decisión. Limitar alternativas facilita avanzar.', '["posibilidades","fantasía","criterio","elección"]'::jsonb,
  '¿Qué opción conserva sentido cuando considero también su costo y sus condiciones?', 'open', 'tarot_cups_seven', 206, 'draft', true
),
(
  'cups_eight', 'ocho-de-copas', 'Ocho de Copas', 'minor', 8, 'cups', 'eight',
  'El Ocho de Copas representa alejarse de algo que ya no ofrece profundidad suficiente. La decisión puede ser triste y necesaria al mismo tiempo.', 'Sugiere reconocer una insatisfacción persistente y buscar un camino más coherente. Antes de partir, ayuda cerrar acuerdos y nombrar las razones con respeto.', 'Puede indicar miedo a dejar lo conocido, regreso a una situación pendiente o abandono impulsivo ante una dificultad reparable. Conviene aclarar qué se espera encontrar fuera.', '["partida","búsqueda","desapego","coherencia"]'::jsonb,
  '¿Qué estoy dejando atrás y qué necesidad espero atender al hacerlo?', 'caution', 'tarot_cups_eight', 207, 'draft', true
),
(
  'cups_nine', 'nueve-de-copas', 'Nueve de Copas', 'minor', 9, 'cups', 'nine',
  'El Nueve de Copas invita a reconocer satisfacción y deseos cumplidos en una medida real. Disfrutar no impide seguir creciendo.', 'Favorece agradecer, descansar en lo conseguido y compartir bienestar sin ostentación. También pregunta si el deseo alcanzado responde a una necesidad verdadera.', 'Puede señalar complacencia, exceso o una meta que no produjo la plenitud esperada. Revisar la expectativa permite buscar una satisfacción más honesta.', '["satisfacción","gratitud","deseo","disfrute"]'::jsonb,
  '¿Qué deseo cumplido puedo disfrutar y qué expectativa conviene revisar?', 'favorable', 'tarot_cups_nine', 208, 'draft', true
),
(
  'cups_ten', 'diez-de-copas', 'Diez de Copas', 'minor', 10, 'cups', 'ten',
  'El Diez de Copas representa bienestar compartido y una visión de pertenencia. La armonía se construye con conversaciones y cuidados continuos.', 'Puede señalar vínculos solidarios, acuerdos familiares o un momento de conexión profunda. Valorar lo común incluye respetar diferencias dentro del grupo.', 'Advierte sobre expectativas idealizadas de felicidad, tensiones domésticas o distancia entre imagen y experiencia. Hablar de necesidades reales puede abrir una reparación.', '["pertenencia","armonía","familia","bienestar"]'::jsonb,
  '¿Qué acuerdo concreto ayudaría a que nuestro bienestar compartido sea más auténtico?', 'favorable', 'tarot_cups_ten', 209, 'draft', true
),
(
  'cups_page', 'sota-de-copas', 'Sota de Copas', 'minor', 11, 'cups', 'page',
  'La Sota de Copas trae sensibilidad curiosa, imaginación y un mensaje emocional inesperado. Se acerca a lo que siente sin tener todas las palabras.', 'Invita a expresar afecto, explorar una intuición creativa o escuchar con apertura. La vulnerabilidad puede ofrecer información cuando se acompaña de discernimiento.', 'Puede mostrar inmadurez emocional, susceptibilidad o fantasía usada para evitar la realidad. Poner nombre a la emoción reduce su poder de dirigir en silencio.', '["sensibilidad","mensaje","imaginación","vulnerabilidad"]'::jsonb,
  '¿Qué sentimiento podría expresar con sencillez en vez de esperar que lo adivinen?', 'open', 'tarot_cups_page', 210, 'draft', true
),
(
  'cups_knight', 'caballero-de-copas', 'Caballero de Copas', 'minor', 12, 'cups', 'knight',
  'El Caballero de Copas sigue una invitación del corazón y busca darle una forma bella. Su idealismo necesita comprobar cómo afecta a la realidad.', 'Favorece una propuesta afectiva, una creación inspirada o una conversación guiada por empatía. Cumplir lo ofrecido importa tanto como expresarlo.', 'Puede señalar promesas seductoras sin respaldo, cambios de ánimo o evasión mediante fantasías. Observar los hechos protege de idealizar.', '["idealismo","propuesta","romance","expresión"]'::jsonb,
  '¿Qué acción concreta puede demostrar la sinceridad de lo que siento o propongo?', 'open', 'tarot_cups_knight', 211, 'draft', true
),
(
  'cups_queen', 'reina-de-copas', 'Reina de Copas', 'minor', 13, 'cups', 'queen',
  'La Reina de Copas sostiene una escucha profunda sin perder contacto con su mundo interior. Su empatía incluye el cuidado de sus propios límites.', 'Sugiere atender matices emocionales, ofrecer presencia y confiar en una percepción sensible. Descansar y proteger el espacio personal evita absorber lo ajeno.', 'Puede reflejar desborde, dependencia afectiva o dificultad para distinguir emociones propias y externas. Recuperar distancia permite cuidar sin desaparecer.', '["empatía","intuición","escucha","límite emocional"]'::jsonb,
  '¿Cómo puedo acompañar esta emoción sin hacerme responsable de resolverla por completo?', 'open', 'tarot_cups_queen', 212, 'draft', true
),
(
  'cups_king', 'rey-de-copas', 'Rey de Copas', 'minor', 14, 'cups', 'king',
  'El Rey de Copas integra sensibilidad y estabilidad. Puede sentir intensamente sin delegar en otros la responsabilidad de regular sus respuestas.', 'Invita a conversar con madurez, mediar sin borrar diferencias y ofrecer contención serena. La calma resulta creíble cuando no niega lo que ocurre.', 'Puede mostrar manipulación emocional, distancia afectiva o control que encubre miedo. Reconocer la emoción antes de actuar ayuda a recuperar honestidad.', '["madurez","contención","diplomacia","serenidad"]'::jsonb,
  '¿Qué respuesta emocionalmente honesta también respeta los límites de todas las partes?', 'favorable', 'tarot_cups_king', 213, 'draft', true
),
(
  'swords_ace', 'as-de-espadas', 'As de Espadas', 'minor', 1, 'swords', 'ace',
  'El As de Espadas representa una idea clara que permite cortar confusión. La verdad útil necesita precisión y responsabilidad al comunicarse.', 'Favorece investigar, nombrar un problema y tomar una decisión basada en hechos. Una conversación directa puede abrir un comienzo intelectual.', 'Puede indicar información incompleta, pensamiento nublado o palabras usadas de forma hiriente. Conviene verificar antes de concluir y ajustar el tono.', '["claridad","verdad","decisión","discernimiento"]'::jsonb,
  '¿Qué hecho necesito verificar antes de tratar mi interpretación como una certeza?', 'favorable', 'tarot_swords_ace', 300, 'draft', true
),
(
  'swords_two', 'dos-de-espadas', 'Dos de Espadas', 'minor', 2, 'swords', 'two',
  'El Dos de Espadas muestra una decisión suspendida entre alternativas difíciles. Evitar mirar el conflicto ofrece calma temporal, no resolución.', 'Sugiere reunir datos, reconocer emociones y definir un plazo razonable para elegir. No hace falta certeza total, pero sí aceptar el costo de cada opción.', 'Puede señalar saturación, información contradictoria o una decisión que ya no admite más demora. Simplificar criterios ayuda a salir de la parálisis.', '["indecisión","equilibrio","pausa","criterio"]'::jsonb,
  '¿Qué costo estoy aceptando al mantener esta decisión en suspenso?', 'caution', 'tarot_swords_two', 301, 'draft', true
),
(
  'swords_three', 'tres-de-espadas', 'Tres de Espadas', 'minor', 3, 'swords', 'three',
  'El Tres de Espadas reconoce dolor, separación o una verdad que hiere. Nombrar la experiencia permite comenzar a procesarla sin dramatizarla ni negarla.', 'Invita a dar espacio a la tristeza, buscar compañía segura y evitar decisiones reactivas. Comprender lo ocurrido puede requerir tiempo.', 'Puede indicar reparación gradual, dolor retenido o repetición mental de una herida. Soltar no significa aprobar lo sucedido, sino reducir su dominio presente.', '["dolor","verdad","duelo","reparación"]'::jsonb,
  '¿Qué parte de este dolor necesita ser nombrada sin convertirla en toda mi identidad?', 'caution', 'tarot_swords_three', 302, 'draft', true
),
(
  'swords_four', 'cuatro-de-espadas', 'Cuatro de Espadas', 'minor', 4, 'swords', 'four',
  'El Cuatro de Espadas propone una pausa deliberada después del esfuerzo mental. El descanso crea condiciones para pensar con mayor claridad.', 'Sugiere reducir demandas, posponer una respuesta no urgente y recuperar silencio. Detenerse por un momento puede prevenir decisiones tomadas desde el agotamiento.', 'Puede mostrar inquietud que impide descansar, aislamiento prolongado o regreso antes de estar preparado. Conviene diseñar una pausa posible en lugar de esperar condiciones perfectas.', '["descanso","recuperación","silencio","pausa mental"]'::jsonb,
  '¿Qué demanda puedo suspender temporalmente para recuperar atención y perspectiva?', 'caution', 'tarot_swords_four', 303, 'draft', true
),
(
  'swords_five', 'cinco-de-espadas', 'Cinco de Espadas', 'minor', 5, 'swords', 'five',
  'El Cinco de Espadas pregunta qué queda después de ganar una disputa. Una victoria puede tener un costo relacional mayor que su beneficio.', 'Señala conflicto, estrategia defensiva o palabras difíciles de retirar. Conviene decidir si el objetivo es resolver, protegerse o demostrar superioridad.', 'Puede indicar deseo de reconciliación, resentimiento persistente o retirada de una dinámica dañina. Reparar requiere reconocer el impacto sin exigir olvido.', '["conflicto","costo","estrategia","reconciliación"]'::jsonb,
  '¿Qué resultado busco realmente en esta discusión y qué precio tendría obtenerlo?', 'caution', 'tarot_swords_five', 304, 'draft', true
),
(
  'swords_six', 'seis-de-espadas', 'Seis de Espadas', 'minor', 6, 'swords', 'six',
  'El Seis de Espadas representa una transición hacia condiciones más tranquilas. El movimiento ayuda, aunque parte de la dificultad viaje con nosotros.', 'Sugiere tomar distancia, aceptar apoyo y avanzar paso a paso desde una situación compleja. No exige sentirse bien para comenzar el traslado.', 'Puede reflejar retorno a un problema, resistencia a cambiar de entorno o asuntos pendientes que dificultan partir. Aclarar el cierre facilita el tránsito.', '["transición","distancia","apoyo","avance gradual"]'::jsonb,
  '¿Qué necesito llevar conmigo y qué puedo dejar para hacer esta transición más ligera?', 'open', 'tarot_swords_six', 305, 'draft', true
),
(
  'swords_seven', 'siete-de-espadas', 'Siete de Espadas', 'minor', 7, 'swords', 'seven',
  'El Siete de Espadas habla de estrategia, discreción y decisiones tomadas fuera de la vista de otros. Pregunta si la reserva protege o evita rendir cuentas.', 'Puede aconsejar cuidar información, actuar con ingenio o revisar una situación donde no todo se dice. La eficacia no justifica faltar a acuerdos importantes.', 'Puede señalar una verdad que emerge, culpa por una acción oculta o abandono de una estrategia poco sostenible. Ser transparente reduce riesgos futuros.', '["estrategia","discreción","integridad","cautela"]'::jsonb,
  '¿Mi silencio protege un límite legítimo o evita una conversación que debo afrontar?', 'caution', 'tarot_swords_seven', 306, 'draft', true
),
(
  'swords_eight', 'ocho-de-espadas', 'Ocho de Espadas', 'minor', 8, 'swords', 'eight',
  'El Ocho de Espadas muestra una sensación de encierro reforzada por pensamientos repetidos. Las opciones son limitadas, pero quizá no inexistentes.', 'Invita a identificar supuestos, pedir una perspectiva externa y reconocer el margen de acción disponible. Un paso pequeño puede contradecir la idea de impotencia total.', 'Puede indicar liberación de una creencia restrictiva o temor a usar una libertad recién reconocida. Practicar decisiones de bajo riesgo ayuda a recuperar confianza.', '["restricción","perspectiva","agencia","creencia"]'::jsonb,
  '¿Qué opción pequeña he descartado porque no resuelve el problema por completo?', 'caution', 'tarot_swords_eight', 307, 'draft', true
),
(
  'swords_nine', 'nueve-de-espadas', 'Nueve de Espadas', 'minor', 9, 'swords', 'nine',
  'El Nueve de Espadas refleja preocupación intensa, culpa o pensamientos que crecen en la soledad de la noche. La angustia necesita apoyo, no juicio.', 'Sugiere distinguir entre un problema concreto y las escenas que anticipa la mente. Hablar con alguien de confianza y volver a los hechos puede reducir el aislamiento.', 'Puede mostrar alivio gradual o una ansiedad que se oculta por vergüenza. Reconocer cuánto está afectando la vida cotidiana es un primer paso responsable.', '["preocupación","culpa","insomnio","apoyo"]'::jsonb,
  '¿Qué preocupación puedo compartir para no seguir sosteniéndola únicamente en mi mente?', 'caution', 'tarot_swords_nine', 308, 'draft', true
),
(
  'swords_ten', 'diez-de-espadas', 'Diez de Espadas', 'minor', 10, 'swords', 'ten',
  'El Diez de Espadas marca el límite de una situación agotada. El final puede sentirse duro, pero impide seguir negando que algo terminó.', 'Invita a aceptar una conclusión, dejar de invertir en lo irrecuperable y atender las consecuencias inmediatas. La recuperación comienza sin necesidad de fingir optimismo.', 'Puede indicar que se evita cerrar, que el dolor empieza a ceder o que se teme repetir una experiencia difícil. Aprender del límite protege el siguiente comienzo.', '["final","agotamiento","aceptación","recuperación"]'::jsonb,
  '¿Qué realidad se vuelve más manejable cuando dejo de discutir con su final?', 'caution', 'tarot_swords_ten', 309, 'draft', true
),
(
  'swords_page', 'sota-de-espadas', 'Sota de Espadas', 'minor', 11, 'swords', 'page',
  'La Sota de Espadas observa, pregunta y busca entender con rapidez. Su curiosidad es valiosa cuando no invade ni concluye antes de tiempo.', 'Favorece investigar, aprender una herramienta y formular preguntas precisas. Comunicar lo descubierto requiere contexto y prudencia.', 'Puede mostrar rumores, vigilancia excesiva o argumentos usados sin suficiente experiencia. Hacer una pausa antes de compartir evita amplificar errores.', '["curiosidad","investigación","pregunta","vigilancia"]'::jsonb,
  '¿Qué pregunta honesta aportaría más claridad que una conclusión apresurada?', 'open', 'tarot_swords_page', 310, 'draft', true
),
(
  'swords_knight', 'caballero-de-espadas', 'Caballero de Espadas', 'minor', 12, 'swords', 'knight',
  'El Caballero de Espadas avanza con una convicción que quiere convertirse en acción inmediata. La claridad de propósito necesita considerar el impacto.', 'Invita a defender una idea, resolver un asunto urgente o hablar sin rodeos. Preparar argumentos y escuchar objeciones mejora la intervención.', 'Puede indicar agresividad verbal, decisiones precipitadas o energía mental sin dirección. Bajar la velocidad permite evitar daños innecesarios.', '["convicción","rapidez","argumento","acción"]'::jsonb,
  '¿Qué consecuencia podría ignorar si actúo solo desde la urgencia de tener razón?', 'caution', 'tarot_swords_knight', 311, 'draft', true
),
(
  'swords_queen', 'reina-de-espadas', 'Reina de Espadas', 'minor', 13, 'swords', 'queen',
  'La Reina de Espadas combina lucidez y experiencia para ver una situación sin adornos. Su franqueza busca claridad, no crueldad.', 'Sugiere establecer límites, hacer preguntas difíciles y decidir con independencia. La verdad se recibe mejor cuando incluye respeto por la sensibilidad ajena.', 'Puede reflejar dureza nacida del dolor, juicio excesivo o aislamiento intelectual. Reconocer la herida evita usar la precisión como defensa.', '["lucidez","independencia","franqueza","límite"]'::jsonb,
  '¿Cómo puedo decir lo necesario con precisión sin perder humanidad?', 'open', 'tarot_swords_queen', 312, 'draft', true
),
(
  'swords_king', 'rey-de-espadas', 'Rey de Espadas', 'minor', 14, 'swords', 'king',
  'El Rey de Espadas representa criterio, autoridad intelectual y decisiones basadas en principios. Su poder depende de aplicar la misma medida con coherencia.', 'Favorece analizar evidencia, definir estándares y comunicar una resolución razonada. Consultar experiencia relevante fortalece la decisión.', 'Puede señalar abuso de autoridad, racionalización o reglas aplicadas sin considerar contexto. Revisar quién asume el costo revela posibles sesgos.', '["criterio","autoridad","principio","análisis"]'::jsonb,
  '¿Mi decisión aplica un criterio coherente o acomoda la regla a mi conveniencia?', 'open', 'tarot_swords_king', 313, 'draft', true
),
(
  'pentacles_ace', 'as-de-oros', 'As de Oros', 'minor', 1, 'pentacles', 'ace',
  'El As de Oros presenta una oportunidad práctica que puede crecer con tiempo y cuidado. La posibilidad necesita trabajo concreto para volverse estable.', 'Puede señalar un recurso, una habilidad o un comienzo material prometedor. Conviene evaluar condiciones y dar un primer paso medible.', 'Puede indicar una oportunidad desaprovechada, bases débiles o exceso de atención al beneficio inmediato. Revisar viabilidad evita comprometer más de lo disponible.', '["oportunidad","recurso","base","crecimiento"]'::jsonb,
  '¿Qué acción concreta permitiría comprobar el valor real de esta oportunidad?', 'favorable', 'tarot_pentacles_ace', 400, 'draft', true
),
(
  'pentacles_two', 'dos-de-oros', 'Dos de Oros', 'minor', 2, 'pentacles', 'two',
  'El Dos de Oros representa la coordinación de varias demandas en movimiento. El equilibrio cambia y requiere ajustes frecuentes.', 'Invita a priorizar, organizar tiempos y mantener flexibilidad ante variaciones. Saber qué puede esperar evita que todo parezca igual de urgente.', 'Puede mostrar desorden, compromisos incompatibles o cansancio por sostener demasiadas tareas. Reducir frentes es una decisión responsable.', '["prioridad","adaptación","organización","ritmo"]'::jsonb,
  '¿Qué tarea puede esperar para que lo verdaderamente importante reciba atención suficiente?', 'open', 'tarot_pentacles_two', 401, 'draft', true
),
(
  'pentacles_three', 'tres-de-oros', 'Tres de Oros', 'minor', 3, 'pentacles', 'three',
  'El Tres de Oros habla de oficio, colaboración y aprendizaje visible en una obra compartida. La calidad mejora cuando las capacidades se coordinan.', 'Favorece pedir retroalimentación, definir roles y construir con método. Reconocer la experiencia de cada persona fortalece el resultado.', 'Puede indicar falta de coordinación, trabajo poco valorado o estándares confusos. Acordar responsabilidades y criterios evita repetir esfuerzos.', '["oficio","colaboración","calidad","aprendizaje"]'::jsonb,
  '¿Qué conversación sobre roles o estándares mejoraría este trabajo compartido?', 'favorable', 'tarot_pentacles_three', 402, 'draft', true
),
(
  'pentacles_four', 'cuatro-de-oros', 'Cuatro de Oros', 'minor', 4, 'pentacles', 'four',
  'El Cuatro de Oros protege recursos y busca seguridad. Su cautela es útil hasta que conservar impide circular, compartir o cambiar.', 'Sugiere cuidar límites, revisar gastos de energía y consolidar una base. También pregunta si el miedo a perder está estrechando demasiado las opciones.', 'Puede señalar apertura gradual, pérdida de control o gasto sin medida. Soltar con criterio es distinto de abandonar toda protección.', '["seguridad","control","reserva","apego"]'::jsonb,
  '¿Qué estoy protegiendo con sensatez y qué retengo principalmente por miedo?', 'caution', 'tarot_pentacles_four', 403, 'draft', true
),
(
  'pentacles_five', 'cinco-de-oros', 'Cinco de Oros', 'minor', 5, 'pentacles', 'five',
  'El Cinco de Oros representa una etapa de carencia, exclusión o inseguridad práctica. La dificultad puede ocultar apoyos que cuesta reconocer o pedir.', 'Invita a nombrar necesidades, buscar recursos disponibles y evitar enfrentar todo en aislamiento. Recibir ayuda no disminuye la dignidad.', 'Puede indicar mejora paulatina, acceso a apoyo o temor persistente incluso cuando las condiciones cambian. Reconstruir seguridad toma tiempo.', '["carencia","apoyo","vulnerabilidad","recuperación"]'::jsonb,
  '¿Qué ayuda concreta está disponible y qué me dificulta solicitarla?', 'caution', 'tarot_pentacles_five', 404, 'draft', true
),
(
  'pentacles_six', 'seis-de-oros', 'Seis de Oros', 'minor', 6, 'pentacles', 'six',
  'El Seis de Oros examina el intercambio entre dar y recibir. La generosidad responsable considera poder, necesidad y autonomía.', 'Puede señalar apoyo oportuno, reparto de recursos o disposición a compartir experiencia. Aclarar condiciones evita dependencias y malentendidos.', 'Advierte sobre ayuda condicionada, deuda emocional o distribución desigual. Conviene revisar si el intercambio respeta a todas las partes.', '["generosidad","reciprocidad","recurso","equidad"]'::jsonb,
  '¿Este intercambio fortalece la autonomía o crea una obligación difícil de nombrar?', 'open', 'tarot_pentacles_six', 405, 'draft', true
),
(
  'pentacles_seven', 'siete-de-oros', 'Siete de Oros', 'minor', 7, 'pentacles', 'seven',
  'El Siete de Oros evalúa un trabajo que aún está madurando. La paciencia necesita información para no convertirse en espera indefinida.', 'Invita a medir avances, ajustar métodos y decidir si la inversión sigue teniendo sentido. Los resultados parciales también enseñan.', 'Puede mostrar impaciencia, esfuerzo mal dirigido o insistencia por no querer perder lo ya invertido. Cambiar de estrategia puede proteger recursos futuros.', '["evaluación","paciencia","inversión","progreso"]'::jsonb,
  '¿Qué evidencia indica que debo perseverar, ajustar o dejar de invertir aquí?', 'open', 'tarot_pentacles_seven', 406, 'draft', true
),
(
  'pentacles_eight', 'ocho-de-oros', 'Ocho de Oros', 'minor', 8, 'pentacles', 'eight',
  'El Ocho de Oros representa práctica deliberada y atención al detalle. La maestría se construye mediante repetición consciente, no prisa.', 'Favorece estudiar, mejorar un proceso y aceptar correcciones específicas. Un ritmo constante permite que la habilidad se vuelva confiable.', 'Puede indicar perfeccionismo, trabajo mecánico o falta de compromiso con el aprendizaje. Revisar el propósito devuelve sentido a la práctica.', '["práctica","oficio","disciplina","mejora"]'::jsonb,
  '¿Qué aspecto concreto de mi práctica merece atención paciente en vez de perfección inmediata?', 'favorable', 'tarot_pentacles_eight', 407, 'draft', true
),
(
  'pentacles_nine', 'nueve-de-oros', 'Nueve de Oros', 'minor', 9, 'pentacles', 'nine',
  'El Nueve de Oros reconoce autonomía, disfrute y resultados cultivados con constancia. Valora la capacidad de sostenerse sin cerrar la puerta al vínculo.', 'Invita a apreciar lo construido, cuidar el entorno y usar los recursos con criterio. La independencia puede convivir con pedir compañía.', 'Puede reflejar dependencia oculta, aislamiento detrás del éxito o gasto orientado a sostener una imagen. Revisar qué aporta bienestar real devuelve equilibrio.', '["autonomía","disfrute","constancia","bienestar"]'::jsonb,
  '¿Qué parte de lo que he construido me da libertad real y no solo apariencia de logro?', 'favorable', 'tarot_pentacles_nine', 408, 'draft', true
),
(
  'pentacles_ten', 'diez-de-oros', 'Diez de Oros', 'minor', 10, 'pentacles', 'ten',
  'El Diez de Oros habla de continuidad, legado y estructuras que atraviesan generaciones. Lo estable también necesita actualizar sus acuerdos.', 'Puede señalar apoyo familiar, patrimonio compartido o una obra pensada a largo plazo. Conversar sobre valores ayuda a cuidar lo recibido.', 'Puede mostrar conflicto por recursos, expectativas heredadas o una estructura familiar que limita. Diferenciar pertenencia de obligación permite renegociar.', '["legado","continuidad","familia","estructura"]'::jsonb,
  '¿Qué valor quiero transmitir y qué expectativa heredada prefiero transformar?', 'favorable', 'tarot_pentacles_ten', 409, 'draft', true
),
(
  'pentacles_page', 'sota-de-oros', 'Sota de Oros', 'minor', 11, 'pentacles', 'page',
  'La Sota de Oros se acerca a una habilidad o recurso con paciencia de aprendiz. Su interés busca una aplicación concreta.', 'Favorece estudiar, iniciar una formación o diseñar un plan sencillo para una meta práctica. La constancia importa más que avanzar rápido.', 'Puede indicar distracción, postergación o expectativas de resultado sin práctica suficiente. Reducir el objetivo facilita comenzar de verdad.', '["aprendizaje","estudio","plan","constancia"]'::jsonb,
  '¿Qué rutina pequeña convertiría mi interés en una habilidad observable?', 'favorable', 'tarot_pentacles_page', 410, 'draft', true
),
(
  'pentacles_knight', 'caballero-de-oros', 'Caballero de Oros', 'minor', 12, 'pentacles', 'knight',
  'El Caballero de Oros avanza con método, paciencia y atención a lo acordado. Su confiabilidad nace de repetir lo esencial.', 'Invita a cumplir compromisos, seguir un proceso y construir sin saltarse etapas. La lentitud puede ser una ventaja cuando reduce errores.', 'Puede señalar estancamiento, rutina rígida o trabajo sostenido sin revisar el propósito. Introducir una mejora pequeña devuelve movimiento.', '["método","constancia","responsabilidad","paciencia"]'::jsonb,
  '¿Qué parte de mi rutina sostiene el objetivo y cuál continúa solo por costumbre?', 'favorable', 'tarot_pentacles_knight', 411, 'draft', true
),
(
  'pentacles_queen', 'reina-de-oros', 'Reina de Oros', 'minor', 13, 'pentacles', 'queen',
  'La Reina de Oros crea bienestar mediante cuidados concretos y administración atenta. Sabe que sostener a otros requiere conservar recursos propios.', 'Sugiere ordenar lo cotidiano, ofrecer apoyo práctico y disfrutar de lo sencillo. Poner límites al cuidado evita que la disponibilidad se vuelva agotamiento.', 'Puede reflejar descuido personal, preocupación excesiva por la seguridad o carga doméstica desigual. Repartir tareas permite recuperar presencia.', '["cuidado práctico","recursos","bienestar","sostén"]'::jsonb,
  '¿Qué cuidado cotidiano necesito ofrecerme antes de seguir atendiendo a los demás?', 'favorable', 'tarot_pentacles_queen', 412, 'draft', true
),
(
  'pentacles_king', 'rey-de-oros', 'Rey de Oros', 'minor', 14, 'pentacles', 'king',
  'El Rey de Oros representa administración madura, estabilidad y responsabilidad sobre recursos compartidos. El logro adquiere sentido cuando es sostenible.', 'Favorece planificar a largo plazo, proteger una base y tomar decisiones prácticas con experiencia. La seguridad se fortalece al actuar con transparencia.', 'Puede mostrar materialismo, control mediante recursos o resistencia a cambiar una fórmula exitosa en el pasado. Revisar prioridades evita que la estabilidad se vuelva rigidez.', '["estabilidad","administración","experiencia","sostenibilidad"]'::jsonb,
  '¿Cómo puedo usar mis recursos para crear estabilidad sin convertirlos en una forma de control?', 'favorable', 'tarot_pentacles_king', 413, 'draft', true
)
ON CONFLICT (slug) DO UPDATE SET
  card_key = EXCLUDED.card_key,
  name = EXCLUDED.name,
  arcana = EXCLUDED.arcana,
  "number" = EXCLUDED."number",
  suit = EXCLUDED.suit,
  rank = EXCLUDED.rank,
  image_key = EXCLUDED.image_key,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status,
  is_demo = tarot_cards.is_demo,
  updated_at = now(),
  summary = EXCLUDED.summary,
  upright_meaning = EXCLUDED.upright_meaning,
  reversed_meaning = EXCLUDED.reversed_meaning,
  keywords = EXCLUDED.keywords,
  reflection_question = EXCLUDED.reflection_question,
  yes_no_tendency = EXCLUDED.yes_no_tendency
WHERE tarot_cards.is_demo = true;
