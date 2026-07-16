import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/50 bg-[oklch(0.93_0.03_75)]">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <h3 className="font-display text-5xl md:text-6xl leading-[2]">
              Honey,<br />Please.
            </h3>
            <p className="mt-6 text-sm text-muted-foreground max-w-sm">
              A quiet ritual for the lips. Crafted in small batches with honey-inspired botanicals.
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 mb-4">Shop</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/product/$slug" params={{ slug: "honey-look-here" }}>Lip Gloss</Link></li>
              <li><Link to="/product/$slug" params={{ slug: "honey-drippin" }}>Lip Oil</Link></li>
              <li><Link to="/product/$slug" params={{ slug: "honey-all-day" }}>Lip Balm</Link></li>
              <li><Link to="/product/$slug" params={{ slug: "honey-good-night" }}>Lip Scrub</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 mb-4">House</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/journal">Journal</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 mb-4">Care</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" hash="shipping">Shipping</Link></li>
              <li><Link to="/about" hash="returns">Returns</Link></li>
              <li><Link to="/about" hash="faq">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border/60 flex flex-col md:flex-row justify-between text-[11px] uppercase tracking-[0.22em] text-foreground/50">
          <p>© {new Date().getFullYear()} HONÉE</p>
          <p>Made with honey</p>
        </div>
      </div>
    </footer>
  );
}