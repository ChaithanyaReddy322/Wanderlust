const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("C:/Users/PRATHAM/OneDrive/Desktop/web_dev/Major Project/models/listing.js");

main()
.then(()=>{console.log("connection successfull");})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  
}

const initDB = async()=>{
  await listing.deleteMany({});
  initData.data = initData.data.map((obj)=>({...obj,owner:"67a0eb6a08486b8b40846a89"}));
  await listing.insertMany(initData.data);
  console.log("data was initialized ");
}

initDB();   