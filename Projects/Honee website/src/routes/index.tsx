import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { products } from "@/lib/products";
import heroCollection from "@/assets/hero-collection.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HONÉE — Honey, Please" },
      { name: "description", content: "Premium honey-inspired lipcare. Gloss, oil, scrub, and balm for a daily ritual." },
      { property: "og:title", content: "HONÉE — Honey, Please" },
      { property: "og:description", content: "Premium honey-inspired lipcare." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-warm)" }}
        />
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-16 md:pt-20 pb-16 md:pb-24 grid md:grid-cols-12 gap-10 items-stretch">
          <div className="md:col-span-7 flex flex-col justify-between">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6"
            >
              The Honey Ritual — Vol. 01
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="font-display text-[11vw] md:text-[5.5rem] lg:text-[6.5rem] tracking-[-0.02em]"
              style={{ lineHeight: 1.6 }}
            >
              <span className="block">Honey,</span>
              <span className="block italic text-caramel">Please.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              className="mt-10 max-w-md text-base md:text-lg leading-relaxed text-foreground/75"
            >
              Lipcare composed like couture. Honey-inspired botanicals, slow-rendered textures, and a finish that lingers like late afternoon light.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 flex items-center gap-6"
            >
              <Link
                to="/shop"
                className="group inline-flex items-center gap-3 bg-foreground text-background px-7 py-4 text-[12px] uppercase tracking-[0.22em] hover:bg-caramel transition-colors"
              >
                Shop the Collection
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link to="/about" className="text-[12px] uppercase tracking-[0.22em] border-b border-foreground/60 pb-1 hover:text-caramel hover:border-caramel">
                Our Story
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="md:col-span-5 relative flex"
          >
            <div className="w-full overflow-hidden" style={{ boxShadow: "var(--shadow-warm)" }}>
              <motion.img
                src={heroCollection}
                alt="HONÉE collection"
                className="w-full h-full object-cover"
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-honey px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-cocoa">
              New — Four-Piece Ritual
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-border/40 overflow-hidden py-6 bg-[oklch(0.93_0.04_78)]">
        <div className="flex gap-16 animate-[marquee_40s_linear_infinite] whitespace-nowrap font-display text-3xl md:text-5xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-16 items-center font-display">
              <span>Honey, Look Here</span>
              <span className="text-caramel">✺</span>
              <span className="italic">Honey, Good Night</span>
              <span className="text-caramel">✺</span>
              <span>Honey, Drippin'</span>
              <span className="text-caramel">✺</span>
              <span className="italic">Honey, All Day</span>
              <span className="text-caramel">✺</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-10">The Collection</p>
            <h2 className="font-display text-5xl md:text-7xl leading-[1.3]">
              Four pieces.<br />
              <span className="italic text-caramel">One ritual.</span>
            </h2>
          </div>
          <Link to="/shop" className="text-[12px] uppercase tracking-[0.22em] border-b border-foreground pb-1 self-start md:self-auto">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
          {products.map((p, idx) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to="/product/$slug" params={{ slug: p.slug }} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-muted mb-5">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/60">{p.type}</p>
                <h3 className="font-display text-2xl mt-4 leading-tight">{p.name}</h3>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{p.tagline}</span>
                  <span>${p.price}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STORY STRIP */}
      <section className="bg-foreground text-cream py-28 md:py-40">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cream/60 mb-10">Our Philosophy</p>
          <h2 className="font-display text-5xl md:text-8xl leading-[1.2]">
            Slow as honey.<br />
            <span className="italic" style={{ color: "var(--honey)" }}>Made to linger.</span>
          </h2>
          <p className="mt-10 max-w-xl mx-auto text-base md:text-lg text-cream/75 leading-relaxed">
            Every formula is rendered in small batches with honey-inspired botanicals and a quiet sense of patience. Nothing rushed. Nothing wasted. Just lips, softened.
          </p>
          <Link
            to="/about"
            className="inline-block mt-12 text-[12px] uppercase tracking-[0.22em] border-b border-cream/60 pb-1 hover:border-honey hover:text-honey"
          >
            Read the Story
          </Link>
        </div>
      </section>

      {/* RITUAL TEASER → JOURNAL */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60">The Daily Ritual</p>
          <h2 className="font-display text-5xl md:text-7xl leading-[1.2]">
            Sunrise to<br />
            <span className="italic text-caramel">soft sleep.</span>
          </h2>
          <p className="max-w-md text-base md:text-lg leading-relaxed text-foreground/75">
            Four pieces, four small gestures — a balm to wake with, a gloss for the daylight, a scrub before the pillow, and an oil to drift off in. Read the whole ritual in the Journal.
          </p>
          <Link
            to="/journal"
            className="inline-flex items-center gap-3 mt-2 text-[12px] uppercase tracking-[0.22em] border-b border-foreground pb-1 hover:text-caramel hover:border-caramel"
          >
            Read The Honey Ritual →
          </Link>
        </div>
        <div className="aspect-[4/5] overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
          <img src={products[2].images[0]} alt="Honey, Drippin' lip oil" className="w-full h-full object-cover" />
        </div>
      </section>
    </>
  );
}
