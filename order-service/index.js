const express = require("express");
const app = express();
const PORT = 4444;
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const NRP = require("node-redis-pubsub");
const nrp = new NRP({
    PORT: 6379,
    scope: "microservice"
});

const food = {
    "burger": 150,
    "chicken": 120,
    "egg": 50,
    "rice": 1000
};

app.post("/order", (req, res) => {
    const { order } = req.body;
    // name - String
    // quantity - Integer
    if (!order.name || !order.quantity)
        return res.status(404).json({
            message: "Order name or quantity missing"
        });

    let receipt = {
        name: order.name,
        quantity: order.quantity,
        totalPrice: order.quantity * food[order.name]
    };

    nrp.emit("NEW_ORDER", receipt);

    nrp.on("ORDER_SCS", message => {
        receipt["amountRemainingInWallet"] = message.amountRemainingInWallet;
        return res.json({ message: message.message, receipt });
    });

    nrp.on("ORDER_ERR", error => {
        return res.json(error);
    });
});

app.listen(PORT, () => {
    console.log(`Server at ${PORT}`);
});
