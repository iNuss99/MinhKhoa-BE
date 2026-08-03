const mongoose = require('mongoose');
require('./utils/MongooseUtil');
const Models = require('./models/Models');

async function seed() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const adminCount = await Models.Admin.countDocuments();
  if (adminCount === 0) {
    await Models.Admin.create({
      _id: new mongoose.Types.ObjectId("643f4ea23ef68011c2177816"),
      username: "admin",
      password: "123"
    });
    console.log("Admin account seeded successfully: admin / 123");
  } else {
    console.log("Admin account already exists in database.");
  }
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
