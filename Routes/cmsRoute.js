const express = require("express");
const {
  getCmsPage,
  upsertCmsPage,
} = require("../controllers/cmsController");

const { protect, allowedTo } = require("../controllers/authController");

const router = express.Router();

router.route("/:slug").get(getCmsPage);

router.route("/").post(protect, allowedTo("admin"), upsertCmsPage);

module.exports = router;
