const mongoose = require("mongoose");
const Product = require("../models/Product");

// Create a new product
exports.createProduct = async (req, res, next) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        next(error);
    }
};

// Get all products with search, filter, sorting and pagination
exports.getAllProducts = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const filter = {};

        if (req.query.category) filter.category = req.query.category;
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: "i" };
        }
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        const sortField = req.query.sort || "createdAt";
        const sortOrder = sortField.startsWith("-") ? -1 : 1;
        const cleanSortField = sortField.replace("-", "");
        const allowedSortFields = ["name", "price", "quantity", "createdAt"];
        const sort = {};
        if (allowedSortFields.includes(cleanSortField)) {
            sort[cleanSortField] = sortOrder;
        } else {
            sort.createdAt = -1;
        }

        const products = await Product.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await Product.countDocuments(filter);

        res.json({ total, page, totalPages: Math.ceil(total / limit), count: products.length, products });
    } catch (error) {
        next(error);
    }
};

// Get products whose quantity is at or below their reorder level
exports.getLowStockProducts = async (req, res, next) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ["$quantity", "$reorderLevel"] }
        });
        res.json({ count: products.length, lowStockItems: products });
    } catch (error) {
        next(error);
    }
};

// Category-wise inventory summary using MongoDB aggregation
exports.getCategorySummary = async (req, res, next) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalItems: { $sum: 1 },
                    totalQuantity: { $sum: "$quantity" },
                    totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
                    avgPrice: { $avg: "$price" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json({ categories: summary.length, summary });
    } catch (error) {
        next(error);
    }
};

// Get one product by ID
exports.getProductById = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        next(error);
    }
};

// Update product details
exports.updateProduct = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

// Increase or decrease product stock
exports.adjustStock = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const change = Number(req.body.change);
        if (!Number.isInteger(change) || change === 0) {
            return res.status(400).json({ message: "Change must be a non-zero whole number" });
        }
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (product.quantity + change < 0) {
            return res.status(400).json({ message: "Not enough stock available" });
        }
        product.quantity += change;
        await product.save();
        res.json({ message: "Stock updated successfully", product });
    } catch (error) {
        next(error);
    }
};

// Delete a product
exports.deleteProduct = async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully", id: product._id });
    } catch (error) {
        next(error);
    }
};
