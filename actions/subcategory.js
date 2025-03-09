"use server";

import { db } from "@/lib/prisma";

export async function createSubcategory(data) {
  try {
    console.log("Received data:", data);

    // Create the subcategory
    const subcategory = await db.SubCategory.create({
      data: {
        cat_id: data.cat_id,
        subcategory: data.title,
      },
    });

    // console.log("Subcategory created successfully:", subcategory);
    return subcategory;
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("subcategory")) {
      throw new Error("Subcategory with this name already exists.");
    }

    console.log("Error creating subcategory:", error);
    throw error;
    // throw new Error("Failed to create the subcategory. Please try again.");
  }
}

export async function getSubcategories({
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
          subcategory: {
            contains: search, // Case-insensitive by default in MySQL with proper collation
          },
        }
      : {};

    // Fetch subcategories with pagination and search filter
    const subcategories = await db.SubCategory.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        id: sort === "latest" ? "desc" : "asc", // Sort by creation date
      },
      include: {
        Category: {
          select: {
            catName: true,
          },
        },
      },
    });
    // console.log("subcategories",subcategories)

    // Get total count for pagination calculation
    const totalCount = await db.SubCategory.count({ where });

    return {
      subcategories: subcategories || [], // Ensure subcategories is never null
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error fetching subcategories:", error.message);
    throw new Error("Failed to fetch subcategories. Please try again later.");
  }
}
export async function getSubcategories2(cat_id) {
  try {
    // Fetch categories with pagination and search filter
    const subcategories = await db.SubCategory.findMany(
      {
        where: {
          cat_id:cat_id
        }
      }
    );

    // Get total count for pagination calculation

    return {
      subcategories: subcategories || [], // Ensure subcategories is never null
    };
  } catch (error) {
    console.error("Error fetching subcategories:", error.message);
    throw new Error("Failed to fetch subcategories. Please try again later.");
  }  
}

export async function updateSubcategory(data) {
  try {
    const id = data.id;
    // Validate input
    if (!id || !data?.title || typeof data.title !== "string") {
      throw new Error("Invalid input. 'id' and valid 'title' are required.");
    }

    // Update the subcategory
    const updatedSubcategory = await db.SubCategory.update({
      where: { id },
      data: {
        subcategory: data.title,
        cat_id: data.cat_id,
      },
    });

    return updatedSubcategory;
  } catch (error) {
    // Handle unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("subcategory")) {
      throw new Error("Subcategory with this name already exists.");
    }

    // Handle record not found error
    if (error.code === "P2025") {
      throw new Error("Subcategory not found.");
    }

    console.error("Error updating subcategory:", error);
    throw new Error("Failed to update the subcategory. Please try again.");
  }
}



export async function deleteSubcategoryById(id) {
  console.log("id", id);
  if (!id) {
    throw new Error("Subcategory ID is required");
  }

  // Delete the subcategory by its unique ID
  const deletedSubcategory = await db.SubCategory.delete({
    where: {
      id: id, // Specify the recipe ID to delete
    },
  });

  return {
    success: true,
    deletedSubcategory,
  };
}
