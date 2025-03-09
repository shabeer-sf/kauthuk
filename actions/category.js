"use server";

import { db } from "@/lib/prisma";
import { cache } from "react";

export async function createCategory(data) {
  try {
    if (!data || !data.title) {
      throw new Error("Category title is required");
    }

    // Create the category
    const category = await db.category.create({
      data: {
        catName: data.title.trim(),
      },
    });

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
} = {}) {
  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = ((isNaN(pageNum) ? 1 : pageNum) - 1) * (isNaN(limitNum) ? 15 : limitNum);

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
      take: isNaN(limitNum) ? 15 : limitNum,
      orderBy: {
        id: sort === "latest" ? "desc" : "asc", // Sort by creation date
      },
    });

    // Get total count for pagination calculation
    const totalCount = await db.category.count({ where });

    return {
      categories: categories || [], // Ensure categories is never null
      totalPages: Math.ceil(totalCount / (isNaN(limitNum) ? 15 : limitNum)),
    };
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw new Error("Failed to fetch categories. Please try again later.");
  }
}

export async function getCategories2() {
  try {
    // Fetch all categories without pagination or filtering
    const categories = await db.category.findMany();

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
    if (!data || !data.id || !data.title || typeof data.title !== "string") {
      throw new Error("Invalid input. 'id' and valid 'title' are required.");
    }

    const id = parseInt(data.id);
    if (isNaN(id)) {
      throw new Error("Invalid category ID format.");
    }

    // Update the category
    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        catName: data.title.trim(),
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
    if (!id) {
      throw new Error("Category ID is required");
    }

    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      throw new Error("Invalid category ID format");
    }

    const category = await db.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // Update the category status
    const toggleData = await db.category.update({
      where: { id: categoryId },
      data: {
        showHome: category.showHome === "active" ? "inactive" : "active",
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
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }

    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      throw new Error("Invalid category ID format");
    }

    // Check if there are any subcategories linked to this category
    const subcategoryCount = await db.subCategory.count({
      where: {
        cat_id: categoryId,
      },
    });

    if (subcategoryCount > 0) {
      throw new Error("Cannot delete category with existing subcategories. Please delete subcategories first.");
    }

    // Delete the category by its unique ID
    const deletedCategory = await db.category.delete({
      where: {
        id: categoryId,
      },
    });

    return {
      success: true,
      deletedCategory,
    };
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("Category not found.");
    }
    
    if (error.message.includes("Cannot delete category with existing subcategories")) {
      throw error;
    }
    
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete the category. Please try again.");
  }
}

/**
 * Fetch all categories with their subcategories
 * This function is cached to improve performance
 */
export const getCategories3 = cache(async () => {
  try {
    const categories = await db.category.findMany({
      where: { 
        showHome: 'active' 
      },
      include: {
        SubCategory: true
      },
      orderBy: {
        catName: 'asc'
      }
    });
    
    return { categories: categories || [] };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { categories: [] };
  }
});

/**
 * Fetch featured categories for the mega menu
 * Limited to 4 categories for display purposes
 */
export const getFeaturedCategories = cache(async () => {
  try {
    const categories = await db.category.findMany({
      where: { 
        showHome: 'active' 
      },
      take: 4,
      orderBy: {
        id: 'desc' // Get the most recently added categories
      }
    });
    
    return { featuredCategories: categories || [] };
  } catch (error) {
    console.error("Error fetching featured categories:", error);
    return { featuredCategories: [] };
  }
});

/**
 * Search products based on query
 * @param {string} query - Search term
 * @param {number} limit - Number of results to return
 */
export async function searchProducts(query, limit = 5) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return { products: [] };
  }

  try {
    const limitNum = parseInt(limit);
    const take = isNaN(limitNum) || limitNum <= 0 ? 5 : limitNum;
    
    const products = await db.product.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                title: {
                  contains: query.trim(),
                }
              },
              {
                description: {
                  contains: query.trim(),
                }
              },
              {
                meta_keywords: {
                  contains: query.trim(),
                }
              }
            ]
          },
          {
            status: 'active'
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        price_rupees: true,
        price_dollars: true,
        stock_status: true,
        ProductImages: {
          where: {
            is_thumbnail: true
          },
          take: 1
        }
      },
      take: take,
    });

    // Transform the data for frontend use
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title || 'Untitled Product',
      description: product.description 
        ? (product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')) 
        : '',
      price: Number(product.price_rupees || 0),
      priceDollars: Number(product.price_dollars || 0),
      inStock: product.stock_status === 'yes',
      thumbnail: product.ProductImages && product.ProductImages.length > 0 
        ? product.ProductImages[0]?.image_path 
        : null
    }));

    return { products: formattedProducts };
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [] };
  }
}

/**
 * Get popular search terms based on recent searches or predefined keywords
 */
export async function getPopularSearchTerms() {
  // This could be replaced with actual analytics data in the future
  const popularTerms = [
    "eco friendly",
    "bamboo",
    "organic",
    "handmade",
    "sustainable",
    "natural",
    "recycled",
    "plastic free"
  ];
  
  return { popularTerms };
}

/**
 * Get account notification count
 * For a logged-in user, this would show unread notifications
 * @param {number} userId - Optional user ID for authenticated users
 */
export async function getNotificationCount(userId = null) {
  // In a real implementation, you would fetch this from a notifications table
  try {
    if (userId) {
      const userIdNum = parseInt(userId);
      if (!isNaN(userIdNum)) {
        // Here you would check if the user exists and get their notifications
        // For now, just return a mock value
        return { count: 3 };
      }
    }
    
    return { count: 0 };
  } catch (error) {
    console.error("Error getting notification count:", error);
    return { count: 0 };
  }
}

/**
 * Get current user data if logged in
 * Uses the user's session to retrieve data
 */
export async function getCurrentUser() {
  // This would typically use your auth provider like NextAuth.js
  // For demonstration purposes, we'll return null to indicate no user is logged in
  return { user: null };
}

/**
 * Get all site announcements for the announcement bar
 */
export async function getAnnouncements() {
  // This could be fetched from a database table in the future
  const announcements = [
    "🌿 Kauthuk is a venture \"Connecting Technology, Art and the Artisan\" for clean and green living",
    "⭐ Free shipping on orders over ₹999",
    "🎁 Use code WELCOME10 for 10% off your first order",
    "♻️ Sustainable and eco-friendly products for a better tomorrow"
  ];
  
  return { announcements };
}

export async function getAllCategories() {
  try {
    const categories = await db.category.findMany({
      select: {
        id: true,
        catName: true,
        showHome: true,
        _count: {
          select: {
            SubCategory: true
          }
        }
      },
      orderBy: {
        catName: 'asc'
      }
    });

    return { success: true, categories: categories || [] };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Get categories for display on home page
export async function getHomeCategories() {
  try {
    const categories = await db.category.findMany({
      where: {
        showHome: 'active'
      },
      select: {
        id: true,
        catName: true,
        SubCategory: {
          select: {
            id: true,
            subcategory: true,
            _count: {
              select: {
                Product: true
              }
            }
          },
          take: 5 // Limit subcategories
        }
      },
      take: 6 // Limit to 6 categories for home page
    });

    return { success: true, categories: categories || [] };
  } catch (error) {
    console.error("Error fetching home categories:", error);
    return { success: false, error: "Failed to fetch home categories" };
  }
}

// Get subcategories for a specific category
export async function getSubcategories(categoryId) {
  try {
    if (!categoryId) {
      return { success: false, error: "Category ID is required" };
    }

    const catId = parseInt(categoryId);
    if (isNaN(catId)) {
      return { success: false, error: "Invalid category ID format" };
    }

    const subcategories = await db.subCategory.findMany({
      where: {
        cat_id: catId
      },
      select: {
        id: true,
        subcategory: true,
        _count: {
          select: {
            Product: true
          }
        }
      },
      orderBy: {
        subcategory: 'asc'
      }
    });

    return { success: true, subcategories: subcategories || [] };
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return { success: false, error: "Failed to fetch subcategories" };
  }
}