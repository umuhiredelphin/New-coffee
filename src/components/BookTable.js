import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaChair,
  FaCheckCircle,
  FaTimes,
  FaArrowLeft,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import Navbar from "./Navbar";

export default function BookTable() {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [orderFood, setOrderFood] = useState("No");
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [modalFood, setModalFood] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setName(user.username);
      setEmail(user.email);
    }
    fetchTables();
    fetchMenu();
  }, []);

  useEffect(() => {
    // update body bg so entire app follows theme
    document.body.style.backgroundColor =
      theme === "dark" ? "#121212" : "#f5f5f5";
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetchTables = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tables");
      setTables(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/menu");
      setMenuItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookNow = (tableId) => {
    setSelectedTable(tableId);
    setShowForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 10 || !numPeople)
      return alert("Please fill all required fields correctly.");

    if (orderFood === "Yes") {
      setShowForm(false);
      setShowMenu(true);
    } else {
      try {
        await axios.post("http://localhost:5000/api/bookings", {
          table_id: selectedTable,
          name,
          email,
          phone,
          num_people: numPeople,
          order_food: orderFood,
          foods: [],
        });
        alert("Table booked successfully!");
        resetForm();
      } catch (err) {
        console.error(err);
        alert("Booking failed.");
      }
    }
  };

  const handleFoodSelection = (item) => {
    const exists = selectedFoods.find((f) => f.id === item.id);
    if (exists) {
      setSelectedFoods(selectedFoods.filter((f) => f.id !== item.id));
    } else {
      setSelectedFoods([...selectedFoods, { ...item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id, quantity) => {
    setSelectedFoods(
      selectedFoods.map((f) => (f.id === id ? { ...f, quantity } : f))
    );
  };

  const handleConfirmOrder = async () => {
    try {
      await axios.post("http://localhost:5000/api/bookings", {
        table_id: selectedTable,
        name,
        email,
        phone,
        num_people: numPeople,
        order_food: orderFood,
        foods: selectedFoods,
      });
      alert("Table booked & order placed successfully!");
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Order failed.");
    }
  };

  const resetForm = () => {
    setSelectedTable(null);
    setPhone("");
    setNumPeople(1);
    setOrderFood("No");
    setSelectedFoods([]);
    setShowForm(false);
    setShowMenu(false);
  };

  // Theme colors
  const colors = {
    background: theme === "dark" ? "#1e1e1e" : "#ffffff",
    text: theme === "dark" ? "#ffffff" : "#333333",
    primary: "#6f4e37",
    card: theme === "dark" ? "#292929" : "#f0f0f0",
    inputBg: theme === "dark" ? "#2c2c2c" : "#fff",
    inputText: theme === "dark" ? "#fff" : "#000",
  };

  return (
    <div
      style={{
        backgroundColor: theme === "dark" ? "#121212" : "#fafafa",
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
        color: colors.text,
        transition: "0.35s",
      }}
    >
      <Navbar />

      {/* Floating Vertical Theme Switch (right-side, centered vertically) */}
      <div style={{ ...floatingPillStyle, background: theme === "dark" ? "#1b1b1b" : "#ffffff", boxShadow: theme === "dark" ? "0 6px 20px rgba(0,0,0,0.6)" : "0 6px 20px rgba(0,0,0,0.12)" }}>
        {/* Light button (top) */}
        <button
          aria-label="Switch to light theme"
          title="Light mode"
          onClick={() => setTheme("light")}
          style={{
            ...pillIconStyle,
            background: theme === "light" ? "linear-gradient(135deg,#fff8ec,#ffe6c2)" : "transparent",
            border: theme === "light" ? `2px solid ${colors.primary}` : "2px solid transparent",
            transform: theme === "light" ? "scale(1.05)" : "scale(1)",
          }}
        >
          <FaSun color={theme === "light" ? "#f39c12" : (theme === "dark" ? "#bfbfbf" : "#f39c12")} />
        </button>

        {/* Divider */}
        <div style={{ width: "60%", height: 1, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", margin: "6px 0" }} />

        {/* Dark button (bottom) */}
        <button
          aria-label="Switch to dark theme"
          title="Dark mode"
          onClick={() => setTheme("dark")}
          style={{
            ...pillIconStyle,
            background: theme === "dark" ? "linear-gradient(135deg,#1f2a44,#122033)" : "transparent",
            border: theme === "dark" ? `2px solid ${colors.primary}` : "2px solid transparent",
            transform: theme === "dark" ? "scale(1.05)" : "scale(1)",
          }}
        >
          <FaMoon color={theme === "dark" ? "#f1c40f" : (theme === "light" ? "#6b7280" : "#f1c40f")} />
        </button>
      </div>

      {/* Tables Section */}
      {!showForm && !showMenu && (
        <>
          <h2
            style={{
              textAlign: "center",
              color: colors.primary,
              margin: "20px 0",
            }}
          >
            <FaChair /> Book a Table
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              margin: "0 20px 40px",
            }}
          >
            {tables.map((t) => (
              <div
                key={t.id}
                style={{
                  backgroundColor: colors.card,
                  padding: "15px",
                  borderRadius: "12px",
                  textAlign: "center",
                  cursor: "pointer",
                  boxShadow:
                    theme === "dark"
                      ? "0 0 10px rgba(255,255,255,0.03)"
                      : "0 0 10px rgba(0,0,0,0.06)",
                  transition: "0.3s",
                }}
              >
                {t.image && (
                  <img
                    src={`http://localhost:5000${t.image}`}
                    alt={`Table ${t.number}`}
                    style={{
                      width: "100%",
                      height: "130px",
                      borderRadius: "10px",
                      objectFit: "cover",
                    }}
                  />
                )}
                <h4 style={{ marginTop: "10px", color: colors.text }}>
                  Table #{t.number}
                </h4>
                <button
                  style={{ ...bookNowBtnStyle, backgroundColor: colors.primary }}
                  onClick={() => handleBookNow(t.id)}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Booking Form */}
      {showForm && (
        <div style={centeredFormStyle}>
          <div
            style={{
              ...formStyle,
              backgroundColor: colors.background,
              color: colors.text,
            }}
          >
            <button
              style={{ ...closeBtnStyle, color: colors.text }}
              onClick={() => setShowForm(false)}
            >
              <FaTimes />
            </button>
            <h3 style={{ color: colors.primary, textAlign: "center" }}>
              Book Table #
              {tables.find((t) => t.id === selectedTable)?.number}
            </h3>

            <form onSubmit={handleBookingSubmit}>
              <label style={{ ...labelStyle, color: colors.primary }}>Your Name:</label>
              <input type="text" value={name} readOnly style={{ ...inputStyle, backgroundColor: colors.inputBg, color: colors.inputText }} />

              <label style={{ ...labelStyle, color: colors.primary }}>Email:</label>
              <input type="email" value={email} readOnly style={{ ...inputStyle, backgroundColor: colors.inputBg, color: colors.inputText }} />

              <label style={{ ...labelStyle, color: colors.primary }}>Phone Number:</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} style={{ ...inputStyle, backgroundColor: colors.inputBg, color: colors.inputText }} required />

              <label style={{ ...labelStyle, color: colors.primary }}>Number of People:</label>
              <input type="number" value={numPeople} onChange={(e) => setNumPeople(e.target.value)} min={1} style={{ ...inputStyle, backgroundColor: colors.inputBg, color: colors.inputText }} required />

              <label style={{ ...labelStyle, color: colors.primary }}>Order Food Now?</label>
              <select value={orderFood} onChange={(e) => setOrderFood(e.target.value)} style={{ ...inputStyle, backgroundColor: colors.inputBg, color: colors.inputText }}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>

              <button type="submit" style={{ ...submitBtnStyle, backgroundColor: colors.primary }}>
                <FaCheckCircle /> Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Food Menu Section */}
      {showMenu && (
        <div style={{ padding: "20px" }}>
          <button style={backBtnStyle} onClick={() => { setShowMenu(false); setShowForm(true); }}>
            <FaArrowLeft /> Back
          </button>
          <h2 style={{ textAlign: "center", color: colors.primary }}>Select Food Items</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", maxHeight: "500px", overflowY: "auto" }}>
            {menuItems.map(item => (
              <div key={item.id} style={{ backgroundColor: colors.card, padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                {item.image && <img src={`http://localhost:5000${item.image}`} alt={item.name} style={{ width: "100%", height: "100px", borderRadius: "6px", objectFit: "cover", cursor: "pointer" }} onClick={() => setModalFood(item)} />}
                <p style={{ color: colors.text, margin: "5px 0" }}>{item.name}</p>
                <p style={{ color: colors.text }}>{item.price} {item.currency}</p>
                <input type="checkbox" checked={selectedFoods.some(f => f.id === item.id)} onChange={() => handleFoodSelection(item)} /> Select
                {selectedFoods.some(f => f.id === item.id) && (
                  <input type="number" min={1} value={selectedFoods.find(f => f.id === item.id).quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))} style={{ width: "50px", marginTop: "5px" }} />
                )}
              </div>
            ))}
          </div>

          <button style={{ ...submitBtnStyle, marginTop: "20px", backgroundColor: colors.primary }} onClick={handleConfirmOrder}><FaCheckCircle /> Confirm Order</button>
        </div>
      )}

      {/* Modal */}
      {modalFood && (
        <div style={modalStyle}>
          <div style={{ ...modalContentStyle, backgroundColor: colors.background, color: colors.text }}>
            <button style={closeBtnStyle} onClick={() => setModalFood(null)}><FaTimes /></button>
            <h3 style={{ color: colors.primary }}>{modalFood.name}</h3>
            {modalFood.image && <img src={`http://localhost:5000${modalFood.image}`} alt={modalFood.name} style={{ width: "100%", borderRadius: "10px", marginBottom: "10px" }} />}
            <p style={{ color: colors.text }}>{modalFood.description}</p>
            <p style={{ color: colors.text, fontWeight: "bold" }}>{modalFood.price} {modalFood.currency}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const centeredFormStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh",
};
const formStyle = {
  padding: "25px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "500px",
  position: "relative",
  transition: "0.4s",
};
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "bold",
};
const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  marginBottom: "15px",
  transition: "0.3s",
};
const submitBtnStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};
const bookNowBtnStyle = {
  marginTop: "10px",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "none",
  color: "#fff",
  cursor: "pointer",
};
const closeBtnStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
};
const backBtnStyle = { marginBottom: "10px", padding: "6px 12px", borderRadius: "6px", border: "none", backgroundColor: "#6f4e37", color: "#fff", cursor: "pointer" };
const modalStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.65)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContentStyle = { padding: "20px", borderRadius: "12px", width: "90%", maxWidth: "400px", position: "relative" };

// --- Floating pill / icon styles for theme toggle ---
const floatingPillStyle = {
  position: "fixed",
  right: 14,
  top: "50%",
  transform: "translateY(-50%)",
  borderRadius: 999,
  padding: "8px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  zIndex: 1200,
  transition: "0.25s",
};

const pillIconStyle = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  border: "2px solid transparent",
  transition: "transform 0.18s, background 0.25s, border 0.18s",
};
