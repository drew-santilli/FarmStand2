const mongoose = require("mongoose");
const Product = require("./models/product");

mongoose
  .connect("mongodb://127.0.0.1:27017/FarmStand", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!");
  })
  .catch((err) => {
    console.log("MONGO ERROR!");
    console.log(err);
  });

// const p = new Product({
//   name: "Ruby Grapefruit",
//   price: 3,
//   category: "fruit",
// });
// p.save()
//   .then((p) => {
//     console.log(p);
//   })
//   .catch((e) => {
//     console.log(e);
//   });

const seedProducts = [
  { name: "Organic Watermelon", price: 2.99, category: "fruit" },
  { name: "Potato", price: 0.5, category: "vegetable" },
  { name: "Organic Strawberries", price: 7, category: "fruit" },
  { name: "Whole Milk", price: 2, category: "dairy" },
  { name: "Organic Celery", price: 1.5, category: "vegetable" },
];

Product.insertMany(seedProducts)
  .then((res) => {
    console.log(res);
  })
  .catch((e) => {
    console.log(e);
  });
