const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Inventory log must belong to a product'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Inventory log must belong to a user (admin/manager)'],
    },
    type: {
      type: String,
      enum: ['in', 'out', 'adjustment', 'sale', 'return'],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

inventoryLogSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
