const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const InventoryLog = require('../models/inventoryLogModel');
const ApiError = require('../utils/apiError');

// @desc    Scan product (find by barcode) and decrement stock (simulate sale/usage)
// @route   POST /api/v1/inventory/scan
// @access  Private/Admin-Manager
exports.scanProductAndDecrement = asyncHandler(async (req, res, next) => {
  const { barcode, quantity = 1 } = req.body;

  if (!barcode) {
    return next(new ApiError('Please provide a barcode', 400));
  }

  // 1. Find Product
  const product = await Product.findOne({ barcode });
  if (!product) {
    return next(new ApiError('Product not found with this barcode', 404));
  }

  // 2. Check Stock
  if (product.quantity < quantity) {
    return next(new ApiError(`Insufficient stock. Current: ${product.quantity}, Requested: ${quantity}`, 400));
  }

  // 3. Decrement Stock
  const previousQuantity = product.quantity;
  const newQuantity = previousQuantity - quantity;
  
  product.quantity = newQuantity;
  product.sold += quantity; // Assuming 'sold' tracks total sales
  await product.save();

  // 4. Create Log
  await InventoryLog.create({
    product: product._id,
    user: req.user._id, // Assuming protected route with auth
    type: 'out', // or 'sale'
    quantityChange: -quantity,
    previousQuantity,
    newQuantity,
    reason: 'Barcode Scan Sale',
  });

  res.status(200).json({
    status: 'success',
    data: {
      product: {
        _id: product._id,
        title: product.title,
        price: product.price,
        barcode: product.barcode,
        quantity: product.quantity,
      },
      message: 'Stock updated successfully',
    },
  });
});

// @desc    Get Inventory Logs for a Product
// @route   GET /api/v1/inventory/logs/:productId
// @access  Private/Admin-Manager
exports.getInventoryLogs = asyncHandler(async (req, res, next) => {
    const logs = await InventoryLog.find({ product: req.params.productId })
      .populate('user', 'name email')
      .sort('-createdAt');
  
    res.status(200).json({
      status: 'success',
      results: logs.length,
      data: logs,
    });
  });
