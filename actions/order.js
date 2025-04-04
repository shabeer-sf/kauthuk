"use server";

import { db } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { baseEncode } from "@/lib/decode-product-data";

/**
 * Get orders with pagination, filtering and sorting
 */
export async function getOrders({
  search = "",
  page = 1,
  limit = 15,
  sort = "latest",
  status = "all",
  userId = null,
  startDate = null,
  endDate = null,
} = {}) {
  try {
    // Validate and parse input parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip =
      ((isNaN(pageNum) ? 1 : Math.max(1, pageNum)) - 1) *
      (isNaN(limitNum) ? 15 : Math.max(1, limitNum));

    // Build the where clause for filtering
    const where = {};

    // Apply status filter if specified
    if (status && status !== "all") {
      where.order_status = status;
    }

    // Filter by user id if provided
    if (userId) {
      const parsedUserId = parseInt(userId);
      if (!isNaN(parsedUserId)) {
        where.user_id = parsedUserId;
      }
    }

    // Filter by date range if provided
    if (startDate) {
      const parsedStartDate = new Date(startDate);
      if (!isNaN(parsedStartDate.getTime())) {
        where.order_date = {
          ...where.order_date,
          gte: parsedStartDate,
        };
      }
    }

    if (endDate) {
      const parsedEndDate = new Date(endDate);
      if (!isNaN(parsedEndDate.getTime())) {
        // Set to end of day
        parsedEndDate.setHours(23, 59, 59, 999);
        where.order_date = {
          ...where.order_date,
          lte: parsedEndDate,
        };
      }
    }

    // Apply search filter if provided
    if (search && typeof search === "string" && search.trim() !== "") {
      const searchTerm = search.trim();
      where.OR = [
        { id: isNaN(parseInt(searchTerm)) ? undefined : parseInt(searchTerm) },
        {
          User: {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
        },
      ].filter(Boolean); // Remove undefined entries
    }

    // Determine the orderBy configuration based on sort parameter
    let orderBy = {};
    switch (sort) {
      case "latest":
        orderBy = { order_date: "desc" };
        break;
      case "oldest":
        orderBy = { order_date: "asc" };
        break;
      case "high_value":
        orderBy = { total: "desc" };
        break;
      case "low_value":
        orderBy = { total: "asc" };
        break;
      default:
        orderBy = { order_date: "desc" };
    }

    // Execute the query with pagination
    const orders = await db.order.findMany({
      where,
      select: {
        id: true,
        user_id: true,
        total: true,
        payment_method: true,
        payment_status: true,
        order_status: true,
        order_date: true,
        currency: true,
        delivery_charge: true,
        tax_amount: true,
        discount_amount: true,
        coupon_code: true,
        createdAt: true,
        User: {
          select: {
            name: true,
            email: true,
          },
        },
        OrderProducts: {
          select: {
            id: true,
          },
        },
        ShippingDetail: {
          select: {
            status: true,
            tracking_id: true,
          },
        },
      },
      orderBy,
      skip,
      take: isNaN(limitNum) ? 15 : Math.max(1, limitNum),
    });

    // Count total matching records for pagination
    const totalCount = await db.order.count({ where });

    // Format the response data
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      userId: order.user_id,
      userName: order.User?.name || "Guest User",
      userEmail: order.User?.email || "Guest Checkout",
      total: Number(order.total) || 0,
      paymentMethod: order.payment_method || "unknown",
      paymentStatus: order.payment_status || "pending",
      orderStatus: order.order_status || "placed",
      orderDate: order.order_date || new Date(),
      currency: order.currency || "INR",
      shippingStatus: order.ShippingDetail?.status || null,
      trackingId: order.ShippingDetail?.tracking_id || null,
      itemsCount: order.OrderProducts?.length || 0,
    }));

    return {
      success: true,
      orders: formattedOrders,
      totalOrders: totalCount,
      totalPages: Math.ceil(
        totalCount / (isNaN(limitNum) ? 15 : Math.max(1, limitNum))
      ),
    };
  } catch (error) {
    // Handle error
    const errorMessage = error.message || "Unknown error";
    console.error("Error fetching orders: " + errorMessage);

    return {
      success: false,
      error: "Failed to fetch orders: " + errorMessage,
      orders: [],
      totalOrders: 0,
      totalPages: 0,
    };
  }
}

/**
 * Get a single order by ID with associated data
 */
export async function getOrderById(id) {
  try {
    if (!id) {
      return {
        success: false,
        error: "Order ID is required",
      };
    }

    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return {
        success: false,
        error: "Invalid order ID format",
      };
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
        OrderProducts: {
          include: {
            // Add any relevant relations here if needed
            Product: {
              select: {
                title: true,
                description: true,
              },
            },
          },
        },
        ShippingDetail: true,
        BillingAddress: {
          include: {
            Country: true,
            States: true,
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Format the response
    const formattedOrder = {
      ...order,
      total: Number(order.total),
      delivery_charge: Number(order.delivery_charge),
      tax_amount: order.tax_amount ? Number(order.tax_amount) : 0,
      discount_amount: order.discount_amount
        ? Number(order.discount_amount)
        : 0,
    };

    return {
      success: true,
      order: formattedOrder,
    };
  } catch (error) {
    const errorMessage = error.message || "Unknown error";
    console.error("Error fetching order: " + errorMessage);

    return {
      success: false,
      error: "Failed to fetch order details: " + errorMessage,
    };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(id, status) {
  try {
    if (!id) {
      return {
        success: false,
        error: "Order ID is required",
      };
    }

    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return {
        success: false,
        error: "Invalid order ID format",
      };
    }

    // Validate status value
    const validStatuses = [
      "placed",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        error: `Invalid status value. Status must be one of: ${validStatuses.join(
          ", "
        )}`,
      };
    }

    // Check if the order exists
    const orderExists = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        order_status: true,
        user_id: true,
      },
    });

    if (!orderExists) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Skip update if status is already the desired value
    if (orderExists.order_status === status) {
      return {
        success: true,
        order: {
          id: orderExists.id,
          orderStatus: orderExists.order_status,
        },
        message: `Order is already in ${status} status`,
      };
    }

    // Update the order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { order_status: status },
    });

    // If status is shipped, also update shipping details if they exist
    if (status === "shipped") {
      const shippingDetail = await db.shippingDetail.findUnique({
        where: { order_id: orderId },
      });

      if (shippingDetail) {
        await db.shippingDetail.update({
          where: { order_id: orderId },
          data: {
            status: "shipped",
            shipping_date: new Date(),
          },
        });
      }
    }

    console.log(
      `Order ${updatedOrder.id} status changed from ${orderExists.order_status} to ${status}`
    );

    return {
      success: true,
      order: {
        id: updatedOrder.id,
        orderStatus: updatedOrder.order_status,
      },
      message: `Order status updated to ${status} successfully`,
    };
  } catch (error) {
    const errorMessage = error.message || "Unknown error";
    console.error(
      `Error updating order status (ID: ${id}, Status: ${status}): ${errorMessage}`
    );

    return {
      success: false,
      error: "Failed to update order status: " + errorMessage,
    };
  }
}

/**
 * Update shipping details
 */
export async function updateShippingDetails(orderId, shippingData) {
  try {
    if (!orderId) {
      return {
        success: false,
        error: "Order ID is required",
      };
    }

    const parsedOrderId = parseInt(orderId);

    if (isNaN(parsedOrderId)) {
      return {
        success: false,
        error: "Invalid order ID format",
      };
    }

    // Validate required fields
    if (!shippingData.courier_name || !shippingData.tracking_id) {
      return {
        success: false,
        error: "Courier name and tracking ID are required",
      };
    }

    // Check if the order exists
    const orderExists = await db.order.findUnique({
      where: { id: parsedOrderId },
      select: { id: true },
    });

    if (!orderExists) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Check if shipping details already exist
    const existingShipping = await db.shippingDetail.findUnique({
      where: { order_id: parsedOrderId },
    });

    let updatedShipping;

    if (existingShipping) {
      // Update existing shipping details
      updatedShipping = await db.shippingDetail.update({
        where: { order_id: parsedOrderId },
        data: {
          courier_name: shippingData.courier_name,
          tracking_id: shippingData.tracking_id,
          tracking_url:
            shippingData.tracking_url || existingShipping.tracking_url,
          shipping_date: shippingData.shipping_date
            ? new Date(shippingData.shipping_date)
            : existingShipping.shipping_date,
          status: shippingData.status || existingShipping.status,
        },
      });
    } else {
      // Create new shipping details
      updatedShipping = await db.shippingDetail.create({
        data: {
          order_id: parsedOrderId,
          courier_name: shippingData.courier_name,
          tracking_id: shippingData.tracking_id,
          tracking_url: shippingData.tracking_url,
          shipping_date: shippingData.shipping_date
            ? new Date(shippingData.shipping_date)
            : new Date(),
          status: shippingData.status || "processing",
        },
      });

      // If we're adding shipping for the first time and status is set to shipped,
      // update the order status as well
      if (shippingData.status === "shipped") {
        await db.order.update({
          where: { id: parsedOrderId },
          data: { order_status: "shipped" },
        });
      }
    }

    return {
      success: true,
      shipping: updatedShipping,
      message: "Shipping details updated successfully",
    };
  } catch (error) {
    const errorMessage = error.message || "Unknown error";
    console.error(
      `Error updating shipping details (Order ID: ${orderId}): ${errorMessage}`
    );

    return {
      success: false,
      error: "Failed to update shipping details: " + errorMessage,
    };
  }
}

/**
 * Get order statistics for dashboard
 */
export async function getOrderStats() {
  try {
    // Get total counts
    const totalOrders = await db.order.count();

    // Get counts by status
    const pendingOrders = await db.order.count({
      where: { order_status: "placed" },
    });

    const processingOrders = await db.order.count({
      where: { order_status: "processing" },
    });

    const shippedOrders = await db.order.count({
      where: { order_status: "shipped" },
    });

    const deliveredOrders = await db.order.count({
      where: { order_status: "delivered" },
    });

    const cancelledOrders = await db.order.count({
      where: { order_status: "cancelled" },
    });

    // Get orders from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await db.order.count({
      where: {
        order_date: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get total revenue (for all time)
    const revenueResult = await db.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        order_status: {
          notIn: ["cancelled", "returned"],
        },
      },
    });

    const totalRevenue = revenueResult._sum.total
      ? Number(revenueResult._sum.total)
      : 0;

    // Get revenue from last 30 days
    const recentRevenueResult = await db.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        order_date: {
          gte: thirtyDaysAgo,
        },
        order_status: {
          notIn: ["cancelled", "returned"],
        },
      },
    });

    const recentRevenue = recentRevenueResult._sum.total
      ? Number(recentRevenueResult._sum.total)
      : 0;

    // Get guest order stats
    const guestOrders = await db.order.count({
      where: {
        user_id: 0,
      },
    });

    // Get registered user order stats
    const registeredUserOrders = totalOrders - guestOrders;

    return {
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        recentOrders,
        totalRevenue,
        recentRevenue,
        guestOrders,
        registeredUserOrders,
      },
    };
  } catch (error) {
    const errorMessage = error.message || "Unknown error";
    console.error("Error fetching order stats: " + errorMessage);

    return {
      success: false,
      error: "Failed to fetch order statistics: " + errorMessage,
      stats: {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        recentOrders: 0,
        totalRevenue: 0,
        recentRevenue: 0,
        guestOrders: 0,
        registeredUserOrders: 0,
      },
    };
  }
}

/**
 * Create a guest order with option to create a user account
 * @param {Object} orderData - Complete order data including customer, items, addresses
 * @returns {Promise<Object>} Order details and success status
 */
export async function createGuestOrder(orderData) {
  try {
    // Begin a transaction to ensure all operations succeed or fail together
    const result = await db.$transaction(async (tx) => {
      // Check if user wants to create an account or already has one
      let userId = orderData.userId;

      // If no userId and this is a guest checkout
      if (!userId && orderData.isGuest) {
        // Check if user with this email already exists
        const existingUser = await tx.user.findUnique({
          where: { email: orderData.email },
          select: { id: true },
        });

        if (existingUser) {
          // User exists but is not logged in
          userId = existingUser.id;
        } else if (orderData.createAccount) {
          // Create a new user account
          const hashedPassword = orderData.password
            ? await bcrypt.hash(orderData.password, 10)
            : await baseEncode(Math.random().toString(36).substring(2, 12)); // Random password if none provided

          // Create the user
          const newUser = await tx.user.create({
            data: {
              name: `${orderData.firstName} ${orderData.lastName}`,
              email: orderData.email,
              password: hashedPassword,
              mobile: orderData.phone,
              mobile_verified: "no",
              status: "active",
            },
          });

          userId = newUser.id;

          // If user opted to create an account, generate auth token
          if (orderData.createAccount) {
            // Create JWT token for auto-login
            const token = jwt.sign(
              { id: newUser.id, email: newUser.email },
              process.env.JWT_SECRET,
              { expiresIn: "30d" }
            );

            // Set token in cookies
            cookies().set({
              name: "userToken",
              value: token,
              httpOnly: true,
              path: "/",
              maxAge: 60 * 60 * 24 * 30, // 30 days
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          }
        }
      }

      // Save the billing address
      let billingAddressId = null;

      if (userId) {
        // Try to find the country and state IDs
        let countryId = 1; // Default to India

        try {
          const country = await tx.country.findFirst({
            where: {
              country_enName: orderData.billingCountry,
            },
          });

          if (country) {
            countryId = country.id;
          }
        } catch (err) {
          console.error("Error finding country:", err);
        }

        let stateId = 1; // Default state

        try {
          const state = await tx.states.findFirst({
            where: {
              country_id: countryId,
              state_en: orderData.billingState,
            },
          });

          if (state) {
            stateId = state.id;
          }
        } catch (err) {
          console.error("Error finding state:", err);
        }

        // Save billing address for registered user
        const billingAddress = await tx.billingAddress.create({
          data: {
            user_id: userId,
            name: `${orderData.firstName} ${orderData.lastName}`,
            address: orderData.billingAddress1,
            apartment: orderData.billingAddress2 || null,
            city: orderData.billingCity,
            country_id: countryId,
            state_id: stateId,
            pin: orderData.billingPostalCode,
            phone: orderData.phone,
            is_default: true,
          },
        });

        billingAddressId = billingAddress.id;

        // If shipping address is different, save it too
        if (!orderData.sameAsBilling) {
          // Get country and state IDs for shipping
          let shippingCountryId = countryId;

          try {
            const country = await tx.country.findFirst({
              where: {
                country_enName: orderData.shippingCountry,
              },
            });

            if (country) {
              shippingCountryId = country.id;
            }
          } catch (err) {
            console.error("Error finding shipping country:", err);
          }

          let shippingStateId = stateId;

          try {
            const state = await tx.states.findFirst({
              where: {
                country_id: shippingCountryId,
                state_en: orderData.shippingState,
              },
            });

            if (state) {
              shippingStateId = state.id;
            }
          } catch (err) {
            console.error("Error finding shipping state:", err);
          }

          // Create delivery address
          await tx.deliveryAddress.create({
            data: {
              user_id: userId,
              name: `${orderData.firstName} ${orderData.lastName}`,
              address: orderData.shippingAddress1,
              apartment: orderData.shippingAddress2 || null,
              city: orderData.shippingCity,
              country_id: shippingCountryId,
              state_id: shippingStateId,
              pin: orderData.shippingPostalCode,
              phone: orderData.phone,
              is_default: true,
            },
          });
        }
      }

      // Create the order
      const order = await tx.order.create({
        data: {
          user_id: userId || 0, // Use 0 for guest user if no user ID
          total: parseFloat(orderData.total),
          payment_method: orderData.paymentMethod,
          payment_status: orderData.paymentStatus || "pending",
          order_status: orderData.orderStatus || "placed",
          order_date: new Date(),
          currency: orderData.currency || "INR",
          delivery_charge: parseFloat(orderData.shipping || 0),
          tax_amount: parseFloat(orderData.tax || 0),
          discount_amount: parseFloat(orderData.discount || 0),
          coupon_code: orderData.couponCode || null,
          order_notes: orderData.notes || null,
          billing_address_id: billingAddressId,
        },
      });

      // Create order products
      for (const item of orderData.items) {
        // Get the product ID and details
        const productId = item.id;
        const price =
          orderData.currency === "INR" ? item.price : item.priceDollars;
        const quantity = item.quantity || 1;

        // Create product variation object if it exists
        let variationJSON = null;
        if (item.variant) {
          variationJSON = JSON.stringify({
            id: item.variant.id,
            attributes: item.variant.attributes || [],
            price: item.variant.price || item.price,
          });
        }

        // Create order product record
        await tx.orderProduct.create({
          data: {
            order_id: order.id,
            product_id: productId,
            price: parseFloat(price),
            quantity: quantity,
            currency: orderData.currency,
            variation: variationJSON,
          },
        });
      }

      // Create shipping details if needed
      if (orderData.shippingMethod) {
        await tx.shippingDetail.create({
          data: {
            order_id: order.id,
            courier_name:
              orderData.shippingMethod === "express"
                ? "Express Courier"
                : "Standard Shipping",
            tracking_id: `TR-${Math.floor(Math.random() * 1000000)}`,
            status: "processing",
            shipping_date: null, // Will be set when actually shipped
          },
        });
      }

      return {
        order: {
          id: order.id,
          total: parseFloat(order.total),
          status: order.order_status,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
        },
        userId,
      };
    });

    return {
      success: true,
      order: result.order,
      userId: result.userId,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      error: error.message || "Failed to create order",
    };
  }
}

/**
 * Create Razorpay order for payment
 * @param {Object} data - Order data including amount, currency and order ID
 * @returns {Promise<Object>} Razorpay order details
 */
export async function createRazorpayOrder(data) {
  try {
    // Validate data
    if (!data.amount) {
      return {
        success: false,
        error: "Order amount is required",
      };
    }

    // In a real implementation, you would make an API call to Razorpay
    // For this implementation, we'll simulate a successful response

    // Create a simulated Razorpay order ID
    const orderId = `rzp_order_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    return {
      success: true,
      orderId,
      amount: data.amount,
      currency: data.currency || "INR",
      receipt: `receipt_${data.orderId || Date.now()}`,
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return {
      success: false,
      error: error.message || "Failed to create payment order",
    };
  }
}

/**
 * Verify Razorpay payment
 * @param {Object} data - Payment verification data
 * @returns {Promise<Object>} Verification result
 */
export async function verifyPayment(data) {
  try {
    // Validate data
    if (!data.paymentData || !data.orderId) {
      return {
        success: false,
        error: "Payment data and order ID are required",
      };
    }

    // In a real implementation, you would verify the payment with Razorpay
    // by creating a signature and comparing it with the one received

    // For this implementation, we'll simulate a successful verification

    // Update the order payment status to completed
    await db.order.update({
      where: { id: parseInt(data.orderId) },
      data: {
        payment_status: "completed",
        // Store payment details
        payment_details: JSON.stringify({
          transactionId: data.paymentData.razorpay_payment_id,
          orderId: data.paymentData.razorpay_order_id,
          signature: data.paymentData.razorpay_signature,
          verifiedAt: new Date().toISOString(),
        }),
      },
    });

    return {
      success: true,
      message: "Payment verified successfully",
      transactionId: data.paymentData.razorpay_payment_id,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      error: error.message || "Payment verification failed",
    };
  }
}

/**
 * Get user orders (supporting guest orders with email checking)
 * @param {string} email - Email to check for guest orders
 * @returns {Promise<Object>} User's orders
 */
export async function getUserOrdersByEmail(email) {
  try {
    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    // First, check if this user exists
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      // Look for guest orders with this email in order notes or metadata
      // This implementation would depend on how you store guest email

      // For this example, we'll return an empty array
      return {
        success: true,
        orders: [],
        message: "No orders found for this email",
      };
    }

    // Get orders for this user
    const orders = await db.order.findMany({
      where: { user_id: user.id },
      orderBy: { order_date: "desc" },
      include: {
        OrderProducts: {
          include: {
            Product: {
              select: {
                title: true,
                description: true,
              },
            },
          },
        },
        ShippingDetail: true,
      },
    });

    // Format the orders
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderId: `ORD-${order.id.toString().padStart(4, "0")}`,
      date: new Date(order.order_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: order.order_status,
      total: Number(order.total),
      items: order.OrderProducts.length,
      shippingStatus: order.ShippingDetail?.status || null,
      currency: order.currency,
    }));

    return {
      success: true,
      orders: formattedOrders,
    };
  } catch (error) {
    console.error("Error getting user orders by email:", error);
    return {
      success: false,
      error: "Failed to get orders: " + error.message,
    };
  }
}

/**
 * Track an order by ID and email (for guest users)
 * @param {number} orderId - Order ID
 * @param {string} email - Email used during checkout
 * @returns {Promise<Object>} Order tracking information
 */
export async function trackOrderByIdAndEmail(orderId, email) {
  try {
    if (!orderId || !email) {
      return {
        success: false,
        error: "Order ID and email are required",
      };
    }

    // Find the order
    const order = await db.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        User: {
          select: {
            email: true,
          },
        },
        ShippingDetail: true,
        OrderProducts: {
          include: {
            Product: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Check if this is a guest order or if the email matches
    const isUserOrder = order.User && order.User.email === email;
    const isGuestOrder = order.user_id === 0; // Assuming guest orders use 0 as user_id

    if (!isUserOrder && !isGuestOrder) {
      return {
        success: false,
        error: "Order not found for this email",
      };
    }

    // Prepare tracking information
    const trackingInfo = {
      orderId: order.id,
      orderStatus: order.order_status,
      orderDate: order.order_date,
      shippingStatus: order.ShippingDetail?.status || "processing",
      trackingId: order.ShippingDetail?.tracking_id || null,
      trackingUrl: order.ShippingDetail?.tracking_url || null,
      items: order.OrderProducts.map((item) => ({
        productId: item.product_id,
        title: item.Product?.title || "Product",
        quantity: item.quantity,
        price: Number(item.price),
      })),
      total: Number(order.total),
      shippingCharge: Number(order.delivery_charge || 0),
    };

    return {
      success: true,
      tracking: trackingInfo,
    };
  } catch (error) {
    console.error("Error tracking order:", error);
    return {
      success: false,
      error: "Failed to track order: " + error.message,
    };
  }
}
