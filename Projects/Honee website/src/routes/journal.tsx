import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { products } from "@/lib/products";
import swatchBalm from "@/assets/ritual/swatch-balm.png";
import swatchGloss from "@/assets/ritual/swatch-gloss.png";
import swatchScrub from "@/assets/ritual/swatch-scrub.png";
import swatchOil from "@/assets/ritual/swatch-oil.png";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "The Honey Ritual — HONÉE Journal" },
      { name: "description", content: "A four-step honey ritual: morning balm, midday gloss, evening scrub, and a healing oil before sleep." },
      { property: "og:title", content: "The Honey Ritual — HONÉE Journal" },
      { property: "og:description", content: "A four-step daily lip ritual, from sunrise to soft sleep." },
    ],
    links: [{ rel: "canonical", href: "/journal" }],
  }),
  component: Journal,
});

type Step = {
  num: string;
  label: string;
  time: string;
  body: string;
  ritual: string;
  productSlug: string;
  productName: string;
  productTagline: string;
  swatch: string;
  swatchTop: string;
  swatchLeft: string;
  swatchSize: string;
  swatchRotate: number;
  labelTop: string;
  labelSide: "left" | "right";
};

function getSteps(): Step[] {
  const find = (slug: string) => products.find((p) => p.slug === slug)!;
  const allDay = find("honey-all-day");
  const lookHere = find("honey-look-here");
  const goodNight = find("honey-good-night");
  const drippin = find("honey-drippin");

  return [
    {
      num: "1.",
      label: "BALM",
      time: "AM · 07:00",
      body: "A clean slate, a slow breath, a balm that protects without ceremony. Honey, All Day glides on like sunrise — warm and built to last until the world is fully awake.",
      ritual: "Glide on bare lips. Layer again before stepping outside.",
      productSlug: allDay.slug,
      productName: allDay.name,
      productTagline: allDay.tagline,
      swatch: swatchBalm,
      swatchTop: "2%",
      swatchLeft: "0%",
      swatchSize: "38%",
      swatchRotate: -8,
      labelTop: "18%",
      labelSide: "right",
    },
    {
      num: "2.",
      label: "GLOSS",
      time: "NOON · 12:30",
      body: "Midday is for being seen. Sweep on Honey, Look Here for a mirrored finish that catches the light without weight or stick.",
      ritual: "Apply over bare lips or atop colour. Reapply at golden hour.",
      productSlug: lookHere.slug,
      productName: lookHere.name,
      productTagline: lookHere.tagline,
      swatch: swatchGloss,
      swatchTop: "26%",
      swatchLeft: "60%",
      swatchSize: "34%",
      swatchRotate: 14,
      labelTop: "40%",
      labelSide: "left",
    },
    {
      num: "3.",
      label: "SCRUB",
      time: "PM · 21:30",
      body: "Before the pillow, a small ritual. Massage Honey, Good Night in slow circles — sugar fines lift the day away, honey-inspired emollients leave only softness behind.",
      ritual: "Massage in slow circles for one minute. Wipe or leave overnight.",
      productSlug: goodNight.slug,
      productName: goodNight.name,
      productTagline: goodNight.tagline,
      swatch: swatchScrub,
      swatchTop: "52%",
      swatchLeft: "4%",
      swatchSize: "32%",
      swatchRotate: 6,
      labelTop: "62%",
      labelSide: "right",
    },
    {
      num: "4.",
      label: "OIL",
      time: "NIGHT · 22:00",
      body: "After the scrub, the drink. Paint Honey, Drippin' across newly-smoothed lips and let it do its slow work overnight. Wake to lips that feel poured, not patched.",
      ritual: "Sweep the brush across lips as the last step before sleep.",
      productSlug: drippin.slug,
      productName: drippin.name,
      productTagline: drippin.tagline,
      swatch: swatchOil,
      swatchTop: "70%",
      swatchLeft: "62%",
      swatchSize: "32%",
      swatchRotate: -12,
      labelTop: "84%",
      labelSide: "left",
    },
  ];
}

function Journal() {
  const steps = getSteps();

  return (
    <>
      {/* HEADER */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pt-20 md:pt-28 pb-12 md:pb-16 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-10">
          Journal — Vol. 01
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-8xl leading-[1.2]"
        >
          A 4-Step<br />
          <span className="italic text-caramel">Honey Ritual.</span>
        </motion.h1>
        <p className="mt-8 max-w-xl mx-auto text-base md:text-lg leading-relaxed text-foreground/75">
          Sunrise to soft sleep. Four small gestures, each composed to leave your lips a little better than it found them.
        </p>
      </section>

      {/* POSTER */}
      <section className="border-y border-border/40 bg-[oklch(0.97_0.02_85)]">
        <div className="mx-auto max-w-[1000px] px-6 md:px-10 py-16 md:py-24">
          <div className="relative w-full aspect-[3/4]">
            {/* Dotted connector spine */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 50,18 L 50,40 L 50,62 L 50,84"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="0.5 2"
                fill="none"
                className="text-foreground/55"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
              {[18, 40, 62, 84].map((cy) => (
                <circle
                  key={cy}
                  cx="50"
                  cy={cy}
                  r="0.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-foreground/70"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* Swatches */}
            {steps.map((s, i) => (
              <motion.img
                key={`sw-${i}`}
                src={s.swatch}
                alt={`${s.productName} swatch`}
                width={1024}
                height={1024}
                loading="lazy"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  top: s.swatchTop,
                  left: s.swatchLeft,
                  width: s.swatchSize,
                  transform: `rotate(${s.swatchRotate}deg)`,
                }}
                className="absolute h-auto select-none pointer-events-none mix-blend-multiply"
              />
            ))}

            {/* Labels */}
            {steps.map((s, i) => (
              <motion.div
                key={`lb-${i}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
                style={{
                  top: s.labelTop,
                  ...(s.labelSide === "right"
                    ? { left: "calc(50% + 1.25rem)" }
                    : { right: "calc(50% + 1.25rem)" }),
                  transform: "translateY(-50%)",
                }}
                className="absolute"
              >
                <Link
                  to="/product/$slug"
                  params={{ slug: s.productSlug }}
                  className={`group inline-flex flex-col gap-1 ${s.labelSide === "left" ? "items-end" : "items-start"}`}
                >
                  <span className="inline-block bg-caramel px-3 py-1.5 font-display text-xl md:text-3xl text-background tracking-tight group-hover:bg-foreground transition-colors whitespace-nowrap">
                    {s.num} {s.label}
                  </span>
                  <span className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground/60 pl-1">
                    {s.time}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="mt-12 text-center text-[11px] uppercase tracking-[0.28em] text-foreground/60">
            * Reapply liberally. Honey forgives.
          </p>
        </div>
      </section>

      {/* RITUAL NOTES */}
      <section className="mx-auto max-w-[1100px] px-6 md:px-10 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-14">
          {steps.map((s) => (
            <div key={s.productSlug} className="flex gap-5">
              <span className="font-display text-5xl text-caramel leading-none">{s.num}</span>
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 mb-4">
                  {s.time} · {s.label}
                </p>
                <h3 className="font-display text-2xl md:text-3xl mb-5">{s.productName}</h3>
                <p className="text-foreground/80 leading-relaxed mb-5">{s.body}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-foreground/55 mb-6">
                  Ritual · {s.ritual}
                </p>
                <Link
                  to="/product/$slug"
                  params={{ slug: s.productSlug }}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground hover:text-caramel transition-colors"
                >
                  Shop {s.productTagline} <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section className="mx-auto max-w-[900px] px-6 md:px-10 py-24 md:py-32 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">The Whole Ritual</p>
        <h2 className="font-display text-4xl md:text-6xl leading-[2]">
          Four pieces.<br />
          <span className="italic text-caramel">One slow, golden day.</span>
        </h2>
        <Link
          to="/shop"
          className="inline-flex items-center gap-3 mt-10 bg-foreground text-background px-7 py-4 text-[12px] uppercase tracking-[0.22em] hover:bg-caramel transition-colors"
        >
          Shop the Collection
          <span>→</span>
        </Link>
      </section>
    </>
  );
}
