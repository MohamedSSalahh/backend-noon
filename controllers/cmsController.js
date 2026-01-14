const asyncHandler = require("express-async-handler");
const CmsPage = require("../models/cmsModel");

// @desc    Get CMS Page by Slug
// @route   GET /api/v1/cms/:slug
// @access  Public
exports.getCmsPage = asyncHandler(async (req, res, next) => {
  const page = await CmsPage.findOne({ slug: req.params.slug });
  if (!page) {
    return res.status(404).json({ status: "fail", message: "Page not found" });
  }
  res.status(200).json({ status: "success", data: page });
});

// @desc    Create or Update CMS Page
// @route   POST /api/v1/cms
// @access  Private/Admin
exports.upsertCmsPage = asyncHandler(async (req, res, next) => {
  const { slug, title, content } = req.body;
  
  let page = await CmsPage.findOne({ slug });

  if (page) {
    page.title = title || page.title;
    page.content = content || page.content;
    await page.save();
  } else {
    page = await CmsPage.create({ slug, title, content });
  }

  res.status(200).json({ status: "success", data: page });
});
