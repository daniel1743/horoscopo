/**
 * Componente para inyectar JSON-LD (structured data) en el head.
 * Mejora SEO con rich snippets y featured snippets.
 */

import { useEffect } from "react";

interface StructuredDataProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Inyecta datos estructurados JSON-LD en el <head> de forma segura.
 * Google, Bing y otros motores usan esto para rich snippets.
 */
export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(Array.isArray(data) ? data : [data]);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
}

/**
 * Hook para agregar structured data de forma declarativa.
 */
export function useStructuredData(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(Array.isArray(data) ? data : [data]);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [data]);
}
