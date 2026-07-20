const Product = require("../models/Product");
const seedProducts = require("../data/products");

const seedProductsOnce = async () => {
  const count = await Product.estimatedDocumentCount();
  const mobileProducts = seedProducts.filter((product) => product.category === "Mobiles");

  if (count > 0) {
    const existingMobiles = await Product.find({ category: "Mobiles" }).select("name").lean();
    const existingMobileNames = existingMobiles.map((product) => product.name).sort().join("|");
    const expectedMobileNames = mobileProducts.map((product) => product.name).sort().join("|");

    if (existingMobileNames !== expectedMobileNames) {
      await Product.deleteMany({ category: "Mobiles" });
      await Product.insertMany(mobileProducts);
      console.log(`Synced ${mobileProducts.length} Mobile Accessories products`);
    }

    return;
  }

  await Product.insertMany(seedProducts);
  console.log(`Seeded ${seedProducts.length} products`);
};

module.exports = seedProductsOnce;
