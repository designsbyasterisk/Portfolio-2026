import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import beekeeperFrame from "@/assets/about/beekeeper-frame.jpg";
import honeycomb from "@/assets/about/honeycomb.jpg";
import beekeeperHive from "@/assets/about/beekeeper-hive.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — HONÉE" },
      { name: "description", content: "The story behind HONÉE — small-batch, honey-inspired lipcare." },
      { property: "og:title", content: "About — HONÉE" },
      { property: "og:description", content: "Small-batch, honey-inspired lipcare." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="mx-auto max-w-[1100px] px-6 md:px-10 pt-24 md:pt-40 pb-24 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-14 md:mb-16">Our Story</p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.3] whitespace-nowrap"
        >
          A small house,<br />
          <span className="italic text-caramel">built on honey.</span>
        </motion.h1>
      </section>

      <section className="mx-auto max-w-[900px] px-6 md:px-10 pb-32 space-y-8 text-lg leading-relaxed text-foreground/85">
        <p>
          HONÉE began with a single jar of raw honey on a kitchen counter and a question: why doesn't lipcare feel like something we look forward to?
        </p>
        <p>
          We rendered our first formulas slowly — by hand, in small batches — pairing honey-inspired botanicals with the kind of quiet textures that ask you to take a breath before you apply them. Each product carries a name like a sentence: an invitation, a wink, a small daily promise.
        </p>
        <p>
          We don't make a hundred things. We make four. Each one earns its place in your morning, your afternoon, your before-bed ritual. Honey, look here. Honey, all day. Honey, drippin'. Honey, good night.
        </p>
        <p className="font-display text-3xl text-caramel italic pt-4">Honey, please.</p>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pb-32">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 md:col-span-7 md:row-span-2 aspect-[3/4] md:aspect-auto md:min-h-[640px] overflow-hidden"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <img src={beekeeperFrame} alt="Beekeeper inspecting a honeycomb frame at golden hour" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-7 md:col-span-5 aspect-[4/5] overflow-hidden"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <img src={honeycomb} alt="Raw honeycomb dripping between hands" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-5 md:col-span-5 aspect-[4/5] overflow-hidden self-end"
            style={{ boxShadow: "var(--shadow-warm)" }}
          >
            <img src={beekeeperHive} alt="Beekeeper lifting a brood frame from the hive" className="w-full h-full object-cover" />
          </motion.div>
        </div>
        <div className="mt-10 flex items-center gap-6 max-w-[1100px] mx-auto">
          <div className="h-px flex-1 bg-foreground/15" />
          <p className="text-[11px] uppercase tracking-[0.32em] text-foreground/60 text-center">
            From hive to lip — every batch traceable
          </p>
          <div className="h-px flex-1 bg-foreground/15" />
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 md:px-10 pb-24 grid md:grid-cols-2 gap-16">
        <div id="shipping" className="scroll-mt-24">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">Shipping</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight mb-6">Slow, careful, traceable.</h2>
          <div className="space-y-4 text-base leading-relaxed text-foreground/85">
            <p>Orders ship within 2–3 business days from our small studio. Standard delivery arrives in 4–7 business days; express in 2–3.</p>
            <p>Complimentary standard shipping on orders over $60. International shipping available to most countries — duties calculated at checkout.</p>
          </div>
        </div>
        <div id="returns" className="scroll-mt-24">
          <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">Returns</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight mb-6">Thirty quiet days.</h2>
          <div className="space-y-4 text-base leading-relaxed text-foreground/85">
            <p>If a product isn't right for you, return it within 30 days of delivery — opened or unopened — for a full refund. We'll send a prepaid label.</p>
            <p>Damaged in transit? Write to us at <a className="underline" href="mailto:care@honee.co">care@honee.co</a> within 7 days and we'll replace it immediately.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[900px] px-6 md:px-10 pb-32 scroll-mt-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6 text-center">FAQ</p>
        <h2 className="font-display text-5xl md:text-6xl leading-[1.3] text-center mb-12">
          Honey,<br />
          <span className="italic text-caramel">ask away.</span>
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="q1">
            <AccordionTrigger className="text-lg font-sans">Where does your honey come from?</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85">
              All of our honey is sourced from a small collective of family-run apiaries in the foothills of New Zealand and the Mediterranean. Every batch is raw, unfiltered, and traceable to the hive it came from.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger className="text-lg font-sans">Are your products organic?</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85">
              Every botanical ingredient we use is certified organic. Our base oils, butters, and waxes carry COSMOS Organic certification, and we never use synthetic fragrance, parabens, or petroleum derivatives.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q3">
            <AccordionTrigger className="text-lg font-sans">Is HONÉE cruelty-free?</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85">
              Always. We are Leaping Bunny certified and never test on animals — not our formulas, not our ingredients, not at any stage. Our beeswax and honey are gathered using ethical, low-intervention practices that prioritize hive health.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q4">
            <AccordionTrigger className="text-lg font-sans">Which skin types can use HONÉE?</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85">
              All of them. Our formulas are designed for sensitive, dry, combination, and oily skin alike. The honey base is naturally antibacterial and humectant, making it gentle even on reactive or post-procedure lips.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q5">
            <AccordionTrigger className="text-lg font-sans">Is HONÉE vegan?</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85">
              Our products contain honey and beeswax, so they are not vegan. They are vegetarian, and every bee-derived ingredient is ethically sourced from apiaries that prioritize hive welfare over yield.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q6">
            <AccordionTrigger className="text-lg font-sans">Are the products safe during pregnancy?</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85">
              Yes. We avoid retinoids, salicylic acid, and essential oils flagged as pregnancy-cautious. As always, we recommend checking with your doctor if you have specific concerns.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q7">
            <AccordionTrigger className="text-lg font-sans">How long does each product last?</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85">
              With daily use, the balm and gloss last about 3–4 months, the oil 2–3 months, and the scrub 6 months. Each product is good for 12 months after opening.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q8">
            <AccordionTrigger className="text-lg font-sans">Do you offer corporate gifting or bulk orders?</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed text-foreground/85">
              We do — visit our <a href="/contact" className="underline">contact page</a> to start a conversation about custom gifting, event favors, or wholesale.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </>
  );
}