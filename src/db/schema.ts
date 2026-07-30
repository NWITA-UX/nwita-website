import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/*  NWITA — database schema                                            */
/*  Admin users & sessions · catalogue · media library · site settings */
/* ------------------------------------------------------------------ */

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  details: text("details"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  collectionId: integer("collection_id").references(() => collections.id, {
    onDelete: "set null",
  }),
  sizes: text("sizes")
    .array()
    .notNull()
    .default([]),
  colors: jsonb("colors").$type<string[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Media library — cinematic videos and campaign imagery, editable from the admin panel. */
export const media = pgTable("media_library", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("image"), // "image" | "video"
  url: text("url").notNull(),
  title: text("title"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

/** Key / value site settings — hero, homepage, logo, about, contact, seo, brand… */
export const settings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
