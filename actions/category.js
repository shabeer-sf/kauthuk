"use server";

import { db } from "@/lib/prisma";

export async function createCategory(data) {
  try {
    // console.log("Received data:", data);

    // Create the category
    const category = await db.category.create({
      data: {
        catName: data.title,
      },
    });

    // console.log("Category created successfully:", category);
    return category;
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("catName")) {
      throw new Error("Category with this name already exists.");
    }

    console.error("Error creating category:", error);
    throw new Error("Failed to create the category. Please try again.");
  }
}

export async function getCategories({
  page = 1,
  limit = 15,
  search = "",
  sort = "latest",
}) {
  // console.log("search",search)
  try {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          catName: {
            contains: search, // Case-insensitive by default in MySQL with proper collation
          },
        }
      : {};

    // Fetch categories with pagination and search filter
    const categories = await db.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        id: sort === "latest" ? "desc" : "asc", // Sort by creation date
      },
    });

    // Get total count for pagination calculation
    const totalCount = await db.category.count({ where });

    return {
      categories: categories || [], // Ensure categories is never null
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw new Error("Failed to fetch categories. Please try again later.");
  }
}

export async function getCategories2() {
  // console.log("search",search)
  try {
    // Fetch categories with pagination and search filter
    const categories = await db.category.findMany();

    // Get total count for pagination calculation

    return {
      categories: categories || [], // Ensure categories is never null
    };
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw new Error("Failed to fetch categories. Please try again later.");
  }
}

export async function updateCategory(data) {
  try {
    const id = data.id;
    // Validate input
    if (!id || !data?.title || typeof data.title !== "string") {
      throw new Error("Invalid input. 'id' and valid 'title' are required.");
    }

    // Update the category
    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        catName: data.title,
      },
    });

    return updatedCategory;
  } catch (error) {
    // Handle unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("catName")) {
      throw new Error("Category with this name already exists.");
    }

    // Handle record not found error
    if (error.code === "P2025") {
      throw new Error("Category not found.");
    }

    console.error("Error updating category:", error);
    throw new Error("Failed to update the category. Please try again.");
  }
}

export async function toggleCategory(id) {
  try {
    const category = await db.category.findUnique({
      where: {
        id: id, // Find the category by its unique ID
      },
    });

    // Update the category
    const toggleData = await db.category.update({
      where: { id },
      data: {
        showHome: category.showHome == "active" ? "inactive" : "active",
      },
    });

    return toggleData;
  } catch (error) {
    // Handle unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("catName")) {
      throw new Error("Category with this name already exists.");
    }

    // Handle record not found error
    if (error.code === "P2025") {
      throw new Error("Category not found.");
    }

    console.error("Error updating category:", error);
    throw new Error("Failed to update the category. Please try again.");
  }
}

export async function deleteCategoryById(id) {
  console.log("id", id);
  if (!id) {
    throw new Error("Category ID is required");
  }

  // Delete the category by its unique ID
  const deletedCategory = await db.category.delete({
    where: {
      id: id, // Specify the recipe ID to delete
    },
  });

  return {
    success: true,
    deletedCategory,
  };
}
