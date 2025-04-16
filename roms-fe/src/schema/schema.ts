import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. **Rephrased Question**:  
// You're asking whether you should **keep the contents of your `schema.ts` file intact** since it uses **Drizzle ORM** for database schema definition, or if you should **modify it**. Specifically, you're wondering if changes are needed in the schema now that your project is **frontend-only** without server-side logic.

// 2. **Answer**:

// ### ✅ **Drizzle ORM Schema in a Frontend-Only Project**

// Since your project is now **frontend-only**, you don’t need to **modify the schema.ts file** itself for Drizzle ORM. However, there are some important considerations regarding how the schema is used in your current setup.

// Here’s why you can **keep the schema intact**:

// 1. **Drizzle ORM Usage**: Drizzle ORM is **typically used on the backend** to interact with a **PostgreSQL database**. Since you’ve removed the server-side code, you’ll likely need to **remove or modify any logic that interacts with a real database**.

// 2. **Frontend-Only Focus**: In a frontend-only setup, you can either:
//    - **Simulate database interactions** (e.g., using in-memory storage or localStorage).
//    - **Directly connect to your backend API** (if a backend exists elsewhere) using REST or GraphQL and call the ORM operations through the backend.

// ### **Deciding on Changes**:

// #### **If Drizzle ORM is meant for client-side usage** (unlikely unless you're interacting with a remote API):
// If you plan to simulate database interactions on the frontend (for development or testing), you can keep the schema file. However, **you won't directly interact with the database** using Drizzle in the frontend. Instead, you might use **API calls** to interact with the backend, which would handle the ORM logic.

// - **Keep** the schema as it is if it's only meant to **represent** the structure of the data you’ll send to/from the backend via API calls.
// - **Remove** any Drizzle-specific methods or database operations from the frontend, as the client-side should not directly access the database.

// #### **If you no longer plan to use Drizzle at all** (because your frontend doesn’t require it):
// If your frontend doesn’t need to know about the schema directly (perhaps you’re relying on an external API), then you could remove **all Drizzle-related code** and focus on API requests.

// ### **Possible Adjustments to Schema for Frontend-Only**:

// If you still want to keep Drizzle schema as a reference (but not for database access), you can leave the file intact. However, **ensure you're not using it** for direct client-side DB interactions.

// For example, if you're using the `insertUserSchema` or `insertArticleSchema` for form validation on the frontend, then you might want to **keep these schema definitions** to validate data before sending it to the backend.

// ```ts
// // If you're using the schema for form validation on the frontend
// import { insertUserSchema, insertArticleSchema } from "./schema";

// // Frontend validation example
// const validateUser = (userData) => {
//   try {
//     insertUserSchema.parse(userData);  // This will throw an error if invalid
//     return true;
//   } catch (error) {
//     console.error("Invalid data:", error.errors);
//     return false;
//   }
// };
// ```

// ### **What You Can Do**:
// - **If keeping Drizzle for validation**: Keep the schema file as is for validation, but ensure the database interaction is done via API requests.
// - **If no need for Drizzle at all**: Remove Drizzle dependencies, `pg-core`, and the schema file.

// ### **Industrial Terms**:
// - **Client-side Validation**: Using Zod or Drizzle schema for data validation in the frontend.
// - **API-based Data Interaction**: Moving away from direct DB access in favor of server-side API calls.
// - **ORM Schema Abstraction**: Using ORM definitions purely for structuring data, not interacting with databases.

// ---

// To summarize, **keep your `schema.ts` file intact** if you still want to use the schema for frontend data validation or structuring. However, make sure you remove any references to Drizzle that attempt to **access a backend database directly**, as that logic should remain on the server side. Let me know if you'd like to remove Drizzle entirely!

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  isAdmin: boolean("is_admin").default(false),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  userId: true,
  title: true,
  content: true,
  imageUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
