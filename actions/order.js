"use server";

import { db } from "@/lib/prisma";

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
  endDate = null
} = {}) {
  try {
    // Validate and parse input parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = ((isNaN(pageNum) ? 1 : Math.max(1, pageNum)) - 1) * (isNaN(limitNum) ? 15 : Math.max(1, limitNum));
    
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
          gte: parsedStartDate
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
          lte: parsedEndDate
        };
      }
    }
    
    // Apply search filter if provided
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { id: isNaN(parseInt(searchTerm)) ? undefined : parseInt(searchTerm) },
        {
          User: {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } }
            ]
          }
        }
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
            email: true
          }
        },
        OrderProducts: {
          select: {
            id: true
          }
        },
        ShippingDetail: {
          select: {
            status: true,
            tracking_id: true
          }
        }
      },
      orderBy,
      skip,
      take: isNaN(limitNum) ? 15 : Math.max(1, limitNum)
    });
    
    // Count total matching records for pagination
    const totalCount = await db.order.count({ where });
    
    // Format the response data
    const formattedOrders = orders.map(order => ({
      id: order.id,
      userId: order.user_id,
      userName: order.User?.name || 'Unknown',
      userEmail: order.User?.email || 'No email',
      total: Number(order.total) || 0,
      paymentMethod: order.payment_method || 'unknown',
      paymentStatus: order.payment_status || 'pending',
      orderStatus: order.order_status || 'placed',
      orderDate: order.order_date || new Date(),
      currency: order.currency || 'INR',
      shippingStatus: order.ShippingDetail?.status || null,
      trackingId: order.ShippingDetail?.tracking_id || null,
      itemsCount: order.OrderProducts?.length || 0
    }));
    
    return {
      success: true,
      orders: formattedOrders,
      totalOrders: totalCount,
      totalPages: Math.ceil(totalCount / (isNaN(limitNum) ? 15 : Math.max(1, limitNum)))
    };
  } catch (error) {
    // Handle error
    const errorMessage = error.message || 'Unknown error';
    console.error("Error fetching orders: " + errorMessage);
    
    return {
      success: false,
      error: "Failed to fetch orders: " + errorMessage,
      orders: [],
      totalOrders: 0,
      totalPages: 0
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
        error: "Order ID is required"
      };
    }
    
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return {
        success: false,
        error: "Invalid order ID format"
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
            mobile: true
          }
        },
        OrderProducts: {
          include: {
            // Add any relevant relations here if needed
          }
        },
        ShippingDetail: true
      }
    });
    
    if (!order) {
      return {
        success: false,
        error: "Order not found"
      };
    }
    
    // Format the response
    const formattedOrder = {
      ...order,
      total: Number(order.total),
      delivery_charge: Number(order.delivery_charge),
      tax_amount: order.tax_amount ? Number(order.tax_amount) : 0,
      discount_amount: order.discount_amount ? Number(order.discount_amount) : 0
    };
    
    return {
      success: true,
      order: formattedOrder
    };
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    console.error("Error fetching order: " + errorMessage);
    
    return {
      success: false,
      error: "Failed to fetch order details: " + errorMessage
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
        error: "Order ID is required"
      };
    }
    
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return {
        success: false,
        error: "Invalid order ID format"
      };
    }
    
    // Validate status value
    const validStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        error: `Invalid status value. Status must be one of: ${validStatuses.join(', ')}`
      };
    }
    
    // Check if the order exists
    const orderExists = await db.order.findUnique({
      where: { id: orderId },
      select: { 
        id: true, 
        order_status: true,
        user_id: true
      }
    });
    
    if (!orderExists) {
      return {
        success: false,
        error: "Order not found"
      };
    }
    
    // Skip update if status is already the desired value
    if (orderExists.order_status === status) {
      return {
        success: true,
        order: {
          id: orderExists.id,
          orderStatus: orderExists.order_status
        },
        message: `Order is already in ${status} status`
      };
    }
    
    // Update the order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { order_status: status }
    });
    
    // If status is shipped, also update shipping details if they exist
    if (status === 'shipped') {
      const shippingDetail = await db.shippingDetail.findUnique({
        where: { order_id: orderId }
      });
      
      if (shippingDetail) {
        await db.shippingDetail.update({
          where: { order_id: orderId },
          data: { 
            status: 'shipped',
            shipping_date: new Date()
          }
        });
      }
    }
    
    console.log(`Order ${updatedOrder.id} status changed from ${orderExists.order_status} to ${status}`);
    
    return {
      success: true,
      order: {
        id: updatedOrder.id,
        orderStatus: updatedOrder.order_status
      },
      message: `Order status updated to ${status} successfully`
    };
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    console.error(`Error updating order status (ID: ${id}, Status: ${status}): ${errorMessage}`);
    
    return {
      success: false,
      error: "Failed to update order status: " + errorMessage
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
        error: "Order ID is required"
      };
    }
    
    const parsedOrderId = parseInt(orderId);
    
    if (isNaN(parsedOrderId)) {
      return {
        success: false,
        error: "Invalid order ID format"
      };
    }
    
    // Validate required fields
    if (!shippingData.courier_name || !shippingData.tracking_id) {
      return {
        success: false,
        error: "Courier name and tracking ID are required"
      };
    }
    
    // Check if the order exists
    const orderExists = await db.order.findUnique({
      where: { id: parsedOrderId },
      select: { id: true }
    });
    
    if (!orderExists) {
      return {
        success: false,
        error: "Order not found"
      };
    }
    
    // Check if shipping details already exist
    const existingShipping = await db.shippingDetail.findUnique({
      where: { order_id: parsedOrderId }
    });
    
    let updatedShipping;
    
    if (existingShipping) {
      // Update existing shipping details
      updatedShipping = await db.shippingDetail.update({
        where: { order_id: parsedOrderId },
        data: {
          courier_name: shippingData.courier_name,
          tracking_id: shippingData.tracking_id,
          tracking_url: shippingData.tracking_url || existingShipping.tracking_url,
          shipping_date: shippingData.shipping_date ? new Date(shippingData.shipping_date) : existingShipping.shipping_date,
          status: shippingData.status || existingShipping.status
        }
      });
    } else {
      // Create new shipping details
      updatedShipping = await db.shippingDetail.create({
        data: {
          order_id: parsedOrderId,
          courier_name: shippingData.courier_name,
          tracking_id: shippingData.tracking_id,
          tracking_url: shippingData.tracking_url,
          shipping_date: shippingData.shipping_date ? new Date(shippingData.shipping_date) : new Date(),
          status: shippingData.status || 'processing'
        }
      });
      
      // If we're adding shipping for the first time and status is set to shipped,
      // update the order status as well
      if (shippingData.status === 'shipped') {
        await db.order.update({
          where: { id: parsedOrderId },
          data: { order_status: 'shipped' }
        });
      }
    }
    
    return {
      success: true,
      shipping: updatedShipping,
      message: "Shipping details updated successfully"
    };
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    console.error(`Error updating shipping details (Order ID: ${orderId}): ${errorMessage}`);
    
    return {
      success: false,
      error: "Failed to update shipping details: " + errorMessage
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
      where: { order_status: "placed" }
    });
    
    const processingOrders = await db.order.count({
      where: { order_status: "processing" }
    });
    
    const shippedOrders = await db.order.count({
      where: { order_status: "shipped" }
    });
    
    const deliveredOrders = await db.order.count({
      where: { order_status: "delivered" }
    });
    
    const cancelledOrders = await db.order.count({
      where: { order_status: "cancelled" }
    });
    
    // Get orders from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await db.order.count({
      where: {
        order_date: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    // Get total revenue (for all time)
    const revenueResult = await db.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        order_status: {
          notIn: ["cancelled", "returned"]
        }
      }
    });
    
    const totalRevenue = revenueResult._sum.total ? Number(revenueResult._sum.total) : 0;
    
    // Get revenue from last 30 days
    const recentRevenueResult = await db.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        order_date: {
          gte: thirtyDaysAgo
        },
        order_status: {
          notIn: ["cancelled", "returned"]
        }
      }
    });
    
    const recentRevenue = recentRevenueResult._sum.total ? Number(recentRevenueResult._sum.total) : 0;
    
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
        recentRevenue
      }
    };
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
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
        recentRevenue: 0
      }
    };
  }
}