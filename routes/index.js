const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const Category = require("../models/category");
const Item = require("../models/item");

// Require controller modules.
const category_controller = require("../controllers/categoryController");
const item_controller = require("../controllers/itemController");

/* GET home page. */
router.get(
	"/",
	asyncHandler(async (req, res, next) => {
		// Get details of categories and items (in parallel)
		const [numCategories, numItems] = await Promise.all([
			Category.countDocuments({}).exec(),
			Item.countDocuments({}).exec(),
		]);

		res.render("index", {
			title: "Grocery List",
			category_count: numCategories,
			item_count: numItems,
		});
	})
);

/// CATEGORY ROUTES ///

// GET request for creating a Category. NOTE This must come before routes that display CATEGORY (uses id).
router.get("/category/create", category_controller.category_create_get);

// POST request for creating a Category.
router.post("/category/create", category_controller.category_create_post);

// GET request to delete Category.
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request to delete Category.
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request to update Category.
router.get("/category/:id/update", category_controller.category_update_get);

// POST request to update Category.
router.post("/category/:id/update", category_controller.category_update_post);

// GET request for one Category.
router.get("/category/:id", category_controller.category_detail);

// GET request for list of all Categories.
router.get("/categories", category_controller.category_list);

/// ITEM ROUTES ///

// GET request for creating an Item. NOTE This must come before routes that display CATEGORY (uses id).
router.get("/item/create", item_controller.item_create_get);

// POST request for creating an Item.
router.post("/item/create", item_controller.item_create_post);

// GET request to delete Item.
router.get("/item/:id/delete", item_controller.item_delete_get);

// POST request to delete Item.
router.post("/item/:id/delete", item_controller.item_delete_post);

// GET request to update Item.
router.get("/item/:id/update", item_controller.item_update_get);

// POST request to update Item.
router.post("/item/:id/update", item_controller.item_update_post);

// GET request for one Item.
router.get("/item/:id", item_controller.item_detail);

// GET request for list of all Items.
router.get("/items", item_controller.item_list);

module.exports = router;
