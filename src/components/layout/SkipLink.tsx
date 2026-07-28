/** Enlace accesible para saltar al contenido principal. Visible solo con foco. */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:font-body focus:text-[14px] focus:font-medium focus:text-ink-inverse focus:shadow-floating"
    >
      Saltar al contenido principal
    </a>
  );
}
