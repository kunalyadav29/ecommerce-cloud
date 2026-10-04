// Express backend: serves the API and the built React app (one cloud deployment).
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const products = [
  { id: 1, name: "Fundamentals of Computer Science", price: 499.00, image: "https://technicalpublications.in/cdn/shop/files/9789355859006_1_51a0af1d-cbeb-47f6-855b-fd7d5e8969e9.jpg?v=1746789403" },
  { id: 2, name: "Foundations of Computer Science", price: 450.00, image: "https://tse2.mm.bing.net/th/id/OIP.roAvHVyeSr4mDsXmL2ouTQHaJo?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 3, name: "Dune", price: 599.00, image: "https://m.media-amazon.com/images/I/71lwUXdZJqL._SL1481_.jpg" },
  { id: 4, name: "How Innovation Works", price: 399.00, image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "The Hobbit", price: 450.00, image: "https://tse3.mm.bing.net/th/id/OIP.7H4xRRIZLyY8WCXQEfTQ7wHaKe?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 6, name: "The Godfather", price: 350.00, image: "https://tse2.mm.bing.net/th/id/OIP.LaD_L2AtY7vV30mghfOSggHaLJ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" }
];

// Cloud database (MongoDB Atlas). Optional: without MONGODB_URI, orders stay in memory.
const Order = mongoose.model('Order', new mongoose.Schema({
  orderId: Number,
  items: [{ id: Number, name: String, price: Number }],
  total: Number,
  createdAt: { type: Date, default: Date.now },
}));
let dbReady = false;
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => { dbReady = true; console.log('Connected to MongoDB'); })
    .catch(err => console.error('MongoDB connection failed:', err.message));
}
const memoryOrders = [];

app.get('/api/health', (req, res) => res.json({ ok: true, database: dbReady }));

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/checkout', async (req, res) => {
  const { cart } = req.body;
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty." });
  }
  // Rebuild items from server-side prices so the client can't change them.
  const items = cart.map(c => products.find(p => p.id === c.id)).filter(Boolean)
    .map(p => ({ id: p.id, name: p.name, price: p.price }));
  if (items.length === 0) return res.status(400).json({ message: "No valid items in cart." });

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const orderId = Math.floor(Math.random() * 1000000);
  try {
    if (dbReady) await Order.create({ orderId, items, total });
    else memoryOrders.push({ orderId, items, total, createdAt: new Date() });
    res.json({ message: "Order placed successfully!", orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not save the order." });
  }
});

// Serve the built React app
const dist = path.join(__dirname, 'ecommercefrontend', 'dist');
app.use(express.static(dist));
app.use((req, res) => res.sendFile(path.join(dist, 'index.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
