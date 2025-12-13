import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaShoppingCart, FaCheckCircle, FaClock } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HomeSections from "./HomeSections";

import coffeeBg from "../assets/coffee.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:5000");

function Home({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch menu
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/menu");
        setMenuItems(res.data || []);
        setFilteredMenu(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    const interval = setInterval(fetchMenu, 60000);
    return () => clearInterval(interval);
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) setFilteredMenu(menuItems);
    else {
      const filtered = menuItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMenu(filtered);
    }
  }, [searchTerm, menuItems]);

  // Fetch notifications
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bookings");
        const allNotifications = (res.data || []).map((b) => ({
          id: b.id,
          message: `Booking from ${b.name} for table ${b.table_id}`,
          booking: b,
          status: b.status,
          time: b.created_at,
          viewed: false,
          type: 'booking'
        }));
        setNotifications(allNotifications);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookings();
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders");
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, []);

  // Socket listeners
  useEffect(() => {
    socket.on("newBooking", (booking) => {
      const notification = {
        id: booking.id,
        message: `Booking from ${booking.name} for table ${booking.table_id}`,
        booking,
        status: booking.status,
        time: booking.created_at,
        viewed: false,
        type: 'booking'
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    socket.on("newOrder", (order) => {
      setOrders((prev) => [order, ...prev]);
      toast.success(`New order #${order.id} received!`, { autoClose: 3000 });
    });

    return () => {
      socket.off("newBooking");
      socket.off("newOrder");
    };
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setIsLoggedIn(false);
    navigate("/");
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotifications((prev) => prev.map((n) => ({ ...n, viewed: true })));
    }
  };

  const openFoodDetails = (food) => setSelectedFood(food);
  const closeFoodDetails = () => setSelectedFood(null);
  const closeNotifications = () => setShowNotifications(false);

  // Add to Cart - NO AUTO NAVIGATION
  const handleAddToCart = (item) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      toast.warn("Please log in to add items to cart.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((p) => p.id === item.id);

    if (existing) {
      existing.quantity += 1;
      toast.info(`+1 ${item.name}`, { autoClose: 1500 });
    } else {
      cart.push({
        id: item.id,
        name: item.name,           // From menu.name column
        price: item.price,
        currency: item.currency,
        image: item.image,
        quantity: 1,
      });
      toast.success(`${item.name} added!`, { autoClose: 2000 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    // Stay on page - no navigation
  };

  // Get cart count
  const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus });
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order #${orderId} status updated to ${newStatus}`, { autoClose: 2000 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status", { autoClose: 2000 });
    }
  };

  return (
    <div
      className="home"
      onClick={(e) =>
        e.target.classList.contains("home") && closeNotifications()
      }
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${coffeeBg})`,
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100%",
        color: "#fff",
      }}
    >
      <Navbar
        notifications={notifications.filter((n) => !n.viewed)}
        orders={orders}
        toggleNotifications={toggleNotifications}
        handleLogout={handleLogout}
        cartCount={getCartCount()}
      />

      {/* Hero + Search + View Cart */}
      <div className="hero-search">
        <h1>F&F COFFEE SHOP</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* View Cart Button */}
        {getCartCount() > 0 && (
          <button
            className="btn btn-chocolate view-cart-hero"
            onClick={() => navigate("/cart")}
          >
            <FaShoppingCart /> View Cart ({getCartCount()})
          </button>
        )}
      </div>

      {/* Menu Section */}
      <div className="menu-container">
        {loading ? (
          <div className="full-screen-loader" role="status" aria-label="Loading">
            <div className="loader-circle" aria-hidden="true">
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="loader-dot" style={{ ["--i"]: i }} />
              ))}
            </div>
            <div className="loader-text">LOADING</div>
          </div>
        ) : (
          <>
            <div className="menu-grid">
              {filteredMenu.slice(0, 8).map((item) => (
                <div key={item.id} className="menu-card">
                  <div className="menu-image-container">
                    <img
                      src={"http://localhost:5000" + item.image}
                      alt={item.name}
                      className="menu-image"
                    />
                    <span className="menu-price">
                      {item.currency} {item.price}
                    </span>
                  </div>
                  <div className="menu-details">
                    {/* Food Name - Bold & Clear */}
                    <h4 className="food-name">{item.name}</h4>
                    <div className="menu-buttons">
                      <button
                        className="btn btn-buy"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="btn btn-details"
                        onClick={() => openFoodDetails(item)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="view-full-menu">
              <button
                className="btn btn-chocolate"
                onClick={() => navigate("/menu")}
              >
                View Full Menu
              </button>
            </div>
          </>
        )}
      </div>

      {/* HomeSections Component - Moved to the end of the page */}
      <HomeSections />

      <Footer />

      {/* Food Details Modal */}
      {selectedFood && (
        <div className="modal-overlay" onClick={closeFoodDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeFoodDetails}>
              <FaTimes />
            </button>
            <img
              src={"http://localhost:5000" + selectedFood.image}
              alt={selectedFood.name}
              className="modal-image"
            />
            <h2>{selectedFood.name}</h2>
            <p>{selectedFood.description || "No description available."}</p>
            <p className="modal-price">
              Price: {selectedFood.currency} {selectedFood.price}
            </p>
            <button
              className="btn btn-chocolate"
              onClick={() => {
                handleAddToCart(selectedFood);
                closeFoodDetails();
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Notifications & Orders Modal */}
      {showNotifications && (
        <div className="notifications-modal">
          <div className="notifications-content">
            <div className="notifications-header">
              <h2>Notifications & Orders</h2>
              <button className="close-btn" onClick={closeNotifications}>
                <FaTimes />
              </button>
            </div>

            {/* Bookings Section */}
            <div className="notification-section">
              <h3>Bookings</h3>
              {notifications.length === 0 ? (
                <p className="no-notifications">No bookings</p>
              ) : (
                <div className="notification-table-container">
                  <table className="notification-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Table</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((notification) => (
                        <tr key={notification.id}>
                          <td>#{notification.id}</td>
                          <td>{notification.booking.name}</td>
                          <td>{notification.booking.table_id}</td>
                          <td>
                            <span className={`status-badge ${notification.status}`}>
                              {notification.status}
                            </span>
                          </td>
                          <td>{formatDate(notification.time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Orders Section */}
            <div className="notification-section">
              <h3>Orders</h3>
              {orders.length === 0 ? (
                <p className="no-notifications">No orders</p>
              ) : (
                <div className="notification-table-container">
                  <table className="notification-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.buyerName}</td>
                          <td>{order.items ? order.items.length : 0} items</td>
                          <td>{order.total} RWF</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            {order.status === "pending" && (
                              <button
                                className="btn-approve"
                                onClick={() => updateOrderStatus(order.id, "confirmed")}
                              >
                                <FaCheckCircle />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />

      {/* CSS */}
      <style>{`
        /* Base Styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        
        .home {
          width: 100%;
          min-height: 100vh;
        }
        
        /* Hero Section */
        .hero-search {
          text-align: center;
          padding: 40px 20px 30px;
        }
        
        .hero-search h1 {
          font-size: 2.5rem;
          margin-bottom: 20px;
          text-shadow: 2px 2px 10px #000;
        }
        
        .search-bar {
          display: inline-flex;
          align-items: center;
          max-width: 450px;
          width: 90%;
          padding: 10px 20px;
          border-radius: 25px;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        
        .search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          background: transparent;
        }
        
        .view-cart-hero {
          margin-top: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          padding: 12px 24px;
        }
        
        /* Menu Container */
        .menu-container {
          background: #fff;
          margin: 40px auto;
          padding: 40px 20px 50px;
          border-radius: 20px;
          max-width: 1200px;
          width: 90%;
        }
        
        /* Menu Grid */
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 25px;
        }
        
        /* Menu Cards */
        .menu-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          transition: transform 0.3s;
        }
        
        .menu-card:hover {
          transform: translateY(-8px);
        }
        
        .menu-image-container {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
        }
        
        .menu-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .menu-card:hover .menu-image {
          transform: scale(1.1);
        }
        
        .menu-price {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background-color: rgba(0,0,0,0.8);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: bold;
        }
        
        .menu-details {
          padding: 12px 10px;
          text-align: center;
        }
        
        .food-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 8px 0;
          line-height: 1.3;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .menu-buttons {
          margin-top: 8px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        
        /* Buttons */
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        
        .btn-buy {
          background: #6f4e37;
          color: #fff;
        }
        
        .btn-buy:hover {
          background: #8d6e63;
          transform: translateY(-2px);
        }
        
        .btn-details {
          background: #5d4037;
          color: #fff;
        }
        
        .btn-details:hover {
          background: #6d4c41;
        }
        
        .btn-chocolate {
          background: #5d4037;
          color: #fff;
        }
        
        .btn-chocolate:hover {
          background: #6d4c41;
        }
        
        .view-full-menu {
          text-align: center;
          margin-top: 30px;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 10px;
        }
        
        .modal-content {
          background: #fff;
          color: #333;
          border-radius: 15px;
          padding: 20px 25px;
          max-width: 450px;
          width: 90%;
          max-height: 90%;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          text-align: center;
        }
        
        .modal-image {
          width: 100%;
          height: 230px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 15px;
        }
        
        .close-btn {
          position: absolute;
          top: 10px;
          right: 15px;
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          color: #333;
        }
        
        .modal-price {
          font-weight: bold;
          color: #6f4e37;
          margin-top: 10px;
        }
        
        /* Notifications Modal */
        .notifications-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .notifications-content {
          background: linear-gradient(135deg, #3e2723 0%, #6d4c41 50%, #8d6e63 100%);
          border-radius: 20px;
          width: 100%;
          max-width: 900px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 15px 35px rgba(62, 39, 35, 0.4);
        }
        
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .notifications-header h2 {
          color: #fff8e1;
          margin: 0;
          font-size: 1.8rem;
        }
        
        .notifications-header .close-btn {
          color: #fff8e1;
          font-size: 24px;
          position: static;
        }
        
        .notification-section {
          padding: 20px 25px;
        }
        
        .notification-section h3 {
          color: #fff8e1;
          margin: 0 0 15px 0;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .notification-table-container {
          overflow-x: auto;
        }
        
        .notification-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        
        .notification-table th {
          background: rgba(93, 64, 55, 0.8);
          color: #fff8e1;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
        }
        
        .notification-table td {
          padding: 12px 15px;
          color: #efebe9;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notification-table tr:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-block;
        }
        
        .status-badge.pending {
          background: rgba(255, 193, 7, 0.3);
          color: #fff8e1;
        }
        
        .status-badge.confirmed {
          background: rgba(76, 175, 80, 0.3);
          color: #fff8e1;
        }
        
        .status-badge.paid {
          background: rgba(3, 169, 244, 0.3);
          color: #fff8e1;
        }
        
        .status-badge.completed {
          background: rgba(156, 39, 176, 0.3);
          color: #fff8e1;
        }
        
        .status-badge.cancelled {
          background: rgba(244, 67, 54, 0.3);
          color: #fff8e1;
        }
        
        .btn-approve {
          background: linear-gradient(90deg, #6d4c41 0%, #8d6e63 100%);
          color: #fff8e1;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .btn-approve:hover {
          background: linear-gradient(90deg, #795548 0%, #a1887f 100%);
          transform: scale(1.1);
        }
        
        .no-notifications {
          color: #d7ccc8;
          text-align: center;
          padding: 20px;
          font-style: italic;
        }
        
        /* Loader Styles */
        .full-screen-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }
        
        .loader-circle {
          position: relative;
          width: 120px;
          height: 120px;
        }
        
        .loader-dot {
          position: absolute;
          top: 0;
          left: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #6f4e37;
          transform: translateX(-50%);
          animation: rotate 2s infinite linear;
          animation-delay: calc(var(--i) * 0.1s);
        }
        
        .loader-text {
          margin-top: 20px;
          font-size: 18px;
          font-weight: bold;
          color: #6f4e37;
        }
        
        @keyframes rotate {
          0% {
            transform: translateX(-50%) rotate(0deg) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) rotate(360deg) translateY(50px);
            opacity: 0;
          }
        }
        
        /* Media Queries */
        
        /* Large Desktop (1201px and up) */
        @media (min-width: 1201px) {
          .hero-search h1 {
            font-size: 3.5rem;
          }
          
          .menu-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .menu-image-container {
            height: 200px;
          }
        }
        
        /* Small Desktop/Laptop (901px to 1200px) */
        @media (min-width: 901px) and (max-width: 1200px) {
          .hero-search h1 {
            font-size: 3rem;
          }
          
          .menu-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .menu-image-container {
            height: 180px;
          }
        }
        
        /* Tablet (601px to 900px) */
        @media (min-width: 601px) and (max-width: 900px) {
          .hero-search {
            padding: 30px 15px 20px;
          }
          
          .hero-search h1 {
            font-size: 2.5rem;
          }
          
          .search-bar {
            max-width: 90%;
          }
          
          .menu-container {
            padding: 30px 15px 40px;
          }
          
          .menu-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .menu-image-container {
            height: 160px;
          }
          
          .food-name {
            font-size: 1rem;
          }
          
          .modal-content {
            max-width: 80%;
          }
        }
        
        /* Mobile (600px and below) */
        @media (max-width: 600px) {
          .hero-search {
            padding: 20px 10px 15px;
          }
          
          .hero-search h1 {
            font-size: 2rem;
          }
          
          .search-bar {
            max-width: 100%;
            padding: 8px 15px;
          }
          
          .search-bar input {
            font-size: 14px;
          }
          
          .view-cart-hero {
            font-size: 0.9rem;
            padding: 10px 18px;
          }
          
          .menu-container {
            margin: 20px auto;
            padding: 20px 10px 30px;
            width: 95%;
          }
          
          .menu-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .menu-image-container {
            height: 180px;
          }
          
          .food-name {
            font-size: 1rem;
            min-height: 30px;
          }
          
          .menu-buttons {
            gap: 8px;
          }
          
          .btn {
            padding: 6px 12px;
            font-size: 14px;
          }
          
          .modal-content {
            max-width: 95%;
            padding: 15px;
          }
          
          .modal-image {
            height: 180px;
          }
          
          .notifications-content {
            max-width: 95%;
            max-height: 90vh;
          }
          
          .notifications-header {
            padding: 15px;
          }
          
          .notifications-header h2 {
            font-size: 1.5rem;
          }
          
          .notification-section {
            padding: 15px;
          }
          
          .notification-section h3 {
            font-size: 1.2rem;
          }
          
          .notification-table th,
          .notification-table td {
            padding: 8px 10px;
            font-size: 0.9rem;
          }
          
          .loader-circle {
            width: 100px;
            height: 100px;
          }
          
          .loader-text {
            font-size: 16px;
          }
        }
        
        /* Extra Small Mobile (320px to 480px) */
        @media (max-width: 480px) {
          .hero-search h1 {
            font-size: 1.8rem;
          }
          
          .search-bar input {
            font-size: 13px;
          }
          
          .view-cart-hero {
            font-size: 0.8rem;
            padding: 8px 15px;
          }
          
          .menu-image-container {
            height: 160px;
          }
          
          .food-name {
            font-size: 0.9rem;
          }
          
          .btn {
            padding: 5px 10px;
            font-size: 13px;
          }
          
          .modal-content {
            padding: 10px;
          }
          
          .modal-image {
            height: 150px;
          }
          
          .notification-table th,
          .notification-table td {
            padding: 6px 8px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;