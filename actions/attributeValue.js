"use server";

import { db } from "@/lib/prisma";

export async function createAttributeValue(data) {
  try {
    console.log("Received data:", data);

    // Create the attributeValue
    const attributeValue = await db.attributeValue.create({
      data: {
        attribute_id: data.attribute_id,
        value: data.value,
      },
    });

    // console.log("AttributeValue created successfully:", attributeValue);
    return attributeValue;
  } catch (error) {
    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("attributeValue")
    ) {
      throw new Error("AttributeValue with this name already exists.");
    }

    console.log("Error creating attributeValue:", error);
    throw error;
    // throw new Error("Failed to create the attributeValue. Please try again.");
  }
}

export async function getAttributeValues({
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
          value: {
            contains: search, // Case-insensitive by default in MySQL with proper collation
          },
        }
      : {};

    // Fetch attributeValues with pagination and search filter
    const attributeValues = await db.attributeValue.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        id: sort === "latest" ? "desc" : "asc", // Sort by creation date
      },
      include: {
        attribute: {
          select: {
            name: true,
          },
        },
      },
    });
    // console.log("attributeValues",attributeValues)

    // Get total count for pagination calculation
    const totalCount = await db.attributeValue.count({ where });

    return {
      attributeValues: attributeValues || [], // Ensure attributeValues is never null
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error fetching attribute Values:", error.message);
    throw new Error(
      "Failed to fetch attribute Values. Please try again later."
    );
  }
}

export async function updateAttributeValue(data) {
  try {
    const id = data.id;
    // Validate input
    if (!id || !data?.value || typeof data.value !== "string") {
      throw new Error("Invalid input. 'id' and valid 'value' are required.");
    }

    // Update the attributeValue
    const updatedAttributeValue = await db.attributeValue.update({
      where: { id },
      data: {
        value: data.value,
        attribute_id: data.attribute_id,
      },
    });

    return updatedAttributeValue;
  } catch (error) {
    // Handle unique constraint error
    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("attributeValue")
    ) {
      throw new Error("AttributeValue with this name already exists.");
    }

    // Handle record not found error
    if (error.code === "P2025") {
      throw new Error("AttributeValue not found.");
    }

    console.error("Error updating attributeValue:", error);
    throw new Error("Failed to update the attributeValue. Please try again.");
  }
}

// export async function toggleAttributeValue(id) {
//   try {
//     console.log(id)
//     const attributeValue = await db.attributeValue.findUnique({
//       where: {
//         id: id, // Find the attributeValue by its unique ID
//       },
//     });

//     // Update the attributeValue
//     const toggleData = await db.attributeValue.update({
//       where: { id },
//       data: {
//         showHome: attributeValue.showHome == "active" ? "inactive" : "active",
//       },
//     });

//     return toggleData;
//   } catch (error) {
//     // Handle unique constraint error
//     if (error.code === "P2002" && error.meta?.target?.includes("attributeValue")) {
//       throw new Error("AttributeValue with this name already exists.");
//     }

//     // Handle record not found error
//     if (error.code === "P2025") {
//       throw new Error("AttributeValue not found.");
//     }

//     console.error("Error updating attributeValue:", error);
//     throw new Error("Failed to update the attributeValue. Please try again.");
//   }
// }

export async function deleteAttributeValueById(id) {
  console.log("id", id);
  if (!id) {
    throw new Error("AttributeValue ID is required");
  }

  // Delete the attributeValue by its unique ID
  const deletedAttributeValue = await db.attributeValue.delete({
    where: {
      id: id, // Specify the recipe ID to delete
    },
  });

  return {
    success: true,
    deletedAttributeValue,
  };
}
