"use server";

import type { BlogPost, BlogCategory } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { cookies } from "next/headers";
import { getMongoDB } from "@/lib/server/mongodb";

async function verifyAdmin() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) throw new Error("Authentication required.");
  try {
    const claims = JSON.parse(sessionCookie);
    if (claims.role !== "admin") throw new Error("Authorization failed.");
  } catch {
    throw new Error("Invalid session.");
  }
}

// --- Blog Categories via MongoDB ---
async function getCategoriesFromDB(): Promise<BlogCategory[]> {
  try {
    const mongo = await getMongoDB();
    const docs = await mongo.collection("blogCategories").find({}).toArray();
    return docs.map(({ _id, ...rest }) => rest as BlogCategory);
  } catch {
    return [];
  }
}

async function saveCategoriesToDB(categories: BlogCategory[]): Promise<void> {
  const mongo = await getMongoDB();
  await mongo.collection("blogCategories").deleteMany({});
  if (categories.length > 0)
    await mongo.collection("blogCategories").insertMany(categories);
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
}

// --- Blog Posts via db (already uses MongoDB) ---
export async function getAllPosts(): Promise<BlogPost[]> {
  await db.initialize();
  return db.posts;
}

export async function getAllCategories(): Promise<BlogCategory[]> {
  return getCategoriesFromDB();
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  await db.initialize();
  return db.posts.find((p) => p.slug === slug);
}

export async function searchPostsByTitle(query: string): Promise<BlogPost[]> {
  if (!query) return [];
  await db.initialize();
  return db.posts.filter((post) =>
    post.title.toLowerCase().includes(query.toLowerCase()),
  );
}

const postSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content is too short"),
  theme: z.enum(["classic", "magazine", "minimalist"]),
  related_post_ids: z.array(z.string()),
  category_ids: z.array(z.string()),
  featured_image_url: z
    .string()
    .url("Please provide a valid URL.")
    .optional()
    .or(z.literal("")),
  published_at: z.string().datetime().nullable(),
});

export type PostFormState = {
  message: string;
  errors?: { [key: string]: string[] | undefined };
  post_id?: string;
  post_slug?: string;
};

async function savePostToDB(post: BlogPost) {
  await db.initialize();
  // Update db.posts array
  const index = db.posts.findIndex((p) => p.id === post.id);
  if (index !== -1) {
    db.posts[index] = post;
  } else {
    db.posts.push(post);
  }
  db.posts.sort(
    (a, b) =>
      new Date(b.published_at || b.created_at).getTime() -
      new Date(a.published_at || a.created_at).getTime(),
  );
  await db.savePosts(); // save all posts to MongoDB blogPosts collection

  revalidatePath("/admin/blog", "page");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/blog");
}

export async function savePost(
  prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await verifyAdmin();
  const isNew = formData.get("id") === "new";
  const intent = formData.get("intent");
  const featuredImageUrl = formData.get("featured_image_url_text") as string;
  const publishedAtRaw = formData.get("published_at") as string | null;

  const validatedFields = postSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
    theme: formData.get("theme"),
    related_post_ids: JSON.parse(
      (formData.get("related_post_ids") as string) || "[]",
    ),
    category_ids: JSON.parse((formData.get("category_ids") as string) || "[]"),
    featured_image_url: featuredImageUrl,
    published_at: publishedAtRaw,
  });

  if (!validatedFields.success) {
    return {
      message: "Failed to save post. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, published_at } = validatedFields.data;
  const slug = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
  const publishDate = published_at ? new Date(published_at) : new Date();
  const isScheduled = publishDate > new Date();

  if (isNew) {
    const newPost: BlogPost = {
      ...validatedFields.data,
      id: `post-${Date.now()}`,
      slug,
      author: "Aparra Team",
      status: "draft",
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      excerpt: validatedFields.data.content
        .substring(0, 150)
        .replace(/<[^>]*>?/gm, ""),
      featured_image_url:
        validatedFields.data.featured_image_url ||
        "https://picsum.photos/seed/placeholder/1080/720",
    };

    let message = "Post created successfully!";
    if (intent === "publish") {
      if (isScheduled) {
        newPost.status = "draft";
        newPost.published_at = publishDate.toISOString();
        message = "Post scheduled successfully!";
      } else {
        newPost.status = "published";
        newPost.published_at = publishDate.toISOString();
        message = "Post published successfully!";
      }
    }

    await savePostToDB(newPost);
    return { message, post_id: newPost.id, post_slug: newPost.slug };
  } else {
    const existingPost = await getPostBySlug(formData.get("slug") as string);
    if (existingPost) {
      const updatedPost: BlogPost = {
        ...existingPost,
        ...validatedFields.data,
        slug,
        updated_at: new Date().toISOString(),
        excerpt: validatedFields.data.content
          .substring(0, 150)
          .replace(/<[^>]*>?/gm, ""),
        featured_image_url:
          validatedFields.data.featured_image_url ||
          existingPost.featured_image_url,
      };

      let message = "Post updated successfully!";
      if (intent === "publish") {
        if (isScheduled) {
          updatedPost.status = "draft";
          updatedPost.published_at = publishDate.toISOString();
          message = "Post scheduled successfully!";
        } else {
          updatedPost.status = "published";
          updatedPost.published_at = publishDate.toISOString();
          message = "Post published successfully!";
        }
      } else if (intent === "unpublish") {
        updatedPost.status = "draft";
        message = "Post unpublished and set to draft.";
      } else {
        updatedPost.published_at = published_at;
      }

      await savePostToDB(updatedPost);
      return { message, post_slug: slug };
    } else {
      return {
        message: "Error: Post not found for update.",
        errors: { form: ["Post not found."] },
      };
    }
  }
}

export async function deletePostAction(
  postId: string,
  postSlug: string,
): Promise<{ success: boolean; message: string }> {
  await verifyAdmin();
  try {
    await db.initialize();
    db.posts = db.posts.filter((p) => p.id !== postId);
    await db.savePosts();
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true, message: "Post deleted successfully." };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return {
      success: false,
      message: "An error occurred while deleting the post.",
    };
  }
}

// --- Category Actions ---
const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

export type CategoryFormState = {
  message: string;
  errors?: { [key: string]: string[] | undefined };
};

export async function saveCategory(
  prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await verifyAdmin();
  const validatedFields = categorySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!validatedFields.success) {
    return {
      message: "Failed to save category. Please check fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, name, slug } = validatedFields.data;
  const categories = await getCategoriesFromDB();

  if (id) {
    const index = categories.findIndex((c) => c.id === id);
    if (index > -1) {
      categories[index] = { ...categories[index], name, slug };
    } else {
      return { message: "Category not found." };
    }
  } else {
    if (categories.some((c) => c.slug === slug)) {
      return {
        message: "Error: Slug must be unique.",
        errors: { slug: ["This slug is already in use."] },
      };
    }
    categories.push({ id: `cat-${Date.now()}`, name, slug });
  }

  await saveCategoriesToDB(categories);
  return { message: "Category saved successfully!" };
}

export async function deleteCategory(
  id: string,
): Promise<{ success: boolean; message: string }> {
  await verifyAdmin();
  const [categories, posts] = await Promise.all([
    getCategoriesFromDB(),
    getAllPosts(),
  ]);

  if (posts.some((post) => post.category_ids.includes(id))) {
    return {
      success: false,
      message:
        "Cannot delete category: It is currently assigned to one or more posts.",
    };
  }

  const updated = categories.filter((c) => c.id !== id);
  if (updated.length < categories.length) {
    await saveCategoriesToDB(updated);
    return { success: true, message: "Category deleted successfully." };
  }
  return { success: false, message: "Category not found." };
}
