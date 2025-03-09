"use server";

import { db } from "@/lib/prisma";
import { cache } from "react";

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
    
    return { categories };
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
    
    return { featuredCategories: categories };
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
  if (!query || query.trim() === '') {
    return { products: [] };
  }

  try {
    const products = await db.product.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                title: {
                  contains: query,
                }
              },
              {
                description: {
                  contains: query,
                }
              },
              {
                meta_keywords: {
                  contains: query,
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
      take: limit,
    });

    // Transform the data for frontend use
    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description.substring(0, 100) + (product.description.length > 100 ? '...' : ''),
      price: Number(product.price_rupees),
      priceDollars: Number(product.price_dollars),
      inStock: product.stock_status === 'yes',
      thumbnail: product.ProductImages[0]?.image_path || null
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
  // For now, we'll return a mock value
  return { count: userId ? 3 : 0 };
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

    return { success: true, categories };
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

    return { success: true, categories };
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

    const subcategories = await db.subCategory.findMany({
      where: {
        cat_id: parseInt(categoryId)
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

    return { success: true, subcategories };
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return { success: false, error: "Failed to fetch subcategories" };
  }
}