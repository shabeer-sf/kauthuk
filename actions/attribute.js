"use server";

import { db } from "@/lib/prisma";

export async function createAttribute(data) {
  try {
    // console.log("Received data:", data);

    // Create the attribute
    const attribute = await db.attribute.create({
      data: {
        name: data.title,
      },
    });

    // console.log("Attribute created successfully:", attribute);
    return attribute;
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      throw new Error("Attribute with this name already exists.");
    }

    console.error("Error creating attribute:", error);
    throw new Error("Failed to create the attribute. Please try again.");
  }
}

export async function getAttributes({
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
          name: {
            contains: search, // Case-insensitive by default in MySQL with proper collation
          },
        }
      : {};

    // Fetch attributes with pagination and search filter
    const attributes = await db.attribute.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        id: sort === "latest" ? "desc" : "asc", // Sort by creation date
      },
    });

    // Get total count for pagination calculation
    const totalCount = await db.attribute.count({ where });

    return {
      attributes: attributes || [], // Ensure attributes is never null
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error fetching attributes:", error.message);
    throw new Error("Failed to fetch attributes. Please try again later.");
  }
}

export async function getAttributes2() {
  // console.log("search",search)
  try {
    // Fetch attributes with pagination and search filter
    const attributes = await db.attribute.findMany();

    // Get total count for pagination calculation

    return {
      attributes: attributes || [], // Ensure attributes is never null
    };
  } catch (error) {
    console.error("Error fetching attributes:", error.message);
    throw new Error("Failed to fetch attributes. Please try again later.");
  }
}

export async function updateAttribute(data) {
  try {
    const id = data.id;
    // Validate input
    if (!id || !data?.title || typeof data.title !== "string") {
      throw new Error("Invalid input. 'id' and valid 'title' are required.");
    }

    // Update the attribute
    const updatedAttribute = await db.attribute.update({
      where: { id },
      data: {
        name: data.title,
      },
    });

    return updatedAttribute;
  } catch (error) {
    // Handle unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      throw new Error("Attribute with this name already exists.");
    }

    // Handle record not found error
    if (error.code === "P2025") {
      throw new Error("Attribute not found.");
    }

    console.error("Error updating attribute:", error);
    throw new Error("Failed to update the attribute. Please try again.");
  }
}

export async function toggleAttribute(id) {
  try {
    const attribute = await db.attribute.findUnique({
      where: {
        id: id, // Find the attribute by its unique ID
      },
    });

    // Update the attribute
    const toggleData = await db.attribute.update({
      where: { id },
      data: {
        showHome: attribute.showHome == "active" ? "inactive" : "active",
      },
    });

    return toggleData;
  } catch (error) {
    // Handle unique constraint error
    if (error.code === "P2002" && error.meta?.target?.includes("name")) {
      throw new Error("Attribute with this name already exists.");
    }

    // Handle record not found error
    if (error.code === "P2025") {
      throw new Error("Attribute not found.");
    }

    console.error("Error updating attribute:", error);
    throw new Error("Failed to update the attribute. Please try again.");
  }
}

export async function deleteAttributeById(id) {
  console.log("id", id);
  if (!id) {
    throw new Error("Attribute ID is required");
  }

  // Delete the attribute by its unique ID
  const deletedAttribute = await db.attribute.delete({
    where: {
      id: id, // Specify the recipe ID to delete
    },
  });

  return {
    success: true,
    deletedAttribute,
  };
}
