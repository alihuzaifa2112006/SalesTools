const mongoose = require("mongoose");

async function testConnection() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://alihuzaifa2nov2006_db_user:Huzaifa313@tricons.duarsrr.mongodb.net/";
  const dbName = "SalesTools";

  try {
    await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB:", dbName);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map((c) => c.name).join(", ") || "(none yet)");

    await mongoose.disconnect();
    console.log("Connection test passed.");
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

testConnection();
