import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Navbar from "../components/Navbar";
import CoffeeLoader from "../components/CoffeeLoader";
import { FiSearch, FiShoppingCart, FiHeart, FiPlus } from "react-icons/fi";

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [addedItems, setAddedItems] = useState({});
  const [categories, setCategories] = useState([{ id: "all", name: "All" }]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/menu");
        const items = response.data.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          currency: item.currency || 'RWF',
          description: item.description,
          image: item.image ? `http://localhost:5000${item.image}` : null,
          category: item.category || 'coffee',
          rating: item.rating || 0,
          isNew: item.isNew || false,
          isPopular: item.isPopular || false,
        }));
        
        setMenuItems(items);
        setFilteredItems(items);
        
        const categoryMap = {};
        items.forEach(item => {
          const cat = item.category || 'other';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        
        const uniqueCategories = [
          { id: "all", name: `All (${items.length})` },
          ...Object.entries(categoryMap).map(([name, count]) => ({
            id: name,
            name: `${name.charAt(0).toUpperCase() + name.slice(1)} (${count})`
          }))
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        toast.error("Failed to load menu items");
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchMenuItems();
  }, []);

  useEffect(() => {
    let filtered = [...menuItems];
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory]);

  const handleAddToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    setAddedItems({ ...addedItems, [item.id]: true });
    toast.success(`${item.name} added to cart!`, { position: "bottom-right", autoClose: 2000 });
    setTimeout(() => {
      setAddedItems({ ...addedItems, [item.id]: false });
    }, 2000);
  };

  const toggleFavorite = (itemId) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getPlaceholderImage = (category) => {
    const images = {
      coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
      pastry: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop",
      sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=300&fit=crop",
      dessert: "https://images.unsplash.com/photo-1563729768-6af58466dfd9?w=300&h=300&fit=crop",
      snack: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&h=300&fit=crop",
      beverage: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=300&fit=crop"
    };
    return images[category] || images.coffee;
  };

  const getImage = (item) => {
    if (item.image) return item.image;
    return getPlaceholderImage(item.category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950">
      <Navbar />

      <header className="relative pt-20 pb-4 px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gold-500/10 rounded-full mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-playfair font-bold text-gold-400 tracking-wide">
            Our Menu
          </h1>
          <p className="text-cream-300 mt-1 text-sm">
            Browse our selection of premium coffee & food
          </p>
        </div>
      </header>

      <div className="px-4 pb-3 max-w-5xl mx-auto">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-300 w-4 h-4" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-espresso-800/50 backdrop-blur-sm border border-espresso-700 rounded-full focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all text-cream-50 text-sm placeholder-espresso-500"
          />
        </div>
      </div>

      <div className="px-4 pb-4 overflow-x-auto max-w-5xl mx-auto">
        <div className="flex gap-2 pb-1 min-w-max justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-950 shadow-lg shadow-gold-500/30"
                  : "bg-espresso-800 text-cream-200 hover:bg-espresso-700 border border-espresso-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <main className="px-3 pb-24 max-w-7xl mx-auto">
        {loading ? (
          <CoffeeLoader />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-espresso-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 shadow-lg hover:shadow-xl hover:shadow-gold-500/10 transition-all duration-300 hover:-translate-y-1.5 group"
              >
                <div className="relative w-full aspect-square overflow-hidden">
                  <img
                    src={getImage(item)}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {item.isNew && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-950 text-[10px] font-bold rounded">
                      NEW
                    </span>
                  )}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
                      favorites.includes(item.id)
                        ? "text-red-500 bg-white/20 backdrop-blur-sm"
                        : "text-cream-50/70 hover:text-red-500 opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-sm"
                    }`}
                  >
                    <FiHeart className={`w-3.5 h-3.5 ${favorites.includes(item.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
                <div className="p-2.5">
                  <h4 className="text-sm font-bold text-cream-50 truncate leading-tight">{item.name}</h4>
                  <p className="text-gold-400 text-sm font-semibold mt-1">
                    {item.currency === 'RWF' ? 'RWF ' : '$'}{item.price}
                  </p>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`mt-2 w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                      addedItems[item.id]
                        ? "bg-green-500 text-white shadow-lg"
                        : "bg-gold-400 hover:bg-gold-500 text-espresso-950 group-hover:shadow-lg"
                    }`}
                  >
                    {addedItems[item.id] ? "Added!" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">&#9749;</div>
            <h3 className="text-xl font-bold text-cream-200 mb-2">No dishes found</h3>
            <p className="text-espresso-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      <button
        onClick={() => navigate("/cart")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-gold-500 to-gold-400 rounded-full shadow-2xl shadow-gold-500/40 flex items-center justify-center text-espresso-950 hover:scale-110 transition-transform z-50"
      >
        <FiShoppingCart className="w-6 h-6" />
        {getCartCount() > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
            {getCartCount()}
          </span>
        )}
      </button>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}

export default MenuPage;
