import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { buildMeta } from "@/config/seo";

export const Route = createFileRoute("/legal/privacidad")({
  head: () => {
    const m = buildMeta({
      title: "Política de Privacidad — Creovision",
      description: "Política de privacidad y protección de datos de Creovision, conforme con GDPR/RGPD.",
      noindex: true,
    });
    return { meta: m.meta, links: m.links };
  },
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <PageShell>
      <article className="prose prose-cosmic mx-auto max-w-[720px] py-12">
        <PageHeader
          title="Política de Privacidad"
          description="Última actualización: 5 de agosto de 2026"
        />

        <div className="mt-8 space-y-6 font-body text-[15px] leading-[1.7] text-ink">
          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">1. Introducción</h2>
            <p>
              En Creovision (<strong>nosotros</strong>, <strong>nuestro</strong>) respetamos tu
              privacidad y nos comprometemos a proteger tus datos personales. Esta Política de
              Privacidad explica cómo recopilamos, usamos, compartimos y protegemos tu información
              cuando utilizas nuestro sitio web{" "}
              <a href="https://www.creovision.io" className="text-cosmic underline">
                www.creovision.io
              </a>{" "}
              (el <strong>Sitio</strong>).
            </p>
            <p>
              Esta política cumple con el Reglamento General de Protección de Datos (RGPD/GDPR) de
              la Unión Europea y la legislación española aplicable.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              2. Responsable del tratamiento
            </h2>
            <p>
              <strong>Responsable:</strong> Creovision
              <br />
              <strong>Contacto:</strong> hola@creovision.io
              <br />
              <strong>Sitio web:</strong>{" "}
              <a href="https://www.creovision.io" className="text-cosmic underline">
                www.creovision.io
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              3. Datos que recopilamos
            </h2>
            <p>Recopilamos los siguientes tipos de información:</p>

            <h3 className="font-display text-[18px] font-semibold text-ink">
              3.1. Datos que proporcionas voluntariamente
            </h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Creación de cuenta:</strong> Nombre, correo electrónico, contraseña (cifrada).
              </li>
              <li>
                <strong>Perfil astral:</strong> Fecha, hora y lugar de nacimiento (opcional, para
                carta natal).
              </li>
              <li>
                <strong>Consultas de tarot:</strong> Preguntas que escribes (se procesan con IA,
                no se almacenan permanentemente salvo que guardes la lectura).
              </li>
              <li>
                <strong>Contacto:</strong> Si nos escribes, guardamos tu mensaje y datos de
                contacto.
              </li>
            </ul>

            <h3 className="font-display text-[18px] font-semibold text-ink">
              3.2. Datos recopilados automáticamente
            </h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Cookies:</strong> Ver nuestra{" "}
                <a href="/legal/cookies" className="text-cosmic underline">
                  Política de Cookies
                </a>
                .
              </li>
              <li>
                <strong>Datos de navegación:</strong> Dirección IP, navegador, sistema operativo,
                páginas visitadas, tiempo de permanencia.
              </li>
              <li>
                <strong>Analytics:</strong> Si aceptas cookies de analítica, usamos Google
                Analytics para entender el uso del sitio (datos agregados y anónimos).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              4. Cómo usamos tus datos
            </h2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Proporcionar el servicio:</strong> Horóscopo personalizado, lecturas de
                tarot, carta natal.
              </li>
              <li>
                <strong>Mejorar el sitio:</strong> Analizar el uso para optimizar la experiencia.
              </li>
              <li>
                <strong>Comunicación:</strong> Responder tus consultas, enviar actualizaciones
                (solo si te suscribes).
              </li>
              <li>
                <strong>Seguridad:</strong> Prevenir fraude, abusos y proteger el sitio.
              </li>
              <li>
                <strong>Cumplimiento legal:</strong> Cuando lo requiera la ley.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              5. Base legal del tratamiento
            </h2>
            <p>Procesamos tus datos bajo las siguientes bases legales:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Consentimiento:</strong> Al crear cuenta o aceptar cookies opcionales.
              </li>
              <li>
                <strong>Ejecución de contrato:</strong> Para proporcionar los servicios que
                solicitas.
              </li>
              <li>
                <strong>Interés legítimo:</strong> Mejorar el sitio, prevenir fraude.
              </li>
              <li>
                <strong>Obligación legal:</strong> Cuando lo exija la legislación.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              6. Compartir datos con terceros
            </h2>
            <p>
              <strong>No vendemos tus datos personales.</strong> Compartimos información solo en
              estos casos:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Proveedores de servicios:</strong> Hosting (Vercel), base de datos
                (Supabase), analytics (Google Analytics, solo si aceptas), IA (DeepSeek para
                interpretaciones de tarot).
              </li>
              <li>
                <strong>Obligación legal:</strong> Si lo requiere una autoridad competente.
              </li>
              <li>
                <strong>Protección de derechos:</strong> Para hacer cumplir nuestros Términos.
              </li>
            </ul>
            <p>
              Todos los proveedores cumplen con GDPR y tienen acuerdos de protección de datos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              7. Transferencias internacionales
            </h2>
            <p>
              Algunos proveedores pueden estar fuera de la UE/EEE (ej: Google Analytics, DeepSeek).
              Nos aseguramos de que cumplan con mecanismos de transferencia aprobados (Cláusulas
              Contractuales Estándar, Privacy Shield, etc.).
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              8. Retención de datos
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Cuenta activa:</strong> Mientras mantengas tu cuenta.
              </li>
              <li>
                <strong>Cuenta eliminada:</strong> 30 días (período de gracia para recuperación),
                luego borrado permanente.
              </li>
              <li>
                <strong>Logs y analytics:</strong> Máximo 26 meses (Google Analytics).
              </li>
              <li>
                <strong>Consultas de tarot no guardadas:</strong> Se procesan y descartan
                inmediatamente.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              9. Tus derechos (GDPR/RGPD)
            </h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Acceso:</strong> Solicitar una copia de tus datos personales.
              </li>
              <li>
                <strong>Rectificación:</strong> Corregir datos incorrectos.
              </li>
              <li>
                <strong>Supresión:</strong> Eliminar tu cuenta y datos (derecho al olvido).
              </li>
              <li>
                <strong>Limitación:</strong> Restringir el procesamiento en ciertos casos.
              </li>
              <li>
                <strong>Portabilidad:</strong> Exportar tus datos en formato legible.
              </li>
              <li>
                <strong>Oposición:</strong> Oponerte al procesamiento basado en interés legítimo.
              </li>
              <li>
                <strong>Retirar consentimiento:</strong> En cualquier momento (ej: cookies).
              </li>
            </ul>
            <p>
              Para ejercer tus derechos, contacta:{" "}
              <a href="mailto:hola@creovision.io" className="text-cosmic underline">
                hola@creovision.io
              </a>
            </p>
            <p>
              También puedes presentar una reclamación ante la Agencia Española de Protección de
              Datos (AEPD):{" "}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cosmic underline"
              >
                www.aepd.es
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">10. Seguridad</h2>
            <p>Implementamos medidas técnicas y organizativas para proteger tus datos:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Cifrado HTTPS en todas las conexiones</li>
              <li>Contraseñas hasheadas (bcrypt)</li>
              <li>Autenticación segura con tokens</li>
              <li>Firewalls y monitoreo de accesos</li>
              <li>Backups regulares cifrados</li>
            </ul>
            <p>
              Ningún sistema es 100% seguro, pero hacemos todo lo posible para proteger tu
              información.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">11. Menores de edad</h2>
            <p>
              Nuestro sitio no está dirigido a menores de 16 años. No recopilamos
              intencionadamente datos de menores. Si descubres que un menor ha proporcionado
              información, contáctanos para eliminarla.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">
              12. Cambios en esta política
            </h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Te notificaremos cambios
              significativos por email (si tienes cuenta) o mediante un aviso en el sitio. La
              fecha de "Última actualización" refleja la versión más reciente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-[24px] font-semibold text-ink">13. Contacto</h2>
            <p>
              Para cualquier pregunta sobre esta Política de Privacidad o el tratamiento de tus
              datos:
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
