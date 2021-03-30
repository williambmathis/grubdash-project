const path = require("path");


// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res, next) {
  res.json({ data: orders });
}

function statusChecker(req, res, next) {
  if (!req.body.data.status) {
    return next({
      status: 400,
      message: `needs a valid status`,
    });
  }
  const allowedNames = "pending preparing out-for-delivery delivered";
  if(!allowedNames.includes(req.body.data.status)){
    return next({
        status: 400,
        message: `does not have a valid status`
    })
  }


  next();
}

function orderIsValid(req, res, next) {
  console.log("in the orderis valid");
  const fieldList = ["deliverTo", "mobileNumber", "dishes"];
  //console.log("This is the string-------",req.body)
  for (const field of fieldList) {
    //console.log(field);
    if (!req.body.data[field]) {
      return next({
        status: 400,
        message: `Required field: "${field}"`,
      });
    }
  }
  if (!Array.isArray(req.body.data.dishes)) {
    console.log(req.body.data.dishes);
    return next({
      status: 400,
      message: "dishes must be an array",
    });
  }
  if (req.body.data.dishes.length === 0) {
    return next({
      status: 400,
      message: "dishes is empty",
    });
  }

  //console.log(req.body.data.dishes);
  for (let i = 0; i < req.body.data.dishes.length; i++) {
    if (!req.body.data.dishes[i].quantity || !Number.isInteger(req.body.data.dishes[i].quantity)) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  next();
}

function create(req, res, next) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;
  const newItem = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newItem);
  res.status(201).json({ data: newItem });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `${orderId} was not found`,
  });
  next();
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function destroy(req, res, next) {
  const foundOrder = res.locals.order;
  if (foundOrder.status !== "pending") {
    return next({
      status: 400,
      message: `order must be pending to cancel`,
    });
  }
  const { orderId } = req.params;
  const index = orders.findIndex((order) => orderId === order.id);
  orders.splice(index, 1);
  res.sendStatus(204);
}

function update(req, res, next) {
  const foundOrder = res.locals.order;
  const {
    data: { id, deliverTo, mobileNumber, status, dishes },
  } = req.body;
  const { orderId } = req.params;
  if (orderId !== id && id) {
    return next({
      status: 400,
      message: `id error: ${id} did not match ${orderId}`,
    });
  }
  res.locals.order.deliverTo = deliverTo;
  res.locals.order.mobileNumber = mobileNumber;
  res.locals.order.status = status;
  res.locals.order.dishes = dishes;
  res.json({data: res.locals.order})
}

module.exports = {
  list,
  create: [orderIsValid, create],
  read: [orderExists, read],
  delete: [orderExists, destroy],
  update: [orderExists, orderIsValid, statusChecker, update],
};
