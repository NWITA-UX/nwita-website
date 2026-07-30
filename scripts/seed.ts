/**
 * NWITA seed — admin account, catalogue, media library and site settings.
 * Run with: npx tsx scripts/seed.ts
 */
import "dotenv/config";
import { db } from "../src/db";
import {
  adminUsers,
  categories,
  collections,
  media,
  productImages,
  products,
  settings,
} from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { SETTINGS_DEFAULTS } from "../src/lib/settings";

const FABRIC = "/images/fabric-detail.jpg";

const CATALOGUE = [
  {
    name: "Old Art T-Shirt",
    slug: "old-art-t-shirt",
    price: "85",
    compareAtPrice: "110",
    stock: 24,
    category: "t-shirts",
    collection: "old-art",
    featured: true,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Bone", "Washed Grey"],
    description:
      "The house signature. A heavyweight boxy tee screen-printed with a faded archival sketch — art that already feels like a memory. Cut long, finished raw.",
    details:
      "320 GSM combed cotton jersey · garment-dyed · water-based ink print · numbered inside the hem · cut in Porto, Portugal.",
    images: ["/images/product-tshirt.jpg", FABRIC],
  },
  {
    name: "Old Art Hoodie",
    slug: "old-art-hoodie",
    price: "140",
    compareAtPrice: null,
    stock: 16,
    category: "hoodies",
    collection: "old-art",
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Charcoal"],
    description:
      "A monolithic hoodie in brushed fleece that holds its shape like architecture. The hood is cut deep — a private room you can wear.",
    details:
      "540 GSM brushed loopback fleece · tonal embroidered monogram · flatlocked seams · numbered inside the cuff · made in Osaka, Japan.",
    images: ["/images/product-hoodie.jpg", FABRIC],
  },
  {
    name: "Silence Crewneck",
    slug: "silence-crewneck",
    price: "120",
    compareAtPrice: null,
    stock: 18,
    category: "hoodies",
    collection: "core-essentials",
    featured: false,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Bone", "Black"],
    description:
      "Nothing on it but weight. The Silence crewneck is our answer to the perfect blank — bone fleece that softens into your life.",
    details:
      "480 GSM organic loopback fleece · ribbed side gussets · pre-washed for zero shrinkage · numbered inside the hem.",
    images: ["/images/product-crewneck.jpg", FABRIC],
  },
  {
    name: "Eclipse Longsleeve",
    slug: "eclipse-longsleeve",
    price: "95",
    compareAtPrice: null,
    stock: 21,
    category: "t-shirts",
    collection: "core-essentials",
    featured: false,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    description:
      "A second-skin long sleeve with a single line of serif type over the heart — the house credo, whispered. Layers like shadow.",
    details:
      "220 GSM long-staple cotton · shoulder-to-shoulder taping · high-density chest print · numbered inside the collar.",
    images: ["/images/product-longsleeve.jpg", FABRIC],
  },
  {
    name: "Archive Wide Pant",
    slug: "archive-wide-pant",
    price: "150",
    compareAtPrice: "185",
    stock: 12,
    category: "bottoms",
    collection: "archive",
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Graphite"],
    description:
      "Wide-leg trousers that fall like curtains. Double-pleated, heavily draped, and cut to pool exactly where a photograph wants them to.",
    details:
      "Heavy twill wool-cotton · double reverse pleats · adjustable side tabs · lined to the knee · numbered inside the waistband.",
    images: ["/images/product-pant.jpg", FABRIC],
  },
  {
    name: "Ghost Knit Beanie",
    slug: "ghost-knit-beanie",
    price: "55",
    compareAtPrice: null,
    stock: 30,
    category: "accessories",
    collection: "archive",
    featured: false,
    sizes: ["One Size"],
    colors: ["Black", "Bone"],
    description:
      "A chunky ribbed beanie knit so dense it holds the shape of your absence. The only logo is a woven thread, nearly invisible.",
    details:
      "Merino-alpaca blend · chunky 2×2 rib · fold-over cuff · woven micro-label · knitted in a family mill in Biella, Italy.",
    images: ["/images/product-beanie.jpg", FABRIC],
  },
];

async function main() {
  const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (existing) {
    console.log("NWITA: database already seeded — skipping.");
    return;
  }

  // 1. Admin account
  await db.insert(adminUsers).values({
    email: "admin@nwita.com",
    passwordHash: hashPassword("wearthefeeling"),
    name: "NWITA Atelier",
  });
  console.log("✓ admin user (admin@nwita.com)");

  // 2. Categories
  const catRows = await db
    .insert(categories)
    .values([
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "Hoodies & Crews", slug: "hoodies" },
      { name: "Bottoms", slug: "bottoms" },
      { name: "Accessories", slug: "accessories" },
    ])
    .returning();
  const catBySlug = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  // 3. Collections
  const colRows = await db
    .insert(collections)
    .values([
      {
        name: "Old Art",
        slug: "old-art",
        description:
          "The FW·26 statement — archival sketches printed on heavyweight cotton. Art that already feels old, on pieces built to age with you.",
        image: "/images/product-hoodie.jpg",
        featured: true,
        sortOrder: 1,
      },
      {
        name: "Core Essentials",
        slug: "core-essentials",
        description:
          "The permanent wardrobe. Blanks perfected until they stopped being blank — the pieces the rest of your life is worn with.",
        image: "/images/product-crewneck.jpg",
        featured: true,
        sortOrder: 2,
      },
      {
        name: "Archive",
        slug: "archive",
        description:
          "Final numbers from retired runs, plus the objects that surround the clothing. Once a number is gone, it is gone.",
        image: "/images/product-pant.jpg",
        featured: false,
        sortOrder: 3,
      },
    ])
    .returning();
  const colBySlug = Object.fromEntries(colRows.map((c) => [c.slug, c.id]));
  console.log(`✓ ${catRows.length} categories · ${colRows.length} collections`);

  // 4. Products + images
  for (const p of CATALOGUE) {
    const [row] = await db
      .insert(products)
      .values({
        name: p.name,
        slug: p.slug,
        description: p.description,
        details: p.details,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        categoryId: catBySlug[p.category] ?? null,
        collectionId: colBySlug[p.collection] ?? null,
        sizes: p.sizes,
        colors: p.colors,
        featured: p.featured,
        published: true,
      })
      .returning();
    await db.insert(productImages).values(
      p.images.map((url, i) => ({
        productId: row.id,
        url,
        alt: `${p.name} — NWITA`,
        sortOrder: i,
      })),
    );
  }
  console.log(`✓ ${CATALOGUE.length} products with imagery`);

  // 5. Media library
  await db.insert(media).values([
    { type: "image", url: "/images/hero.jpg", title: "FW·26 Campaign — Hero", sortOrder: 1 },
    { type: "image", url: "/images/story.jpg", title: "Atelier — The Hands", sortOrder: 2 },
    { type: "image", url: "/images/fabric-detail.jpg", title: "Fabric Study 01", sortOrder: 3 },
    { type: "image", url: "/images/product-tshirt.jpg", title: "Old Art T-Shirt", sortOrder: 4 },
    { type: "image", url: "/images/product-hoodie.jpg", title: "Old Art Hoodie", sortOrder: 5 },
    { type: "image", url: "/images/product-crewneck.jpg", title: "Silence Crewneck", sortOrder: 6 },
    { type: "image", url: "/images/product-longsleeve.jpg", title: "Eclipse Longsleeve", sortOrder: 7 },
    { type: "image", url: "/images/product-pant.jpg", title: "Archive Wide Pant", sortOrder: 8 },
    { type: "image", url: "/images/product-beanie.jpg", title: "Ghost Knit Beanie", sortOrder: 9 },
    {
      type: "video",
      url: "https://videos.pexels.com/video-files/7760062/7760062-uhd_4096_2160_25fps.mp4",
      title: "Campaign Film — Main",
      sortOrder: 10,
    },
    {
      type: "video",
      url: "https://videos.pexels.com/video-files/6962210/6962210-uhd_4096_2160_25fps.mp4",
      title: "Campaign Film — Leather Study",
      sortOrder: 11,
    },
  ]);
  console.log("✓ media library");

  // 6. Settings documents
  await db.insert(settings).values(
    Object.entries(SETTINGS_DEFAULTS).map(([key, value]) => ({
      key,
      value: value as Record<string, unknown>,
    })),
  );
  console.log("✓ site settings");
  console.log("\nNWITA seeded. Admin login: admin@nwita.com / wearthefeeling");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
