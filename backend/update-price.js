require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const current = await Product.findOne({ name: 'Redmi Note 13' }).lean();
  await Product.updateOne({ name: 'Redmi Note 13' }, { $set: { price: 20 } });
  const updated = await Product.findOne({ name: 'Redmi Note 13' }).lean();
  console.log(JSON.stringify({ oldPrice: current.price, newPrice: updated.price }, null, 2));
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
