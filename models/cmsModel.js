const mongoose = require("mongoose");

const cmsPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Page title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // Allows flexible JSON content (text, images, layout)
      required: [true, "Page content is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CmsPage = mongoose.model("CmsPage", cmsPageSchema);
module.exports = CmsPage;
