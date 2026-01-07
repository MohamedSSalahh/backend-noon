const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const Category = require("../models/categoryModel");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

exports.uploadCategoryImage = uploadSingleImage("image");

const { uploadToCloudinary } = require("../utils/cloudinary");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const buffer = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    const result = await uploadToCloudinary(buffer, 'categories');
    req.body.image = result.secure_url;
  }

  next();
});

// @desc  Get list of categories
// @route GET /api/v1/categories
// @access Public
exports.getCategories = factory.getAll(Category);

// @desc   Get specific category by id
// @route GET /api/v1/categories/:id
// @access Public
exports.getCategory = factory.getOne(Category);

// @desc   Create Category
// @route  POST /api/v1/categories
// @access Private/Admin-Manager
exports.createCategory = factory.createOne(Category);

// @desc   Update specific category
// @route  PUT /api/v1/categories
// @access Private/Admin-Manager
exports.updateCategory = factory.updateOne(Category);

// @desc   Delete specific category
// @route  DELETE /api/v1/categories
// @access Private/Admin
exports.deleteCategory = factory.deleteOne(Category);
