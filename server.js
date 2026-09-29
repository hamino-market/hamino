const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
}

function getOrders() {
    return JSON.parse(
        fs.readFileSync(ORDERS_FILE, "utf8")
    );
}

function saveOrders(orders) {
    fs.writeFileSync(
        ORDERS_FILE,
        JSON.stringify(orders, null, 2),
        "utf8"
    );
}

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "Hamino Backend is running",
        time: new Date().toISOString()
    });
});

app.post("/api/orders", (req, res) => {
    try {
        const {
            customerName,
            phone,
            address,
            items,
            total
        } = req.body;

        if (
            !customerName ||
            !phone ||
            !address ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "اطلاعات سفارش کامل نیست."
            });
        }

        const orders = getOrders();

        const order = {
            id: Date.now().toString(),
            orderNumber: "HAM-" + Date.now(),
            customerName,
            phone,
            address,
            items,
            total: Number(total) || 0,
            status: "new",
            createdAt: new Date().toISOString()
        };

        orders.push(order);
        saveOrders(orders);

        res.status(201).json({
            success: true,
            message: "سفارش با موفقیت ثبت شد.",
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "خطا در ثبت سفارش."
        });
    }
});

app.get("/api/orders", (req, res) => {
    try {
        const orders = getOrders();

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "خطا در دریافت سفارش‌ها."
        });
    }
});

app.patch("/api/orders/:id/status", (req, res) => {
    try {
        const orders = getOrders();

        const order = orders.find(
            item => item.id === req.params.id
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "سفارش پیدا نشد."
            });
        }

        const allowedStatuses = [
            "new",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                success: false,
                message: "وضعیت سفارش نامعتبر است."
            });
        }

        order.status = req.body.status;
        order.updatedAt = new Date().toISOString();

        saveOrders(orders);

        res.json({
            success: true,
            message: "وضعیت سفارش تغییر کرد.",
            order
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "خطا در تغییر وضعیت سفارش."
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `Hamino Backend running on port ${PORT}`
    );
});
