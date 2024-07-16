const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
	name: { type: String, required: true },
	description: { type: String },
	category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
	price: { type: Number },
	amount: { type: Number, required: true },
});

// Virtual for item's URL
ItemSchema.virtual("url").get(function () {
	return `/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);
