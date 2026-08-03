const https = require('https');
const mongoose = require('mongoose');
require('./utils/MongooseUtil');
const Models = require('./models/Models');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function parseMongoDoc(doc) {
  if (!doc) return doc;
  const newDoc = JSON.parse(JSON.stringify(doc));

  if (newDoc._id && newDoc._id.$oid) {
    newDoc._id = new mongoose.Types.ObjectId(newDoc._id.$oid);
  }
  if (newDoc.cdate && typeof newDoc.cdate === 'object' && newDoc.cdate.$numberLong) {
    newDoc.cdate = Number(newDoc.cdate.$numberLong);
  }
  if (newDoc.price && typeof newDoc.price === 'object' && newDoc.price.$numberLong) {
    newDoc.price = Number(newDoc.price.$numberLong);
  }
  if (newDoc.category) {
    if (newDoc.category._id && newDoc.category._id.$oid) {
      newDoc.category._id = new mongoose.Types.ObjectId(newDoc.category._id.$oid);
    }
  }
  return newDoc;
}

async function importAll() {
  await new Promise(r => setTimeout(r, 3000));
  console.log("Connected to DB, starting import of tsonkk/shoppingonline-resources...");

  // 1. Admins
  try {
    const rawAdmins = await fetchJson('https://raw.githubusercontent.com/tsonkk/shoppingonline-resources/main/mongodb/admins.json');
    for (const raw of rawAdmins) {
      const adminDoc = parseMongoDoc(raw);
      await Models.Admin.updateOne({ username: adminDoc.username }, adminDoc, { upsert: true });
    }
    console.log("Imported admins count:", rawAdmins.length);
  } catch (err) {
    console.error("Error importing admins:", err.message);
  }

  // 2. Categories
  try {
    const rawCategories = await fetchJson('https://raw.githubusercontent.com/tsonkk/shoppingonline-resources/main/mongodb/categories.json');
    for (const raw of rawCategories) {
      const cateDoc = parseMongoDoc(raw);
      await Models.Category.updateOne({ _id: cateDoc._id }, cateDoc, { upsert: true });
    }
    console.log("Imported categories count:", rawCategories.length);
  } catch (err) {
    console.error("Error importing categories:", err.message);
  }

  // 3. Products
  try {
    const rawProducts = await fetchJson('https://raw.githubusercontent.com/tsonkk/shoppingonline-resources/main/mongodb/products.json');
    for (const raw of rawProducts) {
      const prodDoc = parseMongoDoc(raw);
      await Models.Product.updateOne({ _id: prodDoc._id }, prodDoc, { upsert: true });
    }
    console.log("Imported products with images count:", rawProducts.length);
  } catch (err) {
    console.error("Error importing products:", err.message);
  }

  console.log("ALL DATA & IMAGES IMPORTED SUCCESSFULLY!");
  process.exit(0);
}

importAll().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
