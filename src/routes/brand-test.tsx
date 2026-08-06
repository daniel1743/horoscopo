import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/brand-test")({
  component: BrandTest,
});

function BrandTest() {
  return (
    <div className="min-h-screen p-8 bg-background flex flex-col gap-12 font-sans pb-32">
      <div>
        <h1 className="text-3xl font-display mb-2">Creovision Brand Validation</h1>
        <p className="text-ink-soft">Test visual identities across sizes and contexts.</p>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-line pb-2">Full Logo (Light/Dark Contexts)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#FFF8F2] p-8 rounded-xl flex items-center justify-center border shadow-sm">
            <img src="/brand/creovision-logo.svg" alt="Light context logo" className="h-16 w-auto object-contain" />
          </div>
          <div className="bg-[#1C1917] p-8 rounded-xl flex items-center justify-center border shadow-sm">
            <img src="/brand/creovision-logo-dark.svg" alt="Dark context logo" className="h-16 w-auto object-contain" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-line pb-2">Symbol (Isotipo)</h2>
        <div className="flex flex-wrap gap-8 items-end">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-parchment p-4 rounded-xl border border-line flex items-center justify-center h-40 w-40">
              <img src="/brand/creovision-symbol.svg" alt="Symbol 128px" className="w-[128px] h-[128px] object-contain" />
            </div>
            <span className="text-xs text-ink-soft">128px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-parchment p-4 rounded-xl border border-line flex items-center justify-center h-24 w-24">
              <img src="/brand/creovision-symbol.svg" alt="Symbol 64px" className="w-[64px] h-[64px] object-contain" />
            </div>
            <span className="text-xs text-ink-soft">64px</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-line pb-2">Favicons</h2>
        <div className="flex flex-wrap gap-8 items-end">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-2 border border-line shadow-sm">
              <img src="/favicon-32x32.png" alt="Favicon 32px" className="w-[32px] h-[32px]" />
            </div>
            <span className="text-xs text-ink-soft">32x32</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-2 border border-line shadow-sm">
              <img src="/favicon-16x16.png" alt="Favicon 16px" className="w-[16px] h-[16px]" />
            </div>
            <span className="text-xs text-ink-soft">16x16</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-line pb-2">PWA Icons & Maskable</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-start gap-4">
            <h3 className="text-sm font-medium text-ink">Standard (Square)</h3>
            <img src="/icons/icon-192x192.png" alt="PWA 192px" className="w-[192px] h-[192px] border shadow-sm bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZWVlIi8+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlZWUiLz4KPC9zdmc+')] bg-repeat" />
          </div>
          
          <div className="flex flex-col items-start gap-4">
            <h3 className="text-sm font-medium text-ink">Maskable (Simulated Squircle)</h3>
            <div className="relative w-[192px] h-[192px] overflow-hidden" style={{ borderRadius: '25%' }}>
              <img src="/icons/icon-maskable-192x192.png" alt="Maskable 192px" className="w-full h-full object-cover" />
              {/* Safe zone overlay for debugging */}
              <div className="absolute inset-0 m-[10%] border border-dashed border-red-500/50 rounded-full pointer-events-none" />
            </div>
            <p className="text-xs text-ink-soft max-w-[192px]">
              Dashed red circle shows the guaranteed safe zone. Nothing important should cross it.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-line pb-2">Apple Touch Icon</h2>
        <div className="flex flex-col items-start gap-4">
          <img src="/apple-touch-icon.png" alt="Apple Touch Icon" className="w-[180px] h-[180px] rounded-[40px] border shadow-sm" />
          <span className="text-xs text-ink-soft">180x180 (iOS will apply this mask)</span>
        </div>
      </section>
    </div>
  );
}
