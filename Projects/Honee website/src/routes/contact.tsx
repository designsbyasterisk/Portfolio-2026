import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Corporate Gifting & Bulk Orders | HONÉE" },
      {
        name: "description",
        content:
          "Reach out about corporate gifting, event favors, and bulk wholesale orders. Small batch lipcare, thoughtfully made.",
      },
      { property: "og:title", content: "Contact — HONÉE" },
      {
        property: "og:description",
        content: "Corporate gifting and bulk orders, small batch lipcare.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Thank you — we'll be in touch within 2 business days.");
    }, 600);
  }

  return (
    <>
      <section className="mx-auto max-w-[1100px] px-6 md:px-10 pt-24 md:pt-40 pb-16 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-14 md:mb-16">
          Corporate Gifting & Bulk Orders
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-6xl md:text-8xl leading-[1.25]"
        >
          Let's make<br />
          <span className="italic text-caramel">something sweet.</span>
        </motion.h1>
        <p className="mt-10 text-lg leading-relaxed text-foreground/80 max-w-2xl mx-auto">
          Hosting an event, building a welcome kit, or stocking your shelves? We
          partner on custom gifting, branded packaging, and wholesale quantities
          starting at 25 units.
        </p>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 md:px-10 pb-32 grid md:grid-cols-5 gap-16">
        <div className="md:col-span-2 space-y-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-3">
              Email
            </p>
            <a
              href="mailto:gifting@honee.co"
              className="font-display text-2xl text-foreground hover:text-caramel transition-colors"
            >
              gifting@honee.co
            </a>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-3">
              Studio
            </p>
            <p className="text-base text-foreground/85 leading-relaxed">
              14 Apiary Lane<br />
              Brooklyn, NY 11211<br />
              Mon – Fri, 10 – 6
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-3">
              Lead time
            </p>
            <p className="text-base text-foreground/85 leading-relaxed">
              Standard bulk orders ship in 2 – 3 weeks. Custom branded
              gifting: 4 – 6 weeks from approval.
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="md:col-span-3 bg-[oklch(0.96_0.02_75)] p-8 md:p-12 space-y-6"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Estimated quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                placeholder="e.g. 100 units"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type of inquiry</Label>
            <select
              id="type"
              name="type"
              defaultValue="gifting"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="gifting">Corporate gifting</option>
              <option value="event">Event favors</option>
              <option value="wholesale">Wholesale / retail</option>
              <option value="other">Something else</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Tell us about your project</Label>
            <Textarea id="message" name="message" rows={5} required />
          </div>
          <Button type="submit" disabled={submitting} className="w-full md:w-auto">
            {submitting ? "Sending…" : "Send inquiry"}
          </Button>
        </form>
      </section>
    </>
  );
}