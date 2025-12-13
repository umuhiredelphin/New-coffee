import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import axios from "axios";
import { FaTrash, FaEdit, FaSun, FaMoon } from "react-icons/fa";

export default function AddMenu() {
  const [form, setForm] = useState({
    id: null,
    name: "",
    type: "food",
    category: "breakfast",
    price: "",
    currency: "RWF",
    image: null,
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [view, setView] = useState("form");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (view === "manage") fetchMenu();
  }, [view]);

  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/menu");
      setMenuItems(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch menu items.");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));

      if (form.id) {
        await axios.put(`http://localhost:5000/api/menu/${form.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Menu item updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/menu", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Menu item added successfully!");
      }

      setForm({
        id: null,
        name: "",
        type: "food",
        category: "breakfast",
        price: "",
        currency: "RWF",
        image: null,
        description: ""
      });
      setView("manage");
      fetchMenu();
    } catch (err) {
      console.error(err);
      alert("Failed to save menu item.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/menu/${id}`);
      alert("Menu item deleted successfully.");
      fetchMenu();
    } catch (err) {
      console.error(err);
      alert("Failed to delete menu item.");
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      name: item.name,
      type: item.type,
      category: item.category,
      price: item.price,
      currency: item.currency,
      image: null,
      description: item.description
    });
    setView("form");
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Color variables
  const pageBg = darkMode ? "#1a1a2e" : "#f0f8ff";
  const textColor = darkMode ? "#f0f8ff" : "#1a1a2e";
  const tableHeaderBg = darkMode ? "#162447" : "#4a90e2";
  const tableRowBg = darkMode ? "#1f4068" : "#ffffff";

  return (
    <div className="admin-container" style={{ display: "flex", minHeight: "100vh", backgroundColor: pageBg, color: textColor }}>
      <Sidebar />
      <div className="add-menu-page" style={{ flex: 1, padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: textColor }}>Menu Management</h2>
          <button onClick={toggleDarkMode} style={toggleButtonStyle} title="Toggle Dark/Light Mode">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
          <button onClick={() => setView("form")} style={buttonStyle}>Add / Edit Menu Item</button>
          <button onClick={() => setView("manage")} style={buttonStyle}>Manage Menu</button>
        </div>

        {view === "form" && (
          <form onSubmit={handleSubmit} style={{ ...formStyle, backgroundColor: darkMode ? "#162447" : "#ffffff", color: textColor }}>
            <label>Food Name:</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter food name" required style={inputStyle} />

            <label>Type:</label>
            <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
              <option value="food">Food</option>
              <option value="drink">Drink</option>
            </select>

            <label>Category:</label>
            <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>

            <label>Price:</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Enter price" required style={inputStyle} />

            <label>Currency:</label>
            <select name="currency" value={form.currency} onChange={handleChange} style={inputStyle}>
              <option value="RWF">RWF</option>
              <option value="$">USD</option>
            </select>

            <label>Image:</label>
            <input type="file" name="image" onChange={handleChange} accept="image/*" style={{ marginBottom: "10px" }} />

            <label>Description:</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter description" rows="4" style={inputStyle} />

            <button type="submit" style={{ ...buttonStyle, width: "100%", marginTop: "10px", background: darkMode ? "#e94560" : "#77a8a8" }}>
              {loading ? "Saving..." : form.id ? "Update Menu Item" : "Add Menu Item"}
            </button>
          </form>
        )}

        {view === "manage" && (
          <div>
            {menuItems.length === 0 ? <p>No menu items available.</p> :
              <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: "10px", overflow: "hidden" }}>
                <thead>
                  <tr style={{ backgroundColor: tableHeaderBg, color: "white" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Price</th>
                    <th style={thStyle}>Image</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item, index) => (
                    <tr key={item.id} style={{ textAlign: "center", backgroundColor: index % 2 === 0 ? tableRowBg : darkMode ? "#1b2a49" : "#f5f5f5" }}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.type}</td>
                      <td>{item.category}</td>
                      <td>{item.currency} {item.price}</td>
                      <td>{item.image && <img src={`http://localhost:5000${item.image}`} alt={item.name} width="50" style={{ borderRadius: "5px" }} />}</td>
                      <td style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                        <button onClick={() => handleEdit(item)} style={{ ...iconButtonStyle, backgroundColor: "#00b894" }} title="Edit"><FaEdit /></button>
                        <button onClick={() => handleDelete(item.id)} style={{ ...iconButtonStyle, backgroundColor: "#d63031" }} title="Delete"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  boxSizing: "border-box"
};

const buttonStyle = {
  padding: "8px 16px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold"
};

const toggleButtonStyle = {
  ...buttonStyle,
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  color: "inherit"
};

const formStyle = {
  maxWidth: "600px",
  margin: "auto",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
};

const thStyle = {
  padding: "10px",
  textAlign: "center",
  borderBottom: "1px solid #ccc"
};

const iconButtonStyle = {
  padding: "6px 10px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  color: "white",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
