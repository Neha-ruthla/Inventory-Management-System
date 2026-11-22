const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");


router.get("/low-stock", productController.getLowStockProducts);
router.get("/summary", productController.getCategorySummary);

router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.patch("/:id/stock", productController.adjustStock);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
