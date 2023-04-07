const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const sessionOptions = {
  secret: "thisisnotagoodsecret",
  resave: false,
  saveUninitialized: false,
};

const Product = require("./models/product");
const Farm = require("./models/farm");

const AppError = require("./AppError");
const wrapAsync = require("./utils/wrapAsync");
const engine = require("ejs-mate");

const methodOverride = require("method-override");
const { validate } = require("./models/product");

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

app.engine("ejs", engine);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());

const categories = [
  "fruit",
  "vegetable",
  "dairy",
  "mushroom",
  "poachery",
  "nut",
  "grain",
  "pork",
  "chicken",
  "beef",
];

function validatePassword(req, res, next) {
  const { password } = req.query;
  if (password === "farmerman") {
    next();
  }
  throw new AppError("PASSWORD IS NEEDED", 401);
}

app.use((req, res, next) => {
  res.locals.messages = req.flash("success");
  next();
});

// Farm Routes

app.get("/farms", async (req, res) => {
  const farms = await Farm.find({});
  res.render("farms/index", { farms });
});

app.get("/farms/new", (req, res) => {
  res.render("farms/new");
});

app.delete("/farms/:id", async (req, res) => {
  const farm = await Farm.findByIdAndDelete(req.params.id);
  console.log("DELETING!!!");
  res.redirect("/farms");
});

app.post("/farms", async (req, res, next) => {
  const farm = new Farm(req.body);
  await farm.save();
  req.flash("success", "Successfully made a new farm!");
  res.redirect("/farms");
});

app.get(
  "/farms/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const farm = await Farm.findById(id).populate("products");
    if (!farm) {
      throw new AppError("FARM NOT FOUND", 404);
    }
    console.log(farm);
    res.render("farms/show", { farm });
  })
);

app.get("/farms/:id/products/new", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  res.render("products/new", { categories, farm });
});

app.post("/farms/:id/products", async (req, res, next) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  const { name, price, category } = req.body;
  const product = new Product({ name, price, category });
  farm.products.push(product);
  product.farm = farm;
  await farm.save();
  await product.save();
  res.redirect(`/farms/${id}`);
});

// Product Routes
app.get(
  "/products",
  wrapAsync(async (req, res, next) => {
    const { category } = req.query;
    if (category) {
      const products = await Product.find({ category });
      res.render("products/index", { products, category });
    } else {
      const products = await Product.find({});
      res.render("products/index", { products, category: "All" });
    }
  })
);

app.get("/products/new", (req, res) => {
  // throw new AppError("NOT ALLOWED!", 401);
  res.render("products/new", { categories });
});

app.post(
  "/products",
  wrapAsync(async (req, res, next) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    console.log(newProduct);
    res.redirect(`/products/${newProduct._id}`);
  })
);

app.get(
  "/products/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate("farm");
    if (!product) {
      throw new AppError("PRODUCT NOT FOUND", 404);
    }
    console.log(product);
    res.render("products/show", { product });
  })
);

app.get(
  "/products/:id/edit",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id, req.body);
    if (!product) {
      throw new AppError("PRODUCT NOT FOUND", 404);
    }
    res.render("products/edit", { product, categories });
  })
);

app.put(
  "/products/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });
    res.redirect(`/products/${product._id}`);
  })
);

app.get("/error", (req, res) => {
  chicken.fly();
});

app.delete(
  "/products/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDeler;
    res.redirect("/products");
  })
);

// app.use((err, req, res, next) => {
//   console.log("*******************************");
//   console.log("***********ERROR***************");
//   console.log("*******************************");
//   next(err);
// });

const handleValidationError = function (err) {
  console.dir(err);
  return new AppError(`Validation Failed::: ${err.message}`, 400);
};

app.use((err, req, res, next) => {
  console.log(err.name);
  console.log(err.stack);
  if (err.name === "ValidationError") {
    err = handleValidationError(err);
    next(err);
  }
});

app.use((err, req, res, next) => {
  const { status = 500, message = "SOMETHING WENT WRONG!" } = err;
  console.log(message);
  console.log(err.stack);
  res.status(status).send(message);
});

app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000");
});
