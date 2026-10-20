import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaChair,
  FaCheckCircle,
  FaTimes,
  FaArrowLeft,
  FaPhone,
  FaUsers,
  FaUtensils,
  FaConciergeBell,
} from "react-icons/fa";
import Navbar from "./Navbar";
import CoffeeLoader from "./CoffeeLoader";

export default function BookTable() {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [orderFood, setOrderFood] = useState("No");
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [modalFood, setModalFood] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setName(user.username);
      setEmail(user.email);
    }
    Promise.all([fetchTables(), fetchMenu()]).finally(() => setLoading(false));
  }, []);

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
    if (!phone || phone.length < 10 || !numPeople) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    if (orderFood === "Yes") {
      setShowForm(false);
      setShowMenu(true);
    } else {
      setSubmitting(true);
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
        toast.success("Table booked successfully!");
        resetForm();
      } catch (err) {
        console.error(err);
        toast.error("Booking failed. Please try again.");
      } finally {
        setSubmitting(false);
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
    setSubmitting(true);
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
      toast.success("Table booked & order placed successfully!");
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Order failed. Please try again.");
    } finally {
      setSubmitting(false);
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

  const getImage = (path) => path ? `http://localhost:5000${path}` : null;

  if (loading) return <CoffeeLoader message="Loading tables..." />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 font-poppins">
      <Navbar />

      <div className="pt-20 pb-6 px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gold-500/10 rounded-full mb-3">
            <FaConciergeBell className="text-gold-400 text-2xl" />
          </div>
          <h1 className="text-3xl font-playfair font-bold text-gold-400">
            Book a Table
          </h1>
          <p className="text-cream-300 text-sm mt-1">
            Reserve your spot at F&F Coffee Shop
          </p>
        </div>

        {/* Tables Section */}
        {!showForm && !showMenu && (
          <>
            {tables.length === 0 ? (
              <div className="text-center py-12">
                <FaChair className="text-5xl text-espresso-600 mx-auto mb-4" />
                <p className="text-cream-300">No tables available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
                {tables.map((t) => (
                  <div
                    key={t.id}
                    className="bg-espresso-800/40 backdrop-blur-sm rounded-xl border border-espresso-700/30 hover:border-gold-400/50 transition-all duration-300 overflow-hidden group"
                  >
                    {t.table_image && (
                      <div className="w-full h-24 overflow-hidden">
                        <img
                          src={t.table_image}
                          alt={`Table ${t.table_number}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-3 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-gold-500/10 rounded-full mb-2">
                        <FaChair className="text-gold-400 text-sm" />
                      </div>
                      <h4 className="text-cream-50 font-semibold text-sm">
                        Table #{t.table_number}
                      </h4>
                      <button
                        className="mt-2 w-full px-3 py-1.5 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold text-xs rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold-400/25"
                        onClick={() => handleBookNow(t.id)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Booking Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-espresso-800/60 backdrop-blur-xl rounded-2xl border border-espresso-700/50 w-full max-w-md p-6 relative shadow-2xl animate-fade-in-up">
              <button
                className="absolute top-3 right-3 text-cream-50/60 hover:text-cream-50 transition-colors"
                onClick={() => setShowForm(false)}
              >
                <FaTimes />
              </button>
              <div className="text-center mb-5">
                <FaChair className="text-gold-400 text-2xl mx-auto mb-2" />
                <h3 className="text-gold-400 font-playfair text-xl font-bold">
                  Table #{tables.find((t) => t.id === selectedTable)?.table_number}
                </h3>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-3">
                <div>
                  <label className="block text-gold-400 text-xs font-semibold mb-1">Your Name</label>
                  <input type="text" value={name} readOnly className="w-full px-3 py-2.5 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-lg focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 focus:outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-gold-400 text-xs font-semibold mb-1">Email</label>
                  <input type="email" value={email} readOnly className="w-full px-3 py-2.5 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-lg focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 focus:outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-gold-400 text-xs font-semibold mb-1">
                    <FaPhone className="inline mr-1 text-[10px]" /> Phone Number
                  </label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} required placeholder="e.g. 0788123456" className="w-full px-3 py-2.5 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-lg focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 focus:outline-none transition-all text-sm placeholder-espresso-500" />
                </div>
                <div>
                  <label className="block text-gold-400 text-xs font-semibold mb-1">
                    <FaUsers className="inline mr-1 text-[10px]" /> Number of People
                  </label>
                  <input type="number" value={numPeople} onChange={(e) => setNumPeople(Math.max(1, e.target.value))} min={1} required className="w-full px-3 py-2.5 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-lg focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 focus:outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-gold-400 text-xs font-semibold mb-1">
                    <FaUtensils className="inline mr-1 text-[10px]" /> Order Food Now?
                  </label>
                  <select value={orderFood} onChange={(e) => setOrderFood(e.target.value)} className="w-full px-3 py-2.5 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded-lg focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 focus:outline-none transition-all text-sm">
                    <option value="No">No, just book the table</option>
                    <option value="Yes">Yes, I'd like to order food too</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold-400/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                  {submitting ? "Processing..." : <><FaCheckCircle /> Confirm Booking</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Food Menu Selection */}
        {showMenu && (
          <div className="max-w-5xl mx-auto">
            <button
              className="mb-4 px-4 py-2 bg-espresso-800/50 text-cream-50 rounded-lg border border-espresso-700/50 hover:bg-espresso-700/50 transition-all text-sm flex items-center gap-2"
              onClick={() => { setShowMenu(false); setShowForm(true); }}
            >
              <FaArrowLeft /> Back to Booking
            </button>
            <h2 className="text-center text-gold-400 font-playfair text-2xl mb-5">Select Food Items</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {menuItems.map(item => (
                <div key={item._id} className="bg-espresso-800/40 backdrop-blur-sm rounded-xl border border-espresso-700/30 p-3 text-center transition-all hover:border-gold-400/50">
                  {item.image && (
                    <img
                      src={getImage(item.image)}
                      alt={item.name}
                      className="w-full h-16 object-cover rounded-lg cursor-pointer mb-2"
                      onClick={() => setModalFood(item)}
                    />
                  )}
                  <p className="text-cream-50 text-xs font-medium truncate">{item.name}</p>
                  <p className="text-gold-400 text-xs font-bold">{item.price} {item.currency}</p>
                  <label className="text-cream-50 text-[10px] flex items-center justify-center gap-1 mt-1.5 cursor-pointer">
                    <input type="checkbox" checked={selectedFoods.some(f => f.id === item._id)} onChange={() => handleFoodSelection(item)} className="accent-gold-400 w-3 h-3" />
                    Select
                  </label>
                  {selectedFoods.some(f => f.id === item._id) && (
                    <input type="number" min={1} value={selectedFoods.find(f => f.id === item._id).quantity} onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)} className="w-14 mt-1.5 px-2 py-1 bg-espresso-900/50 border border-espresso-700 text-cream-50 rounded text-xs text-center focus:border-gold-400 focus:outline-none" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-5">
              <button
                disabled={submitting || selectedFoods.length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold-400/25 flex items-center gap-2 mx-auto text-sm disabled:opacity-50"
                onClick={handleConfirmOrder}
              >
                <FaCheckCircle /> {submitting ? "Processing..." : `Confirm Order (${selectedFoods.length} items)`}
              </button>
            </div>
          </div>
        )}

        {/* Food Detail Modal */}
        {modalFood && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-espresso-800/60 backdrop-blur-xl rounded-2xl border border-espresso-700/50 w-full max-w-sm p-5 relative shadow-2xl animate-fade-in-up">
              <button className="absolute top-3 right-3 text-cream-50/60 hover:text-cream-50 transition-colors" onClick={() => setModalFood(null)}>
                <FaTimes />
              </button>
              <h3 className="text-gold-400 font-playfair text-lg font-bold mb-3">{modalFood.name}</h3>
              {modalFood.image && (
                <img src={getImage(modalFood.image)} alt={modalFood.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <p className="text-cream-200 text-sm">{modalFood.description || "No description available."}</p>
              <p className="text-gold-400 font-bold text-base mt-2">{modalFood.price} {modalFood.currency}</p>
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </div>
  );
}
