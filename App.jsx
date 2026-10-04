// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './components/App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios.get('/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = (indexToRemove) => setCart(cart.filter((_, index) => index !== indexToRemove));

  const checkout = () => {
    axios.post('/api/checkout', { cart })
      .then(response => {
        window.alert(`${response.data.message} (Order ID: #${response.data.orderId})`);
        setCart([]); 
      })
      .catch(error => console.error("Checkout error:", error));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      
      {/* --- EXTREME LEFT: Branding & Categories --- */}
      <aside className="left-sidebar">
        <div className="brand">
          <h1>NOVEL<span>X</span></h1>
        </div>
        
        <div className="sidebar-nav">
          <h3 className="nav-heading">Library</h3>
          <ul className="category-list">
            <li className="active">All Books</li>
            <li>New Releases</li>
            <li>Bestsellers</li>
          </ul>

          <h3 className="nav-heading">Genres</h3>
          <ul className="category-list sub-list">
            <li>Science Fiction</li>
            <li>Classic Literature</li>
            <li>Dark Fantasy</li>
            <li>Mystery & Thriller</li>
            <li>Non-Fiction</li>
          </ul>
        </div>
      </aside>

      {/* --- CENTER: Main Workspace --- */}
      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <span className="search-icon">⚲</span>
            <input 
              type="text" 
              placeholder="Search by title, author, or keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section className="product-area">
          <div className="area-header">
            <h2>Trending Collection</h2>
            <span className="results-count">{filteredProducts.length} items available</span>
          </div>

          <div className="product-grid">
            {filteredProducts.length === 0 ? (
              <div className="empty-state">No books match your search.</div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="book-card">
                  {/* Now rendering the actual image instead of emoji */}
                  <div className="book-cover">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="book-info">
                    <div className="book-text">
                      <h3 className="book-title">{product.name}</h3>
                      <p className="book-author">Standard Edition</p>
                    </div>
                    <div className="book-action">
                      <span className="book-price">₹{product.price.toFixed(2)}</span>
                      <button className="add-btn" onClick={() => addToCart(product)}>+ Add</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* --- EXTREME RIGHT: User Profile & Cart --- */}
      <aside className="right-panel">
        <div className="user-profile">
          <div className="avatar">K</div>
          <div className="user-details">
            <span className="user-name">Kunal Yadav</span>
            <span className="user-status">Premium Member</span>
          </div>
        </div>

        <div className="cart-container">
          <h2 className="cart-title">Order Summary</h2>
          
          <div className="cart-items-scroll">
            {cart.length === 0 ? (
              <div className="empty-cart-state">
                <span className="empty-icon">♢</span>
                <p>Your bag is empty</p>
              </div>
            ) : (
              <ul className="cart-items-list">
                {cart.map((item, index) => (
                  <li key={index} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">₹{item.price.toFixed(2)}</span>
                    </div>
                    <button className="remove-item-btn" onClick={() => removeFromCart(index)}>✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="checkout-footer">
            <div className="calc-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="calc-row">
              <span>Taxes</span>
              <span>₹0.00</span>
            </div>
            <div className="calc-row total-row">
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            
            <button 
              className="checkout-btn" 
              onClick={checkout}
              disabled={cart.length === 0}
            >
              Confirm Checkout
            </button>
          </div>
        </div>
      </aside>

    </div>
  );
}

export default App;