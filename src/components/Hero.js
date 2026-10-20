import React from "react";
import { Link } from "react-router-dom";

export default function Home({ setIsLoggedIn }) {
  const menuItems = [
    { id: 1, name: "Espresso", price: "$3.50", img: "https://via.placeholder.com/300.png?text=Espresso" },
    { id: 2, name: "Croissant", price: "$2.00", img: "https://via.placeholder.com/300.png?text=Croissant" },
    { id: 3, name: "Green Tea", price: "$2.50", img: "https://via.placeholder.com/300.png?text=Green+Tea" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = "/"; // send back to Index (login/signup page)
  };

  return (
    <div className="home">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1>☕ F&F Coffee Shop</h1>
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><a href="#menu">View Menu</a></li>
          <li><a href="#menu">Book Table</a></li>
          <li><a href="#menu">About Us</a></li>
          <li><button onClick={handleLogout} className="btn logout-btn">Logout</button></li>
        </ul>
      </nav>

      {/* Banner */}
      <section className="banner">
        <div className="banner-overlay">
          <h2>Welcome back to F&F Coffee Shop</h2>
          <p>Your favorite place for coffee, snacks, and more.</p>
          <a href="#menu" className="btn">View Menu</a>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="section">
        <h3>Our Menu</h3>
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-card">
              <img src={item.img} alt={item.name} />
              <h4>{item.name}</h4>
              <p>{item.price}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <Link to={`/buy/${item.id}`} className="btn">Buy</Link>
                <Link to={`/details/${item.id}`} className="btn">Details</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
        <p>© {new Date().getFullYear()} F&F Coffee Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}
