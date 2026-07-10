const Product = require("../models/Product");
const seedProducts = require("../data/products");

const seedProductsOnce = async () => {
  const count = await Product.estimatedDocumentCount();

  if (count > 0) {
    return;
  }

  await Product.insertMany(seedProducts);
  console.log(`Seeded ${seedProducts.length} products`);
};

module.exports = seedProductsOnce;
