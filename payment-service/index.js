const express = require("express");
const app = express();
const PORT = 5555;
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const NRP = require("node-redis-pubsub");
const nrp = new NRP({
    PORT: 6379,
    scope: "microservice"
});

let wallet = 30000;

nrp.on("NEW_ORDER", data => {
    const { name, quantity, totalPrice } = data;

    if (totalPrice <= wallet) {
        wallet -= totalPrice;
        nrp.emit("ORDER_SCS", { message: "Order placed", amountRemainingInWallet: wallet });
    } else {
        nrp.emit("ORDER_ERR", { error: "Low on wallet money" });
    }
});

app.listen(PORT, () => {
    console.log(`Server at ${PORT}`);
});
