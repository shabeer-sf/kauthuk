"use server";

import { db } from "@/lib/prisma";
import os from "os";
import fs from "fs/promises"; 
import path from "path";
import * as ftp from "basic-ftp";

const localTempDir = os.tmpdir();

export async function createTestimonial(data) {
  const ftpClient = new ftp.Client();
  ftpClient.ftp.verbose = true;

  try {
    console.log("Received testimonial data:", data);

    // Store testimonial details in the database first
    const testimonial = await db.testimonial.create({
      data: {
        name: data.name,
        location: data.location,
        description: data.description,
        rating: parseInt(data.rating),
        status: data.status
      },
    });

    if (data.image && data.image.length > 0) {
      const image = data.image[0];

      // Add current timestamp to the image filename
      const timestamp = Date.now();
      const newImageName = `testimonial_${timestamp}_${image.name}`;

      // Temporary save location on the server
      const tempImagePath = path.join(localTempDir, newImageName);

      // Convert ArrayBuffer to Buffer before writing to the file system
      const buffer = Buffer.from(await image.arrayBuffer());

      // Save the uploaded file temporarily
      await fs.writeFile(tempImagePath, buffer);

      console.log("Temporary testimonial image saved at:", tempImagePath);

      // Connect to FTP server
      await ftpClient.access({
        host: "ftp.greenglow.in",
        port: 21,
        user: "u737108297.kauthuktest",
        password: "Test_kauthuk#123",
      });

      console.log("Connected to FTP server");

      // Upload image to FTP server in the 'public_html/kauthuk_test' directory
      const remoteFilePath = `/kauthuk_test/${newImageName}`;
      await ftpClient.uploadFrom(tempImagePath, remoteFilePath);

      console.log("Testimonial image uploaded successfully to:", remoteFilePath);

      // Update testimonial entry with image path
      await db.testimonial.update({
        where: { id: testimonial.id },
        data: { image: newImageName },
      });

      console.log("Testimonial updated with image path");

      // Remove local temporary file
      await fs.unlink(tempImagePath);
    }

    return testimonial;
  } catch (error) {
    console.error("Error creating testimonial:", error);
    throw new Error("Failed to create the testimonial. Please try again.");
  } finally {
    ftpClient.close();
  }
}

export async function getOneTestimonial(id) {
  try {
    const testimonial = await db.testimonial.findUnique({
      where: {
        id: id,
      },
    });
    console.log("testimonial:", testimonial)

    if (!testimonial) {
      throw new Error("Failed to fetch the testimonial. Please try again.");
    }

    return testimonial;
  } catch (error) {
    throw new Error("Failed to fetch the testimonial. Please try again.");
  }
}

export async function deleteTestimonialById(id) {
  console.log("Deleting testimonial with id:", id);
  if (!id) {
    throw new Error("Testimonial ID is required");
  }

  const ftpClient = new ftp.Client();
  ftpClient.ftp.verbose = true;

  try {
    // Fetch the testimonial to check if it has an associated image
    const testimonial = await db.testimonial.findUnique({
      where: { id: id },
      select: { image: true },
    });

    if (!testimonial) {
      throw new Error("Testimonial not found");
    }

    if (testimonial.image) {
      await ftpClient.access({
        host: "ftp.greenglow.in",
        port: 21,
        user: "u737108297.kauthuktest",
        password: "Test_kauthuk#123",
      });

      console.log("Connected to FTP server");

      // Define remote image path
      const remoteFilePath = `/kauthuk_test/${testimonial.image}`;

      // Check if the file exists and delete it
      try {
        await ftpClient.remove(remoteFilePath);
        console.log("Testimonial image deleted from FTP:", remoteFilePath);
      } catch (ftpError) {
        console.warn(
          "Error deleting testimonial image or file not found:",
          ftpError.message
        );
      }
    }

    // Delete the testimonial from the database
    const deletedTestimonial = await db.testimonial.delete({
      where: { id: id },
    });

    return {
      success: true,
      deletedTestimonial,
    };
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    throw new Error("Failed to delete the testimonial. Please try again.");
  } finally {
    ftpClient.close();
  }
}

export async function getTestimonials({
  page = 1,
  limit = 9,
  search = "",
  sort = "newest",
  status = "all",
}) {
  try {
    const skip = (page - 1) * limit;

    // Build the where clause based on search and status filters
    let where = {};
    
    // Add search condition if provided
    if (search) {
      where = {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { location: { contains: search } }
        ]
      };
    }
    
    // Add status filter if not 'all'
    if (status && status !== 'all') {
      where.status = status;
    }

    // Determine sort order based on the sort parameter
    let orderBy = {};
    switch (sort) {
      case 'newest':
        orderBy = { id: 'desc' };
        break;
      case 'oldest':
        orderBy = { id: 'asc' };
        break;
      case 'rating_high':
        orderBy = { rating: 'desc' };
        break;
      case 'rating_low':
        orderBy = { rating: 'asc' };
        break;
      default:
        orderBy = { id: 'desc' }; // Default to newest
    }

    // Fetch testimonials with pagination, search filter, and sorting
    const testimonials = await db.testimonial.findMany({
      where,
      skip,
      take: limit,
      orderBy
    });

    // Get total count for pagination calculation
    const totalCount = await db.testimonial.count({ where });

    return {
      testimonials: testimonials || [],
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error fetching testimonials:", error.message);
    throw new Error("Failed to fetch testimonials. Please try again later.");
  }
}

export async function updateTestimonial(id, data) {
  const ftpClient = new ftp.Client();
  ftpClient.ftp.verbose = true;

  try {
    console.log("Received testimonial update data:", data);

    // Fetch the existing testimonial entry
    const existingTestimonial = await db.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      throw new Error("Testimonial not found");
    }

    // Prepare the update data
    const updateData = {
      name: data.name,
      location: data.location,
      description: data.description,
      rating: parseInt(data.rating),
      status: data.status
    };

    if (data.image && data.image.length > 0 && typeof(data.image) !== "string") {
      const image = data.image[0];

      // Add current timestamp to the new image filename
      const timestamp = Date.now();
      const newImageName = `testimonial_${timestamp}_${image.name}`;

      // Temporary save location on the server
      const tempImagePath = path.join(localTempDir, newImageName);

      // Convert ArrayBuffer to Buffer before writing to the file system
      const buffer = Buffer.from(await image.arrayBuffer());

      // Save the uploaded file temporarily
      await fs.writeFile(tempImagePath, buffer);

      console.log("Temporary testimonial image saved at:", tempImagePath);

      // Connect to the FTP server
      await ftpClient.access({
        host: "ftp.greenglow.in",
        port: 21,
        user: "u737108297.kauthuktest",
        password: "Test_kauthuk#123",
      });

      console.log("Connected to FTP server");

      // Upload new image to FTP server in the 'public_html/kauthuk_test' directory
      const remoteFilePath = `/kauthuk_test/${newImageName}`;
      await ftpClient.uploadFrom(tempImagePath, remoteFilePath);

      console.log("New testimonial image uploaded successfully to:", remoteFilePath);

      // Update image path in the update data
      updateData.image = newImageName;

      // Remove local temporary file
      await fs.unlink(tempImagePath);

      // Delete the old image from the FTP server if it exists
      if (existingTestimonial.image) {
        const oldRemoteFilePath = `/kauthuk_test/${existingTestimonial.image}`;
        try {
          await ftpClient.remove(oldRemoteFilePath);
          console.log("Old testimonial image removed from FTP server:", oldRemoteFilePath);
        } catch (err) {
          console.warn("Failed to remove old testimonial image from FTP server:", err);
        }
      }
    }

    // Update testimonial entry in the database
    const updatedTestimonial = await db.testimonial.update({
      where: { id },
      data: updateData,
    });

    console.log("Testimonial updated successfully:", updatedTestimonial);

    return updatedTestimonial;
  } catch (error) {
    console.error("Error updating testimonial:", error);
    throw new Error("Failed to update the testimonial. Please try again.");
  } finally {
    ftpClient.close();
  }
}

export async function updateTestimonialStatus(id, status) {
  try {
    console.log(`Updating testimonial status: ID ${id} to ${status}`);

    // Fetch the existing testimonial to make sure it exists
    const existingTestimonial = await db.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      throw new Error("Testimonial not found");
    }

    // Update status
    const updatedTestimonial = await db.testimonial.update({
      where: { id },
      data: { status },
    });

    console.log("Testimonial status updated successfully:", updatedTestimonial);

    return {
      success: true,
      testimonial: updatedTestimonial
    };
  } catch (error) {
    console.error("Error updating testimonial status:", error);
    throw new Error("Failed to update the testimonial status. Please try again.");
  }
}