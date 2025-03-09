"use server"
const { db } = require("@/lib/prisma");

// You'll need to create this file for product-related actions
export const getTestimonials = async () => {
  // This is a mock function assuming you'll create the actual server action
  try {
    const testimonials = await db.testimonial.findMany({
      where: {
        status: 'active'
      },
      orderBy: {
        id: 'desc'
      },
      take: 5
    });
    return testimonials;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
};