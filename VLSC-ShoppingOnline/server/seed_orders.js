const mongoose = require('mongoose');
require('./utils/MongooseUtil');
const Models = require('./models/Models');
const ProductDAO = require('./models/ProductDAO');

async function seedOrders() {
  await new Promise(r => setTimeout(r, 3000));
  
  const orderCount = await Models.Order.countDocuments();
  if (orderCount === 0) {
    const products = await ProductDAO.selectAll();
    if (products.length >= 3) {
      const sampleItems = [
        { product: products[0], quantity: 10 },
        { product: products[1], quantity: 8 },
        { product: products[2], quantity: 5 }
      ];
      await Models.Order.create({
        _id: new mongoose.Types.ObjectId(),
        cdate: new Date().getTime(),
        total: sampleItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
        status: 'APPROVED',
        customer: {
          _id: new mongoose.Types.ObjectId(),
          username: 'customer1',
          password: '123',
          name: 'Sample Customer',
          phone: '0901234567',
          email: 'customer@gmail.com',
          active: 1,
          token: ''
        },
        items: sampleItems
      });
      console.log("Sample APPROVED order seeded successfully!");
    }
  } else {
    console.log("Orders already exist.");
  }
  process.exit(0);
}

seedOrders().catch(err => {
  console.error("Error seeding orders:", err);
  process.exit(1);
});
