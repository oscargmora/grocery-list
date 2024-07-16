const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Items.
exports.item_list = asyncHandler(async (req, res, next) => {
	const allItems = await Item.find({}, "name amount").sort({ name: 1 }).populate("name").exec();

	res.render("item_list", { title: "Item List", item_list: allItems });
});

// Display detail page for a specific Item.
exports.item_detail = asyncHandler(async (req, res, next) => {
	const item = await Item.findById(req.params.id).populate("category").exec();

	if (item === null) {
		// No results.
		const err = new Error("Item not found");
		err.status = 404;
		return next(err);
	}

	res.render("item_detail", {
		title: "Item Detail",
		item: item,
	});
});

// Display Item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
	// Get all categories, which we can use to add to our item.
	const allCategories = await Category.find().sort({ name: 1 }).exec();

	res.render("item_form", {
		title: "Create Item",
		categories: allCategories,
	});
});

// Handle Item create on POST.
exports.item_create_post = [
	// Convert the category to an array
	(req, res, next) => {
		if (!Array.isArray(req.body.category)) {
			req.body.category = typeof req.body.category === "undefined" ? [] : [req.body.category];
		}
		next();
	},

	// Validate and sanitize the name field.
	body("name", "Item must have a name").trim().escape(),
	body("description", "Invalid Description").optional({ values: "falsy" }).trim().escape(),
	body("category.*").escape(),
	body("price", "Invalid Price").optional({ values: "falsy" }).trim().escape(),
	body("amount", "There must be an amount").trim().escape(),

	// Process request after validation and sanitization.
	asyncHandler(async (req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create an item object with escaped and trimmed data.
		const item = new Item({
			name: req.body.name,
			description: req.body.description,
			category: req.body.category,
			price: req.body.price,
			amount: req.body.amount,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render the form again with sanitized values/error messages.

			// Get all categories for form.
			const allCategories = await Category.find().sort({ name: 1 }).exec();

			// Mark our selected categories as checked.
			for (const category of allCategories) {
				if (item.category.includes(category._id)) {
					category.checked = "true";
				}
			}
			res.render("item_form", {
				title: "Create Item",
				categories: allCategories,
				item: item,
				errors: errors.array(),
			});
		} else {
			// Data from form is valid. Save item.
			await item.save();
			res.redirect(item.url);
		}
	}),
];

// Display Item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
	// Get details of item and all their categories (in parallel)
	const item = await Item.findById(req.params.id).populate("category").exec();

	if (item === null) {
		// No result.
		res.redirect("/items");
	}

	res.render("item_delete", {
		title: "Delete Item",
		item: item,
	});
});

// Handle Item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
	// Assume valid Item id in field.
	await Item.findByIdAndDelete(req.body.itemid);
	res.redirect("/items");
});

// Display Item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
	// Get item for form
	const [item, allCategories] = await Promise.all([
		Item.findById(req.params.id).exec(),
		Category.find().sort({ name: 1 }).exec(),
	]);

	if (item === null) {
		// No results.
		const err = new Error("Item not found");
		err.status = 404;
		return next(err);
	}

	allCategories.forEach((category) => {
		if (item.category.includes(category._id)) category.checked = "true";
	});

	res.render("item_form", {
		title: "Update Item",
		categories: allCategories,
		item: item,
	});
});

// Handle Item update on POST.
exports.item_update_post = [
	// Convert the category to an array.
	(req, res, next) => {
		if (!Array.isArray(req.body.category)) {
			req.body.category = typeof req.body.category === "undefined" ? [] : [req.body.category];
		}
		next();
	},

	// Validate and sanitize fields
	body("name", "Item must have a name").trim().escape(),
	body("description", "Invalid Description").optional({ values: "falsy" }).trim().escape(),
	body("category.*").escape(),
	body("price", "Invalid Price").optional({ values: "falsy" }).trim().escape(),
	body("amount", "There must be an amount").trim().escape(),

	// Process request after validation and sanitization.
	asyncHandler(async (req, res, next) => {
		// Extract the validation and sanitization.
		const errors = validationResult(req);

		// Create an Item object with escaped/trimmed data and old id.
		const item = new Item({
			name: req.body.name,
			description: req.body.description,
			category: typeof req.body.category === "undefined" ? [] : req.body.category,
			price: req.body.price,
			amount: req.body.amount,
			_id: req.params.id, // This is required, or a new ID will be assigned!
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/error messages.

			// Get all categories for form.
			const allCategories = await Category.find().sort({ name: 1 }).exec();

			// Mark our selected categories as checked.
			for (const category of allCategories) {
				if (item.category.indexOf(category._id) > -1) {
					category.checked = "true";
				}
			}
			res.render("category_form", {
				title: "Update Item",
				item: item,
				categories: allCategories,
			});
			return;
		} else {
			// Data from form is valid. Update the record.
			const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
			// redirect to item detail page.
			res.redirect(updatedItem.url);
		}
	}),
];
