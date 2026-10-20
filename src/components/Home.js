import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaCoffee, FaChair, FaUser, FaArrowRight, FaPlay, FaStar, FaFire, FaQuoteLeft } from "react-icons/fa";
import axios from "axios";
import bgImage from "../assets/coff.jpg";
import logoImg from "../assets/logo.png";
import coffeeVideo from "../assets/coffee.mp4";
import feedbackBg from "../assets/coffee.jpg";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CoffeeLoader from "./CoffeeLoader";
import ChatWidget from "./ChatWidget";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i, left: Math.random() * 100, delay: Math.random() * 5, duration: 3 + Math.random() * 4, size: 4 + Math.random() * 8,
}));

function AnimatedHero({ bgImage, user, searchTerm, setSearchTerm, getGreeting }) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowVideo(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [showVideo]);

  return (
    <section className="relative h-[75vh] sm:h-[80vh] min-h-[520px] overflow-hidden">
      {/* Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ${
          showVideo ? "opacity-0 scale-110" : "opacity-100 scale-100"
        }`}
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Background Video */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          showVideo ? "opacity-100 scale-100" : "opacity-0 scale-110"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        >
          <source src={coffeeVideo} type="video/mp4" />
        </video>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-espresso-950/85 via-espresso-950/60 to-espresso-950/85 z-10" />

      {/* Floating Particles (steam effect) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bottom-0 rounded-full bg-gold-400/10"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 1.5}px`,
              animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-30 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-5">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain animate-pulse-soft" />
            </div>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-cream-50 mb-3 animate-fade-in-up leading-tight">
          {getGreeting()}, <span className="text-gold-400">{user?.username || "Guest"}</span>
        </h1>
        <p className="text-cream-300/80 text-sm sm:text-lg max-w-xl mx-auto mb-6 animate-fade-in-up">
          Start your day with the perfect brew
        </p>
        <div className="max-w-md mx-auto relative w-full animate-fade-in-up">
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 bg-espresso-800/60 backdrop-blur-sm border border-espresso-700 rounded-full text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 placeholder-espresso-500 transition-all"
          />
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-75vh) scale(0.3); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

function PromoBanner() {
  const navigate = useNavigate();

  return (
    <section className="max-w-6xl mx-auto px-4 -mt-12 relative z-40 mb-6">
      <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 rounded-2xl p-[2px] shadow-2xl shadow-gold-500/30 animate-fade-in-up">
        <div className="bg-espresso-950 rounded-2xl p-5 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
              <FaFire className="text-espresso-950 text-xl sm:text-2xl" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <FaStar className="text-gold-400 text-xs" />
                <span className="text-gold-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Limited Offer</span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-playfair font-bold text-cream-50">
                Fresh Coffee Delivered Daily <span className="text-gold-400">&#9749;</span>
              </h3>
              <p className="text-cream-300/80 text-xs sm:text-sm mt-1">
                Get <span className="text-gold-400 font-bold text-base sm:text-lg">20% OFF</span> Your First Order
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <button onClick={() => navigate("/menu")}
                className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-full text-xs sm:text-sm transition-all hover:shadow-lg hover:shadow-gold-500/40 active:scale-95">
                <FaPlay size={10} /> Order Now
              </button>
              <button onClick={() => navigate("/menu")}
                className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 bg-espresso-800/80 border border-gold-500/30 text-cream-50 font-semibold rounded-full text-xs sm:text-sm transition-all hover:bg-espresso-700 hover:border-gold-400/50 active:scale-95">
                Explore Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Regular Customer",
    text: "Best coffee shop experience ever! The aroma and taste are unmatched. I've never had a delivery this fast.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Michael Chen",
    role: "Coffee Enthusiast",
    text: "Amazing delivery and premium coffee taste. The variety of blends keeps me coming back every week.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Emily Davis",
    role: "Loyal Member",
    text: "Modern website with fast ordering system. Their loyalty program is fantastic, and the weekend deals are unbeatable!",
    rating: 4,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

function FeedbackForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.warn("Please fill in all fields", { position: "top-center", autoClose: 3000 });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/feedback", {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        rating,
      });
      toast.success("Feedback sent successfully \u2615", { position: "top-center", autoClose: 3000 });
      setForm({ name: "", email: "", message: "" });
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send feedback", { position: "top-center", autoClose: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${feedbackBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso-950/95 via-espresso-950/85 to-espresso-950/95" />

      <div className={`relative z-10 max-w-5xl mx-auto px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-10">
          <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em]">Share Your Experience</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-cream-50 mt-2">
            We Value Your Feedback
          </h2>
          <p className="text-cream-300/60 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            Your thoughts help us brew the perfect experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-espresso-800/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/[0.06] shadow-xl">
            <TestimonialCarousel testimonials={testimonials} />
          </div>

          <div className="bg-espresso-800/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/[0.06] shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <input
                  type="text" name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-espresso-900/60 border border-espresso-700 rounded-xl text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                />
                <label className="absolute left-4 top-4 text-cream-400/60 text-sm transition-all peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-gold-400 peer-placeholder-shown:text-sm peer-placeholder-shown:translate-y-0">
                  Full Name
                </label>
              </div>

              <div className="relative">
                <input
                  type="email" name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-espresso-900/60 border border-espresso-700 rounded-xl text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all"
                />
                <label className="absolute left-4 top-4 text-cream-400/60 text-sm transition-all peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-gold-400 peer-placeholder-shown:text-sm peer-placeholder-shown:translate-y-0">
                  Email Address
                </label>
              </div>

              <div>
                <label className="block text-cream-400/80 text-sm mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {stars.map((s) => (
                    <button key={s} type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="transition-transform hover:scale-110">
                      <FaStar
                        size={22}
                        className={s <= (hoverRating || rating) ? 'text-gold-400' : 'text-espresso-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  name="message" rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 bg-espresso-900/60 border border-espresso-700 rounded-xl text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all resize-none"
                />
                <label className="absolute left-4 top-4 text-cream-400/60 text-sm transition-all peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-gold-400 peer-placeholder-shown:text-sm peer-placeholder-shown:translate-y-0">
                  Your Message
                </label>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-gold-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Sending...</>
                ) : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCarousel({ testimonials }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const t = testimonials[current];

  return (
    <div>
      <span className="text-gold-400 text-[10px] font-semibold uppercase tracking-[0.2em]">What They Say</span>
      <h3 className="text-lg sm:text-xl font-playfair font-bold text-cream-50 mt-1 mb-6">Customer Testimonials</h3>

      <div className="text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden ring-2 ring-gold-500/30 ring-offset-2 ring-offset-espresso-900 mx-auto mb-4">
          <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
        </div>
        <FaQuoteLeft className="text-gold-500/20 text-2xl mb-3 mx-auto" />
        <p className="text-cream-200/90 text-sm sm:text-base leading-relaxed mb-4 italic">
          &ldquo;{t.text}&rdquo;
        </p>
        <div className="flex justify-center gap-1 mb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <FaStar key={i} className={i < t.rating ? 'text-gold-400' : 'text-espresso-600'} size={14} />
          ))}
        </div>
        <h4 className="text-cream-50 font-semibold text-sm">{t.name}</h4>
        <p className="text-cream-400/50 text-xs">{t.role}</p>
      </div>

      <div className="flex justify-center gap-2 mt-5">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-gold-400 w-5' : 'bg-espresso-600 hover:bg-espresso-500'}`} />
        ))}
      </div>
    </div>
  );
}

function PaymentBanner({ navigate }) {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const api = "http://localhost:5000";

  useEffect(() => {
    axios.get(`${api}/api/banners`)
      .then(res => {
        const items = res.data.data || [];
        setBanners(items.filter(b => b.media && b.position === "home"));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const slide = banners[current];

  return (
    <section className="max-w-6xl mx-auto px-4 pb-6">
      <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-500 group">
        {slide.mediaType === "video" ? (
          <video key={slide._id} src={`${api}${slide.media}`} muted autoPlay loop playsInline
            className="w-full h-[220px] sm:h-[300px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <img key={slide._id} src={`${api}${slide.media}`} alt="Banner"
            className="w-full h-[220px] sm:h-[300px] object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${slide.overlayColor || "from-espresso-950/90 via-espresso-950/40 to-transparent"}`} />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 animate-fade-in-up">
          {slide.title && (
            <h3 className="text-lg sm:text-2xl md:text-3xl font-playfair font-bold text-cream-50 mb-1">{slide.title}</h3>
          )}
          {slide.subtitle && (
            <p className="text-cream-300/80 text-sm sm:text-base mb-1 max-w-lg">{slide.subtitle}</p>
          )}
          {slide.description && (
            <p className="text-cream-400/60 text-xs sm:text-sm mb-1 max-w-md">{slide.description}</p>
          )}
          {slide.discountText && (
            <p className="text-gold-400 font-bold text-sm sm:text-base mb-2">{slide.discountText}</p>
          )}
          <button onClick={() => navigate(slide.buttonLink || "/menu")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 hover:shadow-lg hover:shadow-gold-500/40 active:scale-95 w-fit transition-all">
            {slide.buttonText || "Order Now"}
          </button>
        </div>

        {/* Custom text overlays from texts[] */}
        {(slide.texts || []).filter(t => t.content).map((t, i) => (
          <div key={i} className="absolute left-0 right-0 flex justify-center pointer-events-none px-4"
            style={{ top: `${t.y}%` }}>
            <span className={`${t.font || "font-playfair"} ${t.size || "text-lg"} font-bold`}
              style={{ color: t.color || "#ffffff" }}>
              {t.content}
            </span>
          </div>
        ))}
      </div>

      {/* Dots navigation */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((_, i) => (
            <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-gold-400 w-5' : 'bg-espresso-700 hover:bg-espresso-600'}`} />
          ))}
        </div>
      )}
    </section>
  );
}

function Home({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    axios.get("http://localhost:5000/api/categories").then(res => {
      if (res.data.success) setCategories(res.data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/menu");
        setMenuItems(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setLoading(false), 700);
      }
    };
    fetchMenu();
  }, []);

  const handleAddToCart = (item) => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) {
      toast.warn("Please log in to add items.", { position: "top-center", autoClose: 3000 });
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((p) => p.id === item._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: item._id, name: item.name, price: item.price, currency: item.currency, image: item.image, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`${item.name} added!`, { autoClose: 2000 });
  };

  const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.reduce((sum, i) => sum + i.quantity, 0);
  };

  const getImage = (item) => {
    if (item.image) return `http://localhost:5000${item.image}`;
    return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop";
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const filtered = menuItems.filter(
    (i) => (!searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
           (activeCategory === "all" || i.category === activeCategory)
  );

  const catTabs = [
    { name: "all", label: "All" },
    ...categories.map(c => ({ name: c.name, label: c.label })),
    ...(categories.length === 0
      ? [{ name: "breakfast", label: "Breakfast" }, { name: "lunch", label: "Lunch" }, { name: "dinner", label: "Dinner" }, { name: "coffee", label: "Coffee" }]
      : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950">
        <Navbar />
        <CoffeeLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950">
      <Navbar />

      <main className="relative z-10 pt-20">
        <AnimatedHero bgImage={bgImage} user={user} searchTerm={searchTerm} setSearchTerm={setSearchTerm} getGreeting={getGreeting} />

        <PromoBanner />

        {/* Quick actions */}
        <section className="max-w-6xl mx-auto px-4 pb-6">
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate("/menu")} className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-espresso-950 font-semibold rounded-full text-sm transition-all hover:shadow-lg hover:shadow-gold-500/30 active:scale-95">
              <FaCoffee /> Full Menu
            </button>
            <button onClick={() => navigate("/book-table")} className="flex items-center gap-2 px-5 py-2.5 bg-espresso-800 hover:bg-espresso-700 text-cream-50 font-semibold rounded-full text-sm border border-espresso-700 transition-all active:scale-95">
              <FaChair /> Book Table
            </button>
            <button onClick={() => navigate("/profile")} className="flex items-center gap-2 px-5 py-2.5 bg-espresso-800 hover:bg-espresso-700 text-cream-50 font-semibold rounded-full text-sm border border-espresso-700 transition-all active:scale-95">
              <FaUser /> Profile
            </button>
          </div>
        </section>

        {/* Product Cards Grid */}
        {menuItems.length > 0 && (
          <section className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cream-50">
                  Our Products
                </h2>
                <p className="text-cream-300/50 text-sm mt-1">Discover our finest selection</p>
              </div>
              <button onClick={() => navigate("/menu")} className="flex items-center gap-2 px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 hover:text-gold-300 rounded-full text-sm font-medium transition-all border border-gold-500/20 hover:border-gold-500/40">
                View All <FaArrowRight size={14} />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
              {catTabs.map(cat => (
                <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeCategory === cat.name
                      ? 'bg-gold-500 text-espresso-950 shadow-lg shadow-gold-500/20'
                      : 'bg-espresso-800/60 text-cream-400/70 hover:text-cream-50 hover:bg-espresso-700/60 border border-espresso-700/30'
                  }`}>
                  {cat.name === "all" ? "All" : cat.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <FaCoffee className="text-4xl text-espresso-600 mx-auto mb-3" />
                <p className="text-cream-400/60 text-sm">No items in this category</p>
              </div>
            ) : (
              <div
                className="overflow-x-auto pb-4 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8
                  [&::-webkit-scrollbar]:h-2
                  [&::-webkit-scrollbar-track]:bg-espresso-900/50
                  [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-gold-500/40
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:hover:bg-gold-500/60"
              >
                <div className="grid grid-cols-6 gap-5 md:gap-6 min-w-[700px]">
                  {filtered.slice(0, 30).map((item) => (
                    <div
                      key={item._id}
                      className="group relative bg-espresso-800/40 rounded-xl overflow-hidden border border-white/[0.06] shadow-md hover:shadow-xl hover:shadow-gold-500/10 transition-all duration-300 hover:-translate-y-1.5"
                    >
                      <div className="relative w-full h-[110px] sm:h-[120px] md:h-[130px] lg:h-[140px] overflow-hidden bg-espresso-900/80">
                        <img
                          src={getImage(item)}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-espresso-950/70 to-transparent" />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-white/10 backdrop-blur-md text-cream-200 border border-white/10">
                            {item.categoryRef?.label || item.category || "coffee"}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 md:p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm md:text-base lg:text-lg font-bold text-cream-50 truncate leading-tight flex-1 min-w-0">
                            {item.name}
                          </h4>
                          <span className="flex-shrink-0 text-gold-400 text-sm md:text-base lg:text-lg font-bold tabular-nums">
                            {item.price?.toLocaleString?.() || item.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <svg className="w-3 h-3 text-gold-400 fill-gold-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          <span className="text-cream-400 text-[11px] font-medium">{(item.rating || 4.5).toFixed(1)}</span>
                          <span className="text-cream-500/40 text-[11px]">|</span>
                          <span className="text-cream-500/60 text-[11px]">{item.availabilityTime || "15"} min</span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="mt-3 w-full py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-250 bg-gold-500 hover:bg-gold-400 text-espresso-950 active:scale-95"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Payment Banner */}
        <PaymentBanner navigate={navigate} />

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <FaCoffee className="text-gold-400" />, label: "Premium Coffee", desc: "Freshly brewed daily" },
              { icon: <FaShoppingCart className="text-gold-400" />, label: "Easy Order", desc: "Order in seconds" },
              { icon: <FaChair className="text-gold-400" />, label: "Book a Table", desc: "Reserve your spot" },
              { icon: <FaUser className="text-gold-400" />, label: "Rewards", desc: "Earn points" },
            ].map((f, i) => (
              <div key={i} className="bg-espresso-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-espresso-700/30 hover:border-gold-400/30 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gold-500/10 rounded-full mb-2">
                  {f.icon}
                </div>
                <h4 className="text-cream-50 text-sm font-semibold">{f.label}</h4>
                <p className="text-cream-300/60 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <FeedbackForm />
      </main>

      {/* Chat Widget */}
      <ChatWidget />

      {/* Cart FAB */}
      <button
        onClick={() => navigate("/cart")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-gold-500 to-gold-400 rounded-full shadow-2xl shadow-gold-500/40 flex items-center justify-center text-espresso-950 hover:scale-110 transition-transform z-50"
      >
        <FaShoppingCart className="w-6 h-6" />
        {getCartCount() > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
            {getCartCount()}
          </span>
        )}
      </button>

      <Footer />
      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}

export default Home;
