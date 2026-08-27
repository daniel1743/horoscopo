import { Container } from "@/components/layout/Container";
import { homeConfig } from "@/config/home";
import { PublicNewsletterForm } from "@/components/newsletter/PublicNewsletterForm";

/** Newsletter público: no depende de la preferencia de una cuenta autenticada. */
export function HomeNewsletterSection() {
  const { newsletter: cfg } = homeConfig;

  return (
    <section
      aria-labelledby="newsletter-title"
      className="py-14 md:py-20"
      style={{
        background: "linear-gradient(180deg, var(--bg-lunar-ivory) 0%, var(--bg-lunar-ivory) 100%)",
      }}
    >
      <Container>
        <div className="mx-auto max-w-[960px] rounded-[var(--radius-card-lg)] border border-gold/30 bg-warm-white/60 p-6 backdrop-blur md:p-10">
          <PublicNewsletterForm
            id="home-newsletter"
            title={cfg.title}
            description={cfg.description}
            submitLabel={cfg.submitLabel}
            privacyHelper={cfg.privacyHelper}
          />
        </div>
      </Container>
    </section>
  );
}
