import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCoffee, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShoppingCart,
  FaStar, FaClock, FaGift, FaHeart, FaUsers, FaUtensils, FaThumbsUp,
  FaSearch, FaArrowRight, FaUser, FaSignInAlt, FaMugHot, FaLeaf,
  FaAward, FaSmile, FaFire, FaTrophy, FaCheckCircle, FaShieldAlt,
  FaMoneyBillWave, FaHeadset
} from "react-icons/fa";
import axios from "axios";
import bgImage from "../assets/coff.jpg";
import CoffeeLoader from "./CoffeeLoader";

const getImage = (item) => {
  if (item.image) return `http://localhost:5000${item.image}`;
  return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop";
};

export default function Index() {
  const [menuItems, setMenuItems] = useState([]);
  const [trending, setTrending] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:5000/api/menu"),
      axios.get("http://localhost:5000/api/menu/trending")
    ])
      .then(([menuRes, trendRes]) => {
        setMenuItems(menuRes.data || []);
        setTrending(trendRes.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = menuItems.filter(
    (i) => !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <CoffeeLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 font-poppins">

      {/* ===== DISTINCT LANDING NAV ===== */}
      <header className="sticky top-0 z-50 bg-espresso-950/90 backdrop-blur-xl border-b border-espresso-700/20 shadow-lg shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand - bigger on landing */}
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all duration-300">
                <FaCoffee className="text-espresso-950 text-lg sm:text-xl" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-playfair font-bold text-cream-50 group-hover:text-gold-400 transition-colors block leading-tight">
                  F&F Coffee
                </span>
                <span className="text-[10px] text-cream-50/40 tracking-[0.15em] uppercase hidden sm:block">
                  Premium Brew Since 2015
                </span>
              </div>
            </Link>

            {/* Landing nav buttons - only login/signup */}
            <nav className="flex items-center gap-2 sm:gap-3">
              <Link to="/login"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 border border-espresso-600 hover:border-gold-500/50 text-cream-50 hover:text-gold-400 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 no-underline bg-espresso-800/50 hover:bg-espresso-800">
                <FaSignInAlt size={13} />
                <span className="hidden sm:inline">Sign</span> In
              </Link>
              <Link to="/signup"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-espresso-950 font-bold rounded-lg text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 no-underline">
                <FaUser size={13} />
                Sign <span className="hidden sm:inline">Up</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-cover bg-center bg-no-repeat min-h-[calc(100vh-5rem)] flex items-center" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-espresso-950/90 via-espresso-950/70 to-espresso-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,_168,_83,_0.08)_0%,_transparent_70%)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-20 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold tracking-wide mb-6">
              <FaLeaf size={12} /> Premium Coffee Experience
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-playfair font-bold text-cream-50 leading-[1.1] mb-4">
              Welcome to
              <br />
              <span className="text-gold-400">F&F Coffee</span>
            </h1>
            <p className="text-cream-300/70 text-base sm:text-lg max-w-lg mb-8 leading-relaxed">
              Find your perfect brew and taste the passion in every sip. 
              Join us for an unforgettable coffee experience.
            </p>

            {/* Search */}
            <div className="max-w-lg relative mb-8">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400/60 z-10" size={14} />
              <input
                type="text"
                placeholder="Search our menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-espresso-900/70 backdrop-blur-sm border border-espresso-700/50 rounded-xl text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 placeholder-espresso-500 transition-all"
              />
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/signup"
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-espresso-950 font-bold rounded-xl text-sm sm:text-base transition-all duration-300 shadow-2xl shadow-gold-500/30 hover:shadow-gold-500/50 no-underline active:scale-[0.97]">
                <FaUser size={16} /> Get Started Free
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-3.5 bg-espresso-900/60 backdrop-blur-sm hover:bg-espresso-800/80 text-cream-50 border border-espresso-700/50 hover:border-gold-500/30 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 no-underline active:scale-[0.97]">
                <FaSignInAlt size={16} /> Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-cream-50/30">
          <span className="text-[10px] tracking-[0.15em] uppercase">Scroll</span>
          <div className="w-4 h-7 rounded-full border border-cream-50/20 flex justify-center pt-1.5">
            <div className="w-1 h-1.5 rounded-full bg-gold-400/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative -mt-16 z-10 max-w-7xl mx-auto px-4 sm:px-8 mb-8">
        <div className="bg-espresso-800/70 backdrop-blur-xl rounded-2xl p-5 sm:p-8 shadow-2xl border border-espresso-700/20">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
            {[
              { icon: FaStar, label: "Premium" },
              { icon: FaClock, label: "Fast" },
              { icon: FaGift, label: "Rewards" },
              { icon: FaHeart, label: "Loved" },
              { icon: FaMugHot, label: "Fresh" },
              { icon: FaUsers, label: "Friendly" },
              { icon: FaUtensils, label: "Variety" },
              { icon: FaAward, label: "Top Rated" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl bg-espresso-900/40 border border-espresso-700/10 hover:border-gold-400/20 hover:bg-espresso-900/60 transition-all duration-300 group cursor-default">
                <f.icon className="text-gold-400 text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300" />
                <span className="text-cream-100 text-[10px] sm:text-xs font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUR MENU ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-gold-400 text-xs font-semibold tracking-[0.15em] uppercase">Browse Our Selection</span>
            <h2 className="text-3xl sm:text-4xl font-playfair text-cream-50 font-bold mt-1">
              Our <span className="text-gold-400">Menu</span>
            </h2>
            <p className="text-cream-300/50 text-sm mt-1">{filtered.length} items available</p>
          </div>
          <Link to="/signup" className="hidden sm:flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm font-medium transition-all no-underline group">
            Join to Order <FaArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FaSearch className="text-espresso-600 text-4xl mx-auto mb-3" />
            <p className="text-cream-300/50">No items match your search.</p>
          </div>
        ) : (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-espresso-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gold-500/40 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filtered.map((item) => (
              <div key={item._id || item.id}
                className="flex-shrink-0 w-[150px] sm:w-[180px] md:w-[200px] bg-espresso-900/60 backdrop-blur-sm rounded-xl overflow-hidden border border-espresso-700/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative h-24 sm:h-28 md:h-32 overflow-hidden">
                  <img src={getImage(item)} alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-2 sm:p-2.5 md:p-3">
                  <h4 className="text-xs sm:text-sm font-bold text-cream-50 truncate">{item.name}</h4>
                  <p className="text-gold-400 text-xs sm:text-sm font-semibold mt-0.5">
                    {item.currency || "RWF"} {item.price}
                  </p>
                  {item.description && (
                    <p className="text-cream-300/50 text-[10px] mt-1 truncate">{item.description}</p>
                  )}
                  <Link to="/signup"
                    className="mt-1.5 sm:mt-2 w-full block text-center py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-semibold bg-gold-400 hover:bg-gold-500 text-espresso-950 transition-all duration-300 no-underline active:scale-95">
                    <FaShoppingCart className="inline mr-1" size={9} /> Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-6 sm:hidden">
          <Link to="/signup" className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm font-medium transition-all no-underline">
            Join to Order <FaArrowRight size={11} />
          </Link>
        </div>
      </section>

      {/* ===== TRENDING PRODUCTS ===== */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-gold-400 text-xs font-semibold tracking-[0.15em] uppercase">Most Popular</span>
              <h2 className="text-3xl sm:text-4xl font-playfair text-cream-50 font-bold mt-1">
                Trending <span className="text-gold-400">Now</span>
              </h2>
              <p className="text-cream-300/50 text-sm mt-1">Our customers' top picks</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-gold-400 text-xs font-semibold">
              <FaFire className="animate-pulse" /> Hot
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {trending.map((item, i) => (
              <div key={item.name}
                className="relative bg-espresso-900/60 backdrop-blur-sm rounded-xl overflow-hidden border border-espresso-700/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                {i === 0 && (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-espresso-950 text-[10px] font-bold shadow-lg">
                    <FaTrophy size={9} /> #1
                  </div>
                )}
                <div className="relative h-28 sm:h-32 overflow-hidden">
                  <img src={getImage(item)} alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-espresso-950/70 text-gold-400 text-[10px] font-semibold backdrop-blur-sm">
                    {item.totalQty} sold
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-bold text-cream-50 truncate">{item.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gold-400 text-sm font-semibold">{item.currency} {item.price}</p>
                    <div className="flex items-center gap-0.5 text-cream-300/40 text-[10px]">
                      <FaStar size={8} className="text-gold-400" /> {item.orderCount} orders
                    </div>
                  </div>
                  <Link to="/signup"
                    className="mt-2 w-full block text-center py-1.5 px-2 rounded-lg text-xs font-semibold bg-gold-400 hover:bg-gold-500 text-espresso-950 transition-all duration-300 no-underline active:scale-95">
                    <FaShoppingCart className="inline mr-1" size={10} /> Order Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== WHY CHOOSE US ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-8">
        <div className="bg-gradient-to-br from-espresso-800/40 to-espresso-900/40 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-espresso-700/20">
          <div className="text-center mb-8">
            <span className="text-gold-400 text-xs font-semibold tracking-[0.15em] uppercase">Why We Stand Out</span>
            <h2 className="text-3xl sm:text-4xl font-playfair text-cream-50 font-bold mt-1">
              Why Choose <span className="text-gold-400">F&F Coffee</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FaCoffee, title: "Premium Quality", desc: "We use only the finest Arabica beans and fresh ingredients, ensuring every cup and meal meets the highest standards." },
              { icon: FaLeaf, title: "Fresh & Organic", desc: "Our coffee is freshly roasted daily. We source locally and prioritize organic, sustainable products." },
              { icon: FaMoneyBillWave, title: "Best Prices", desc: "Enjoy premium coffee at fair prices. We believe great taste shouldn't break the bank." },
              { icon: FaHeadset, title: "24/7 Support", desc: "Our friendly team is always ready to help. Order online, book tables, or just chat with us anytime." },
              { icon: FaShieldAlt, title: "Safe & Clean", desc: "Your safety is our priority. We maintain the highest hygiene standards in every preparation." },
              { icon: FaHeart, title: "Made with Love", desc: "Every drink is handcrafted with passion and care by our skilled baristas." },
              { icon: FaUsers, title: "Community First", desc: "We support local farmers and suppliers, building a stronger coffee community together." },
              { icon: FaGift, title: "Rewards & Perks", desc: "Join our loyalty program and earn rewards with every purchase. Free coffee awaits!" },
            ].map((w, i) => (
              <div key={i}
                className="bg-espresso-900/50 rounded-xl p-4 sm:p-5 border border-espresso-700/10 hover:border-gold-400/20 hover:-translate-y-1 transition-all duration-300 group cursor-default">
                <w.icon className="text-gold-400 text-xl sm:text-2xl mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-cream-50 font-bold text-sm sm:text-base mb-1.5">{w.title}</h3>
                <p className="text-cream-300/50 text-xs sm:text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT + STATS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-8">
        <div className="bg-espresso-800/40 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-espresso-700/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-gold-400 text-xs font-semibold tracking-[0.15em] uppercase">Our Story</span>
              <h2 className="text-3xl sm:text-4xl font-playfair text-cream-50 font-bold mt-1 mb-4">
                About <span className="text-gold-400">F&F Coffee</span>
              </h2>
              <p className="text-cream-300/70 text-sm sm:text-base leading-relaxed mb-4">
                Since 2015, we've been passionate about crafting premium coffee
                with love and skill. Our shop is a warm, welcoming place where
                customers can relax, connect with friends, and enjoy Rwanda's
                finest brews.
              </p>
              <p className="text-cream-300/50 text-sm leading-relaxed">
                We focus on quality, consistency, and a memorable coffee 
                experience every single time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FaSmile, value: "10K+", label: "Happy Customers" },
                { icon: FaCoffee, value: "50+", label: "Coffee Varieties" },
                { icon: FaUsers, value: "15", label: "Team Members" },
                { icon: FaAward, value: "5★", label: "Rating" },
              ].map((s, i) => (
                <div key={i} className="bg-espresso-900/40 rounded-xl p-4 sm:p-5 text-center border border-espresso-700/10 hover:border-gold-400/20 transition-all duration-300">
                  <s.icon className="text-gold-400 text-xl sm:text-2xl mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-bold text-cream-50">{s.value}</p>
                  <p className="text-cream-300/50 text-xs sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold-500/15 via-espresso-900 to-gold-500/5 border border-gold-500/20 p-8 sm:p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <FaCoffee className="text-gold-400 text-3xl sm:text-4xl mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-playfair text-cream-50 font-bold mb-3">
              Ready for a <span className="text-gold-400">great coffee</span>?
            </h2>
            <p className="text-cream-300/60 max-w-lg mx-auto mb-8 text-sm sm:text-base">
              Create your account to order online, book tables, and earn 
              exclusive rewards.
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <Link to="/signup"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-espresso-950 font-bold rounded-xl text-sm sm:text-base transition-all duration-300 shadow-xl shadow-gold-500/20 hover:shadow-gold-500/40 no-underline active:scale-[0.97]">
                <FaUser size={16} /> Get Started
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-espresso-800/60 hover:bg-espresso-800 text-cream-50 border border-espresso-700/50 hover:border-gold-500/30 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 no-underline active:scale-[0.97]">
                <FaSignInAlt size={16} /> Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-espresso-800/50 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 text-lg font-playfair text-gold-400 hover:text-gold-300 transition-colors no-underline mb-3">
                <FaCoffee /> F&F Coffee
              </Link>
              <p className="text-cream-300/50 text-xs leading-relaxed max-w-xs">
                Premium coffee experience since 2015. Crafted with love in Rwanda.
              </p>
            </div>
            <div>
              <h4 className="text-cream-50 text-sm font-semibold mb-3">Quick Links</h4>
              <div className="space-y-1.5">
                <Link to="/login" className="block text-cream-300/50 hover:text-gold-400 text-xs transition-colors no-underline">Sign In</Link>
                <Link to="/signup" className="block text-cream-300/50 hover:text-gold-400 text-xs transition-colors no-underline">Create Account</Link>
              </div>
            </div>
            <div>
              <h4 className="text-cream-50 text-sm font-semibold mb-3">Contact</h4>
              <div className="space-y-1.5 text-cream-300/50 text-xs">
                <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-gold-400/60" size={10} /> Kigali, Rwanda</p>
                <p className="flex items-center gap-2"><FaPhone className="text-gold-400/60" size={10} /> +250 788 123 456</p>
                <p className="flex items-center gap-2"><FaEnvelope className="text-gold-400/60" size={10} /> contact@ffcoffee.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-espresso-800/30 pt-6 text-center">
            <p className="text-cream-300/30 text-xs">
              &copy; {new Date().getFullYear()} F&F Coffee. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
