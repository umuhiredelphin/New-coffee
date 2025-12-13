import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import Navbar from "./Navbar";
import { FaShoppingCart } from "react-icons/fa";

const socket = io("http://localhost:5000"); // connect to socket server

function BuyNow({ setNotifications }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [buyerName, setBuyerName] = useState(""); // auto-filled
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Mobile Money");
  const [orderType, setOrderType] = useState("Commandé");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Auto-fill user name from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    setBuyerName(user.username || "Anonymous");
  }, []);

  // Fetch selected food by ID
  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/menu/${id}`);
        setFood(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id]);

  // Handle adding to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    setMessage("");

    if (quantity < 1) {
      setMessage("❌ Quantity must be at least 1.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = { ...food, quantity, paymentMethod, orderType };
    localStorage.setItem("cart", JSON.stringify([...cart, item]));

    // Send notification via socket
    const notification = {
      id: Date.now(),
      message: `${buyerName} added ${food.name} (x${quantity}) to cart`,
      time: new Date(),
      viewed: false,
    };
    socket.emit("newNotification", notification);
    setNotifications && setNotifications(prev => [notification, ...prev]);

    // Show message with visible cart button
    setMessage(
      <div style={styles.messageContainer}>
        <span>🎉 Added to cart! </span>
        <button
          style={styles.cartButton}
          onClick={() => navigate("/cart")}
        >
          <FaShoppingCart style={{ marginRight: "6px" }} /> Go to Cart
        </button>
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}>Loading...</div>;
  if (!food) return <div style={{ textAlign: "center", padding: "100px", color: "red" }}>Item not found!</div>;

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <img
            src={`http://localhost:5000${food.image}`}
            alt={food.name}
            style={styles.image}
          />
          <h2 style={styles.title}>{food.name}</h2>
          <p style={styles.price}>{food.currency} {food.price}</p>
          <p style={styles.desc}>{food.description || "No description available."}</p>

          <form onSubmit={handleAddToCart} style={styles.form}>
            {/* Buyer Name */}
            <label style={styles.label}>Buyer Name</label>
            <input
              type="text"
              value={buyerName}
              readOnly
              style={{ ...styles.input, backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
            />

            {/* Quantity */}
            <label style={styles.label}>Quantity</label>
            <input
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
              style={styles.input}
            />

            {/* Payment Method */}
            <label style={styles.label}>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={styles.select}
            >
              <option value="Mobile Money">Mobile Money</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>

            {/* Order Type */}
            <label style={styles.label}>Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              style={styles.select}
            >
              <option value="Commandé">Commandé (Pre-order)</option>
              <option value="Be Ordered">Be Ordered (Immediate)</option>
            </select>

            <button type="submit" style={styles.button}>Add to Cart</button>
          </form>

          {message && <div style={{ marginTop: "15px" }}>{message}</div>}

          <button onClick={() => navigate(-1)} style={styles.backButton}>← Go Back</button>
        </div>
      </div>
    </div>
  );
}

// Inline CSS
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "90vh",
    padding: "30px",
    background: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1950&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "30px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  image: { width: "100%", height: "250px", borderRadius: "12px", objectFit: "cover", marginBottom: "15px" },
  title: { color: "#6f4e37", fontSize: "28px", marginBottom: "8px" },
  price: { color: "#444", fontWeight: "bold", fontSize: "18px", marginBottom: "10px" },
  desc: { fontSize: "15px", color: "#555", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  label: { fontSize: "14px", fontWeight: "500", marginBottom: "4px", color: "#333", textAlign: "left" },
  input: { padding: "10px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "16px" },
  select: { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" },
  button: { backgroundColor: "#6f4e37", color: "#fff", padding: "12px", border: "none", borderRadius: "10px", fontSize: "18px", cursor: "pointer", transition: "0.3s" },
  backButton: { backgroundColor: "#ddd", color: "#333", padding: "10px", border: "none", borderRadius: "8px", fontSize: "16px", marginTop: "15px", cursor: "pointer" },
  messageContainer: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  cartButton: {
    backgroundColor: "#6f4e37",
    color: "#fff",
    padding: "6px 12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "0.3s"
  },
  message: { marginTop: "15px", fontWeight: "bold", color: "#6f4e37" },
};

export default BuyNow;
