const express = require("express");
const { protect, allowedTo } = require("../controllers/authController");
const { 
  scanProductAndDecrement, 
  getInventoryLogs 
} = require("../controllers/inventoryController");

const router = express.Router();

router.use(protect);
router.use(allowedTo("admin", "manager"));

router.post("/scan", scanProductAndDecrement);
router.get("/logs/:productId", getInventoryLogs);

module.exports = router;
