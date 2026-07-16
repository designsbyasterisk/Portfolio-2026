import gloss1 from "@/assets/products/gloss-1.webp";
import gloss2 from "@/assets/products/gloss-2.webp";
import gloss3 from "@/assets/products/gloss-3.webp";
import scrub1 from "@/assets/products/scrub-1.jpg";
import scrub2 from "@/assets/products/scrub-2.webp";
import scrub3 from "@/assets/products/scrub-3.jpg";
import oil1 from "@/assets/products/oil-1.webp";
import oil2 from "@/assets/products/oil-2.webp";
import oil3 from "@/assets/products/oil-3.webp";
import balm1 from "@/assets/products/balm-1.webp";
import balm2 from "@/assets/products/balm-2.webp";
import balm3 from "@/assets/products/balm-3.webp";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  type: string;
  price: number;
  shortDescription: string;
  description: string;
  ritual: string;
  ingredients: string[];
  images: string[];
};

export const products: Product[] = [
  {
    slug: "honey-look-here",
    name: "Honey, Look Here",
    tagline: "Lip Gloss",
    type: "Daily Gloss",
    price: 24,
    shortDescription:
      "A lightweight daily gloss that hydrates, softens, and adds shine — never heavy, never sticky.",
    description:
      "Infused with honey-inspired nourishment, Honey, Look Here delivers a natural glossy finish suited to everyday wear. Reapply anytime, anywhere — the formula glides on smoothly and never overstays its welcome.",
    ritual: "Apply over bare lips or layer atop colour for a soft, mirrored finish.",
    ingredients: ["Honey extract", "Squalane", "Vitamin E", "Jojoba oil"],
    images: [gloss1, gloss2, gloss3],
  },
  {
    slug: "honey-good-night",
    name: "Honey, Good Night",
    tagline: "Lip Scrub",
    type: "Overnight Scrub",
    price: 28,
    shortDescription:
      "A gentle overnight scrub that exfoliates without irritation and restores softness by morning.",
    description:
      "Honey, Good Night turns the bedtime routine into a quiet ritual. Sugar fines lift away dryness while honey-inspired emollients comfort and restore. Wake up to lips that feel renewed.",
    ritual: "Massage a small amount onto lips before bed. Leave on overnight or wipe gently after a minute.",
    ingredients: ["Cane sugar", "Honey extract", "Shea butter", "Sweet almond oil"],
    images: [scrub1, scrub2, scrub3],
  },
  {
    slug: "honey-drippin",
    name: "Honey, Drippin'",
    tagline: "Lip Oil",
    type: "Nourishing Oil",
    price: 26,
    shortDescription:
      "A weightless oil that drenches lips in shine and moisture, never greasy.",
    description:
      "Honey, Drippin' moves with you. The brush-tip applicator paints on a slick of nourishment with a glossy, dimensional finish — wear it alone or over colour.",
    ritual: "Sweep the brush across lips. Reapply throughout the day as desired.",
    ingredients: ["Honey extract", "Marula oil", "Rosehip oil", "Vitamin E"],
    images: [oil1, oil2, oil3],
  },
  {
    slug: "honey-all-day",
    name: "Honey, All Day",
    tagline: "Lip Balm",
    type: "Everyday Balm",
    price: 18,
    shortDescription:
      "A pocket-sized balm built for comfort and lasting hydration.",
    description:
      "Honey, All Day protects from dryness with a soft, breathable veil. Honey-inspired ingredients soften and smooth, while the slim profile slips into any pocket or bag.",
    ritual: "Glide on whenever lips need it. Reapply liberally.",
    ingredients: ["Honey extract", "Beeswax", "Shea butter", "Coconut oil"],
    images: [balm1, balm2, balm3],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);