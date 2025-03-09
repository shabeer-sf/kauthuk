"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";

/**
 * Get users with pagination, filtering and sorting
 */
export async function getUsers({ search = "", page = 1, limit = 15, sort = "latest", status = "all" }) {
  const skip = (page - 1) * limit;
  
  try {
    // Build the where clause for filtering
    const where = {};
    
    // Apply status filter if specified
    if (status !== "all") {
      where.status = status;
    }
    
    // Apply search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } }
      ];
    }
    
    // Determine the orderBy configuration based on sort parameter
    let orderBy = {};
    switch (sort) {
      case "latest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "most_orders":
        orderBy = { Orders: { _count: "desc" } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }
    
    // Execute the query with pagination
    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        mobile_verified: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            Orders: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });
    
    // Count total matching records for pagination
    const totalCount = await db.user.count({ where });
    
    // Format the response data to match the component's expected structure
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      mobileVerified: user.mobile_verified,
      status: user.status,
      createdAt: user.createdAt,
      ordersCount: user._count.Orders
    }));
    
    return {
      users: formattedUsers,
      totalUsers: totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

/**
 * Get a single user by ID with associated data
 */
export async function getUserById(id) {
  try {
    const user = await db.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        DeliveryAddresses: {
          include: {
            Country: true,
            States: true
          }
        },
        BillingAddresses: {
          include: {
            Country: true,
            States: true
          }
        },
        Orders: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            OrderProducts: true,
            ShippingDetail: true
          }
        },
        _count: {
          select: {
            Orders: true
          }
        }
      }
    });
    
    if (!user) {
      return {
        success: false,
        error: "User not found"
      };
    }
    
    // Format the response
    const formattedUser = {
      ...user,
      ordersCount: user._count.Orders
    };
    
    delete formattedUser._count;
    delete formattedUser.password; // Remove sensitive information
    
    return {
      success: true,
      user: formattedUser
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: "Failed to fetch user details"
    };
  }
}

/**
 * Create a new user
 */
export async function createUser(formData) {
  try {
    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const mobile = formData.get("mobile")?.trim();
    const mobile_verified = formData.get("mobile_verified") || "no";
    const status = formData.get("status") || "active";
    
    // Validate required fields
    if (!name || !email) {
      return {
        success: false,
        error: "Name and email are required"
      };
    }
    
    // Check if user with email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return {
        success: false,
        error: "Email is already in use"
      };
    }
    
    // If password is provided, validate and hash it
    let hashedPassword;
    if (password) {
      if (password !== confirmPassword) {
        return {
          success: false,
          error: "Passwords do not match"
        };
      }
      
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Generate a random password if none provided
      const randomPassword = Math.random().toString(36).slice(-8);
      hashedPassword = await bcrypt.hash(randomPassword, 10);
    }
    
    // Create the user
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mobile: mobile || undefined,
        mobile_verified,
        status
      }
    });
    
    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        status: newUser.status
      }
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: "Failed to create user"
    };
  }
}

/**
 * Update an existing user
 */
export async function updateUser(id, formData) {
  try {
    const userId = parseInt(id);
    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const mobile = formData.get("mobile")?.trim();
    const mobile_verified = formData.get("mobile_verified");
    const status = formData.get("status");
    
    // Validate required fields
    if (!name || !email) {
      return {
        success: false,
        error: "Name and email are required"
      };
    }
    
    // Check if email is already used by another user
    const existingUser = await db.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId
        }
      }
    });
    
    if (existingUser) {
      return {
        success: false,
        error: "Email is already in use by another user"
      };
    }
    
    // Prepare update data
    const updateData = {
      name,
      email,
      mobile: mobile || undefined
    };
    
    // Update status if provided
    if (status) {
      updateData.status = status;
    }
    
    // Update mobile verification status if provided
    if (mobile_verified) {
      updateData.mobile_verified = mobile_verified;
    }
    
    // If password is provided and confirmed, update it
    if (password && password === confirmPassword) {
      updateData.password = await bcrypt.hash(password, 10);
    } else if (password) {
      return {
        success: false,
        error: "Passwords do not match"
      };
    }
    
    // Update the user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData
    });
    
    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        status: updatedUser.status
      }
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: "Failed to update user"
    };
  }
}

/**
 * Update user status (activate/deactivate)
 */
export async function updateUserStatus(id, status) {
  try {
    const userId = parseInt(id);
    
    // Validate status value
    if (status !== "active" && status !== "inactive") {
      return {
        success: false,
        error: "Invalid status value"
      };
    }
    
    // Update the user status
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { status }
    });
    
    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        status: updatedUser.status
      }
    };
  } catch (error) {
    console.error("Error updating user status:", error);
    return {
      success: false,
      error: "Failed to update user status"
    };
  }
}

/**
 * Delete a user by ID
 */
export async function deleteUserById(id) {
  try {
    const userId = parseInt(id);
    
    // Delete the user
    await db.user.delete({
      where: { id: userId }
    });
    
    return {
      success: true,
      message: "User deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user. The user may have associated data that prevents deletion."
    };
  }
}

/**
 * Get user statistics for dashboard
 */
export async function getUserStats() {
  try {
    // Get total counts
    const totalUsers = await db.user.count();
    const activeUsers = await db.user.count({
      where: { status: "active" }
    });
    const inactiveUsers = await db.user.count({
      where: { status: "inactive" }
    });
    
    // Get new users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await db.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    // Get users with orders
    const usersWithOrders = await db.user.count({
      where: {
        Orders: {
          some: {}
        }
      }
    });
    
    return {
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsers,
        usersWithOrders,
        usersWithoutOrders: totalUsers - usersWithOrders
      }
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      success: false,
      error: "Failed to fetch user statistics"
    };
  }
}