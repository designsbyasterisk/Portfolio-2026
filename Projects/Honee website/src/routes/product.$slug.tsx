import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { getProduct, products } from "@/lib/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — HONÉE` },
          { name: "description", content: loaderData.product.shortDescription },
          { property: "og:title", content: `${loaderData.product.name} — HONÉE` },
          { property: "og:description", content: loaderData.product.shortDescription },
          { property: "og:type", content: "product" },
          { property: "og:image", content: loaderData.product.images[0] },
        ]
      : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display text-6xl">Not found.</h1>
      <Link to="/shop" className="mt-6 text-[12px] uppercase tracking-[0.22em] border-b border-foreground pb-1">
        Back to the shop
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="font-display text-3xl">Something went sideways.</p>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const others = products.filter((p) => p.slug !== product.slug);

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pt-10 md:pt-16">
        <Link to="/shop" className="text-[11px] uppercase tracking-[0.22em] text-foreground/60 hover:text-foreground">
          ← Shop
        </Link>
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 mt-8">
          {/* Gallery */}
          <div className="md:col-span-7 space-y-4">
            {product.images.map((src: string, i: number) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="aspect-[4/5] overflow-hidden bg-muted"
              >
                <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>

          {/* Info */}
          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-10">{product.type}</p>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.3]">
                {product.name.split(",")[0]},
                <br />
                <span className="italic text-caramel">{product.name.split(",")[1]?.trim()}.</span>
              </h1>
              <p className="mt-6 text-base text-foreground/80 leading-relaxed">{product.description}</p>

              <div className="mt-10 flex items-end justify-between">
                <span className="font-display text-3xl">${product.price}</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">15 ml — small batch</span>
              </div>

              <button
                onClick={() =>
                  add({ slug: product.slug, name: product.name, price: product.price, image: product.images[0] })
                }
                className="mt-6 w-full bg-foreground text-background py-5 text-[12px] uppercase tracking-[0.22em] hover:bg-caramel transition-colors"
              >
                Add to Bag
              </button>

              <div className="mt-12 space-y-6 border-t border-border/60 pt-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/60 mb-3">Ritual</p>
                  <p className="text-sm leading-relaxed">{product.ritual}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/60 mb-3">Honey-inspired notes</p>
                  <ul className="text-sm space-y-1.5">
                    {product.ingredients.map((ing: string) => (
                      <li key={ing} className="flex gap-3">
                        <span className="text-caramel">—</span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 mt-32 md:mt-40">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/60 mb-6">Pair With</p>
        <h2 className="font-display text-4xl md:text-6xl leading-[2] mb-12">
          Continue the <span className="italic text-caramel">ritual</span>.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
          {others.map((p) => (
            <Link key={p.slug} to="/product/$slug" params={{ slug: p.slug }} className="group">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              </div>
              <h3 className="font-display text-2xl mt-4">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.tagline} — ${p.price}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}