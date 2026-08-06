import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { buildMeta } from "@/config/seo";
import { cookieDefinitions } from "@/lib/cookies/cookie-manager";

export const Route = createFileRoute("/legal/cookies")({
  head: () => {
    const m = buildMeta({
      title: "Política de Cookies — Creovision",
      description: "Información sobre las cookies que utilizamos y cómo gestionarlas.",
      noindex: true,
    });
    return { meta: m.meta, links: m.links };
  },
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  const categorizeBy = (category: string) =>
    cookieDefinitions.filter((c) => c.category === category);

  return (
    <PageShell>
      <article className="prose prose-cosmic mx-auto max-w-[720px] py-12">
        <PageHeader
          title="Política de Cookies"
          description="Última actualización: 5 de agosto de 2026"
        />

        <div className="mt-8 space-y-6 font-body text-[15px] leading-[1.7] text-ink">
          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              1. ¿Qué son las cookies?
            </h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
              visitas un sitio web. Se utilizan para que el sitio funcione correctamente, mejorar
              tu experiencia y proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              2. ¿Qué cookies utilizamos?
            </h2>
            <p>
              Utilizamos diferentes tipos de cookies según su finalidad. Puedes aceptar o rechazar
              las cookies opcionales en cualquier momento.
            </p>

            <h3 className="font-display text-[20px] font-semibold text-ink">
              2.1. Cookies necesarias (obligatorias)
            </h3>
            <p>
              Estas cookies son esenciales para que el sitio funcione. No se pueden desactivar.
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-line-subtle bg-muted">
                    <th className="p-3 text-left font-semibold">Nombre</th>
                    <th className="p-3 text-left font-semibold">Propósito</th>
                    <th className="p-3 text-left font-semibold">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {categorizeBy("necessary").map((cookie) => (
                    <tr key={cookie.name} className="border-b border-canvas-muted">
                      <td className="p-3 font-mono text-[13px]">{cookie.name}</td>
                      <td className="p-3">{cookie.description}</td>
                      <td className="p-3">{cookie.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-display text-[20px] font-semibold text-ink">
              2.2. Cookies de analítica (opcionales)
            </h3>
            <p>
              Nos ayudan a entender cómo usas el sitio para mejorarlo. Solo se activan si aceptas.
            </p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-line-subtle bg-muted">
                    <th className="p-3 text-left font-semibold">Nombre</th>
                    <th className="p-3 text-left font-semibold">Propósito</th>
                    <th className="p-3 text-left font-semibold">Proveedor</th>
                    <th className="p-3 text-left font-semibold">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {categorizeBy("analytics").map((cookie) => (
                    <tr key={cookie.name} className="border-b border-canvas-muted">
                      <td className="p-3 font-mono text-[13px]">{cookie.name}</td>
                      <td className="p-3">{cookie.description}</td>
                      <td className="p-3">{cookie.provider}</td>
                      <td className="p-3">{cookie.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-display text-[20px] font-semibold text-ink">
              2.3. Cookies de marketing (opcionales)
            </h3>
            <p>
              Actualmente no utilizamos cookies de marketing. Esta sección se actualizará si en el
              futuro implementamos publicidad personalizada.
            </p>

            <h3 className="font-display text-[20px] font-semibold text-ink">
              2.4. Cookies de preferencias (opcionales)
            </h3>
            <p>Guardan tus elecciones para mejorar tu experiencia personalizada.</p>
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-line-subtle bg-muted">
                    <th className="p-3 text-left font-semibold">Nombre</th>
                    <th className="p-3 text-left font-semibold">Propósito</th>
                    <th className="p-3 text-left font-semibold">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {categorizeBy("preferences").map((cookie) => (
                    <tr key={cookie.name} className="border-b border-canvas-muted">
                      <td className="p-3 font-mono text-[13px]">{cookie.name}</td>
                      <td className="p-3">{cookie.description}</td>
                      <td className="p-3">{cookie.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              3. ¿Cómo gestionar las cookies?
            </h2>
            <p>Tienes varias opciones para controlar las cookies:</p>

            <h3 className="font-display text-[18px] font-semibold text-ink">
              3.1. Banner de consentimiento
            </h3>
            <p>
              Al visitar el sitio por primera vez, verás un banner donde puedes:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Aceptar todas:</strong> Activa todas las cookies
              </li>
              <li>
                <strong>Solo necesarias:</strong> Solo cookies esenciales
              </li>
              <li>
                <strong>Personalizar:</strong> Elige qué categorías aceptar
              </li>
            </ul>

            <h3 className="font-display text-[18px] font-semibold text-ink">
              3.2. Configuración del navegador
            </h3>
            <p>
              Puedes bloquear o eliminar cookies desde la configuración de tu navegador:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies
              </li>
              <li>
                <strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies
              </li>
              <li>
                <strong>Safari:</strong> Preferencias → Privacidad → Cookies
              </li>
              <li>
                <strong>Edge:</strong> Configuración → Privacidad → Cookies
              </li>
            </ul>
            <p className="text-[14px] text-ink-soft">
              <strong>Nota:</strong> Bloquear todas las cookies puede afectar la funcionalidad del
              sitio.
            </p>

            <h3 className="font-display text-[18px] font-semibold text-ink">
              3.3. Herramientas de terceros
            </h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Google Analytics:</strong> Opt-out disponible en{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cosmic underline"
                >
                  tools.google.com/dlpage/gaoptout
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              4. Cookies de terceros
            </h2>
            <p>Algunos de nuestros proveedores pueden establecer sus propias cookies:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Google Analytics:</strong> Para análisis de uso (solo si aceptas cookies de
                analítica)
              </li>
              <li>
                <strong>Vercel:</strong> Para hosting y funcionalidad del sitio (necesarias)
              </li>
            </ul>
            <p>
              Estos terceros tienen sus propias políticas de privacidad y cookies. Te recomendamos
              revisarlas.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              5. Duración de las cookies
            </h2>
            <p>Las cookies pueden ser:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>De sesión:</strong> Se eliminan al cerrar el navegador
              </li>
              <li>
                <strong>Persistentes:</strong> Permanecen durante un tiempo definido (ver tabla
                arriba)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              6. Actualizaciones de esta política
            </h2>
            <p>
              Podemos actualizar esta política ocasionalmente para reflejar cambios en nuestro uso
              de cookies. Te notificaremos cambios significativos mediante un aviso en el sitio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">7. Más información</h2>
            <p>Para más detalles sobre cómo tratamos tus datos personales, consulta nuestra:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <a href="/legal/privacidad" className="text-cosmic underline">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="/legal/terminos" className="text-cosmic underline">
                  Términos y Condiciones
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">8. Contacto</h2>
            <p>
              Si tienes preguntas sobre nuestra Política de Cookies:
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:hola@creovision.io" className="text-cosmic underline">
                hola@creovision.io
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
