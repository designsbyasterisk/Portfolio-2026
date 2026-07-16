import { Link } from "@tanstack/react-router";
import { useCart, cartCount } from "@/lib/cart";
import logo from "@/assets/honee-logo.png";

export function Nav() {
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const count = cartCount(items);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-cream/70 border-b border-border/40">
      <nav className="mx-auto max-w-[1400px] flex items-center justify-between px-6 md:px-10 py-2">
        <div className="flex-1 hidden md:flex gap-8 text-[13px] uppercase tracking-[0.18em] text-foreground/80">
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/journal" className="hover:text-foreground transition-colors">Journal</Link>
        </div>
        <Link to="/" className="flex items-center">
          <img src={logo} alt="HONÉE" className="h-10 md:h-12 w-auto" />
        </Link>
        <div className="flex-1 flex justify-end items-center gap-6 text-[13px] uppercase tracking-[0.18em] text-foreground/80">
          <Link to="/contact" className="hidden md:inline hover:text-foreground transition-colors">Contact</Link>
          <button
            onClick={() => setOpen(true)}
            className="hover:text-foreground transition-colors"
            aria-label="Open cart"
          >
            BAG {count > 0 && <span className="ml-1">({count})</span>}
          </button>
        </div>
      </nav>
    </header>
  );
}