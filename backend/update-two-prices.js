require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const updates = [
  { name: "Redmi Note 13", price: 1 },
  { name: "Women's Ethnic Earrings", price: 1 },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const item of updates) {
    await Product.updateOne({ name: item.name }, { $set: { price: item.price } });
  }

  const results = await Product.find(
    { name: { $in: updates.map((item) => item.name) } },
    { name: 1, price: 1, _id: 0 },
  ).lean();

  console.log(JSON.stringify(results, null, 2));
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
