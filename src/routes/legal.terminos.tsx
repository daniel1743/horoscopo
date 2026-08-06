import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/legal/terminos")({
  head: () => {
    const m = buildMeta({
      title: "Términos y Condiciones — Creovision",
      description: "Términos y condiciones de uso del sitio web Creovision.",
      noindex: true,
    });
    return { meta: m.meta, links: m.links };
  },
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell>
      <article className="prose prose-cosmic mx-auto max-w-[720px] py-12">
        <PageHeader
          title="Términos y Condiciones"
          description="Última actualización: 5 de agosto de 2026"
        />

        <div className="mt-8 space-y-6 font-body text-[15px] leading-[1.7] text-ink">
          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">1. Aceptación</h2>
            <p>
              Al acceder y utilizar el sitio web{" "}
              <a href="https://www.creovision.io" className="text-cosmic underline">
                www.creovision.io
              </a>{" "}
              (el <strong>"Sitio"</strong>), aceptas estar sujeto a estos Términos y Condiciones
              (los <strong>"Términos"</strong>), así como a nuestra{" "}
              <a href="/legal/privacidad" className="text-cosmic underline">
                Política de Privacidad
              </a>{" "}
              y{" "}
              <a href="/legal/cookies" className="text-cosmic underline">
                Política de Cookies
              </a>
              .
            </p>
            <p>
              Si no estás de acuerdo con estos Términos, por favor no utilices el Sitio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              2. Descripción del servicio
            </h2>
            <p>
              Creovision es una plataforma digital que ofrece contenido relacionado con astrología,
              tarot y fases lunares, incluyendo:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Horóscopos diarios, semanales y mensuales</li>
              <li>Lecturas de tarot interactivas con interpretación asistida por IA</li>
              <li>Información sobre fases lunares y calendario lunar</li>
              <li>Herramientas astrológicas (carta natal, ascendente, compatibilidad)</li>
              <li>Contenido editorial y guías</li>
            </ul>
            <p>
              Los servicios son de carácter informativo, reflexivo y de entretenimiento. No
              constituyen asesoramiento profesional.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              3. Naturaleza del contenido
            </h2>
            <div className="rounded-lg border-2 border-warning/30 bg-warning/5 p-4">
              <p className="font-semibold text-warning">
                ⚠️ Advertencia importante
              </p>
              <p className="mt-2">
                El contenido de Creovision (horóscopos, tarot, astrología) es <strong>simbólico,
                reflexivo y de entretenimiento</strong>. No debe interpretarse como:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Asesoramiento médico, legal, financiero o profesional</li>
                <li>Predicciones garantizadas o hechos verificables</li>
                <li>Sustituto de atención profesional calificada</li>
              </ul>
            </div>
            <p className="mt-4">
              Si enfrentas problemas de salud mental, médicos, legales o financieros, consulta a un
              profesional calificado.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">4. Uso del sitio</h2>
            <h3 className="font-display text-[18px] font-semibold text-ink">4.1. Uso permitido</h3>
            <p>Puedes usar el Sitio para:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Consultar horóscopos y contenido astrológico</li>
              <li>Realizar lecturas de tarot interactivas</li>
              <li>Crear una cuenta para guardar tu perfil astral y lecturas</li>
              <li>Compartir contenido del Sitio en redes sociales (con atribución)</li>
            </ul>

            <h3 className="font-display text-[18px] font-semibold text-ink">4.2. Uso prohibido</h3>
            <p>
              <strong>No está permitido:</strong>
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Copiar, reproducir o redistribuir el contenido sin autorización</li>
              <li>Usar el Sitio para fines comerciales sin permiso expreso</li>
              <li>Hacer scraping, minería de datos o uso automatizado del Sitio</li>
              <li>Intentar acceder a áreas restringidas o hackear el Sitio</li>
              <li>Publicar contenido ofensivo, ilegal o que viole derechos de terceros</li>
              <li>Crear múltiples cuentas falsas o abusar del servicio</li>
              <li>
                Revertir ingeniería, descompilar o intentar extraer código fuente
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">5. Cuentas de usuario</h2>
            <h3 className="font-display text-[18px] font-semibold text-ink">5.1. Registro</h3>
            <p>Para usar algunas funciones, puedes crear una cuenta proporcionando:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Email válido</li>
              <li>Contraseña segura</li>
              <li>Información de perfil (opcional)</li>
            </ul>

            <h3 className="font-display text-[18px] font-semibold text-ink">
              5.2. Responsabilidad
            </h3>
            <p>Eres responsable de:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Mantener la confidencialidad de tu contraseña</li>
              <li>Toda actividad que ocurra bajo tu cuenta</li>
              <li>Notificarnos inmediatamente si sospechas acceso no autorizado</li>
            </ul>

            <h3 className="font-display text-[18px] font-semibold text-ink">
              5.3. Suspensión o eliminación
            </h3>
            <p>
              Nos reservamos el derecho de suspender o eliminar cuentas que violen estos Términos,
              sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              6. Propiedad intelectual
            </h2>
            <p>
              Todo el contenido del Sitio (textos, imágenes, diseño, código, logos) está protegido
              por derechos de autor y es propiedad de Creovision o sus licenciantes.
            </p>
            <p>
              <strong>Licencia de uso:</strong> Te otorgamos una licencia limitada, no exclusiva,
              no transferible y revocable para acceder y usar el Sitio para fines personales y no
              comerciales.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              7. Contenido generado por IA
            </h2>
            <p>
              Algunas interpretaciones de tarot son generadas o asistidas por inteligencia
              artificial (IA). Este contenido:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Es revisado editorialmente antes de mostrarse</li>
              <li>Puede contener imprecisiones o limitaciones</li>
              <li>No debe considerarse asesoramiento profesional</li>
              <li>Se proporciona "tal cual", sin garantías</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              8. Limitación de responsabilidad
            </h2>
            <p>
              <strong>Creovision no será responsable por:</strong>
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Decisiones tomadas basándose en el contenido del Sitio
              </li>
              <li>
                Daños directos, indirectos, incidentales o consecuenciales derivados del uso del
                Sitio
              </li>
              <li>
                Pérdida de datos, beneficios, oportunidades o daño moral
              </li>
              <li>
                Interrupciones del servicio, errores técnicos o contenido inexacto
              </li>
              <li>
                Conducta de terceros o contenido de enlaces externos
              </li>
            </ul>
            <p>
              <strong>El Sitio se proporciona "tal cual" y "según disponibilidad"</strong>, sin
              garantías de ningún tipo, expresas o implícitas.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">9. Indemnización</h2>
            <p>
              Aceptas indemnizar y eximir de responsabilidad a Creovision, sus empleados y
              colaboradores de cualquier reclamación, pérdida o daño que surja de:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Tu uso del Sitio</li>
              <li>Violación de estos Términos</li>
              <li>Violación de derechos de terceros</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">10. Enlaces externos</h2>
            <p>
              El Sitio puede contener enlaces a sitios web de terceros. No controlamos ni somos
              responsables del contenido, políticas de privacidad o prácticas de estos sitios.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              11. Modificaciones del servicio
            </h2>
            <p>
              Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del
              Sitio en cualquier momento, con o sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              12. Cambios en los términos
            </h2>
            <p>
              Podemos actualizar estos Términos ocasionalmente. Los cambios significativos se
              notificarán en el Sitio. El uso continuado después de los cambios constituye tu
              aceptación de los nuevos Términos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              13. Ley aplicable y jurisdicción
            </h2>
            <p>
              Estos Términos se rigen por las leyes de España. Cualquier disputa será resuelta en
              los tribunales de [Ciudad], España.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">14. Divisibilidad</h2>
            <p>
              Si alguna disposición de estos Términos se considera inválida o inaplicable, el resto
              de los Términos seguirá en vigor.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">15. Contacto</h2>
            <p>
              Para preguntas, comentarios o reclamaciones sobre estos Términos:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:hola@creovision.io" className="text-cosmic underline">
                hola@creovision.io
              </a>
              <br />
              <strong>Sitio web:</strong>{" "}
              <a href="https://www.creovision.io" className="text-cosmic underline">
                www.creovision.io
              </a>
            </p>
          </section>

          <div className="mt-12 rounded-lg border border-cosmic/20 bg-cosmic/5 p-6">
            <p className="font-body text-[13px] text-ink-soft">
              <strong>Última actualización:</strong> 5 de agosto de 2026
              <br />
              <strong>Versión:</strong> 1.0
            </p>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
