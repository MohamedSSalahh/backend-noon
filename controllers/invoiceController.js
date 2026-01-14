const fs = require('fs');
const PDFDocument = require('pdfkit'); // User needs to install pdfkit
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const ApiError = require('../utils/apiError');

// @desc    Generate Invoice PDF
// @route   GET /api/v1/orders/:id/invoice
// @access  Private
exports.generateInvoice = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId).populate('user', 'name email').populate('cartItems.product', 'title price');

  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  // Create a document
  const doc = new PDFDocument({ margin: 50 });

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);

  // Pipe the PDF to the response
  doc.pipe(res);

  // --- PDF Content ---

  // Header
  doc
    .fontSize(20)
    .text('INVOICE', { align: 'center' })
    .moveDown();

  doc
    .fontSize(12)
    .text(`Order ID: ${order._id}`)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
    .text(`Customer: ${order.user.name} (${order.user.email})`)
    .moveDown();

  // Address
  if (order.shippingAddress) {
      doc
        .text('Shipping Address:')
        .text(`${order.shippingAddress.details || ''}`)
        .text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.postalCode || ''}`)
        .text(`Phone: ${order.shippingAddress.phone || ''}`)
        .moveDown();
  }

  // Items Table Header
  const tableTop = 250;
  const itemX = 50;
  const quantityX = 350;
  const priceX = 450;

  doc
    .font('Helvetica-Bold')
    .text('Item', itemX, tableTop)
    .text('Qty', quantityX, tableTop)
    .text('Price', priceX, tableTop);

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Items
  let y = tableTop + 30;
  doc.font('Helvetica');

  order.cartItems.forEach((item) => {
    const title = item.product ? item.product.title : 'Deleted Product';
    const price = item.price;
    
    doc
      .text(title.substring(0, 40) + (title.length > 40 ? '...' : ''), itemX, y)
      .text(item.quantity.toString(), quantityX, y)
      .text(`$${price}`, priceX, y);
    
    y += 20;
  });

  doc
    .moveTo(50, y + 10)
    .lineTo(550, y + 10)
    .stroke();

  // Total
  y += 20;
  doc
    .font('Helvetica-Bold')
    .text(`Total Price: $${order.totalOrderPrice}`, priceX - 20, y, { align: 'right', width: 120 });

  // Footer
  doc
    .fontSize(10)
    .text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });
    
  doc.end();
});
