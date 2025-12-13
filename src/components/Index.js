import React, { useEffect, useState, useRef } from "react";
import {
  FaCoffee,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaHome,
  FaUser,
  FaStar,
  FaClock,
  FaGift,
  FaHeart,
  FaStarHalfAlt,
  FaUsers,
  FaUtensils,
  FaThumbsUp,
  FaMoon,
  FaSun,
  FaSearch,
} from "react-icons/fa";

export default function Index() {
  const [menuItems, setMenuItems] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const menuSectionRef = useRef(null);

  const defaultImg = "https://via.placeholder.com/300.png?text=Coffee+Item";

  useEffect(() => {
    fetch("http://localhost:5000/api/menu")
      .then((res) => res.json())
      .then((data) => setMenuItems(data))
      .catch((err) => console.error(err));

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const requireLogin = () => {
    if (!user) window.location.href = "/login";
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (menuSectionRef.current && value.trim() !== "") {
      menuSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredMenu = menuItems
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 4);

  return (
    <div className={darkMode ? "dark-mode" : "light-mode"}>
      {/* Navbar */}
      <nav className={`navbar ${darkMode ? "dark-navbar" : "light-navbar"}`}>
        <div className="logo" onClick={requireLogin}>
          <FaCoffee /> <span>F&F Coffee</span>
        </div>
        <ul>
          <li onClick={requireLogin}><FaHome /> Home</li>
          <li><a href="/login" className={darkMode ? "link-dark" : "link-light"}><FaUser /> Login</a></li>
          <li><a href="/signup" className={darkMode ? "link-dark" : "link-light"}><FaUser /> Sign Up</a></li>
          <li>
            <button className="mode-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </li>
        </ul>
      </nav>

      {/* Fixed Search */}
      <div className={`search-wrapper ${darkMode ? "dark-search-wrapper" : "light-search-wrapper"}`}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          className={`fixed-search ${darkMode ? "dark-search" : "light-search"}`}
          placeholder="Search our menu..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Hero */}
      <section className="hero">
        <h1>Welcome to F&F Coffee</h1>
        <p>Find your perfect brew and taste the passion in every sip.</p>
      </section>

      {/* White Card Wrapper */}
      <div className={`white-card ${darkMode ? "dark-card" : ""}`}>
        {/* Features */}
        <section className="features">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card"><FaStar /> Premium Quality</div>
            <div className="feature-card"><FaClock /> Fast Service</div>
            <div className="feature-card"><FaGift /> Reward Program</div>
            <div className="feature-card"><FaHeart /> Loved by Customers</div>
            <div className="feature-card"><FaStarHalfAlt /> Freshly Brewed</div>
            <div className="feature-card"><FaUsers /> Friendly Staff</div>
            <div className="feature-card"><FaUtensils /> Wide Menu</div>
            <div className="feature-card"><FaThumbsUp /> Highly Rated</div>
          </div>
        </section>

        {/* Menu Section */}
        <section className="menu-section" ref={menuSectionRef}>
          <h2>Our Menu</h2>
          {filteredMenu.length === 0 ? (
            <p>No items found.</p>
          ) : (
            <div className="menu-grid">
              {filteredMenu.map((item) => (
                <div key={item.id} className="menu-card" onClick={requireLogin}>
                  <img src={item.image ? "http://localhost:5000" + item.image : defaultImg} alt={item.name} />
                  <div className="menu-info">
                    <h4>{item.name}</h4>
                    <p>{item.description || "Rich aroma, deep flavor."}</p>
                    <p className="price">{item.currency} {item.price}</p>
                    <button onClick={requireLogin}><FaShoppingCart /> Buy Now</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="about-section">
          <h2>About F&F Coffee</h2>
          <p>
            Since 2015, we’ve been passionate about crafting premium coffee with love and skill.
            Our shop is a warm, welcoming place where customers can relax, connect with friends,
            and enjoy Rwanda’s finest brews. We focus on quality, consistency, and a memorable
            coffee experience every single time.
          </p>
          <div className={`employee-card ${darkMode ? "dark-card" : ""}`}>
            <FaUsers className="employee-icon" />
            <p>We proudly employ 15 dedicated team members who ensure exceptional service and freshly brewed coffee daily.</p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className={`footer ${darkMode ? "dark-footer" : "light-footer"}`}>
        <h3><FaCoffee /> F&F Coffee Shop</h3>
        <div className="footer-contact">
          <p><FaMapMarkerAlt /> Kigali, Rwanda</p>
          <p><FaPhone /> +250 788 123 456</p>
          <p><FaEnvelope /> contact@ffcoffee.com</p>
        </div>
        <p>© 2025 All Rights Reserved.</p>
      </footer>

      {/* CSS */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; }
        html, body { height: 100%; }

        .dark-mode { background: #121212; color: #fff; }
        .light-mode { background: #f7f7f7; color: #222; }

        /* Navbar */
        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; position: sticky; top: 0; z-index: 999; }
        .dark-navbar { background: #000; color: #fff; }
        .light-navbar { background: #fff; color: #222; }
        .logo { display: flex; align-items: center; gap: 10px; font-size: 1.6rem; cursor: pointer; color: #d9a65e; }
        ul { display: flex; list-style: none; gap: 25px; align-items: center; }
        li, a { display: flex; align-items: center; gap: 5px; text-decoration: none; font-weight: 500; color: inherit; }
        li:hover, a:hover { color: #d9a65e; }
        .mode-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; }

        /* Hero */
        .hero { text-align: center; padding: 80px 20px; background: rgba(0,0,0,0.15); }
        .hero h1 { color: #d9a65e; font-size: 2.8rem; margin-bottom: 10px; }
        .hero p { margin-bottom: 20px; font-size: 1.1rem; }

        /* Fixed Search */
        .search-wrapper { position: fixed; top: 70px; left: 50%; transform: translateX(-50%); z-index: 1000; display: flex; align-items: center; width: 90%; max-width: 450px; padding: 5px 15px; border-radius: 50px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .dark-search-wrapper { background: rgba(0,0,0,0.85); }
        .light-search-wrapper { background: rgba(255,255,255,0.95); }
        .fixed-search { flex: 1; border: none; outline: none; padding: 10px 15px; border-radius: 50px; background: transparent; color: inherit; }
        .dark-search { color: #fff; }
        .light-search { color: #222; }
        .search-icon { margin-right: 10px; font-size: 1.2rem; color: #d9a65e; }

        /* White Card */
        .white-card { background: #fff; border-radius: 20px; padding: 40px 20px; max-width: 1200px; margin: 100px auto 40px; color: #222; }
        .dark-card { background: #222; color: #fff; }

        /* Features */
        .features { text-align: center; margin-bottom: 50px; }
        .features h2 { color: #d9a65e; margin-bottom: 30px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto; }
        .feature-card { background: #f7f7f7; color: #222; padding: 25px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; }
        .dark-mode .feature-card { background: #333; color: #fff; }
        .feature-card:hover { transform: scale(1.05); color: #d9a65e; }

        /* Menu */
        .menu-section { text-align: center; margin-bottom: 50px; }
        .menu-section h2 { color: #d9a65e; margin-bottom: 30px; }
        .menu-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; justify-items: center; }
        .menu-card { background: #f7f7f7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.3s; width: 250px; height: 360px; display: flex; flex-direction: column; color: inherit; }
        .dark-mode .menu-card { background: #333; }
        .menu-card:hover { transform: translateY(-5px); }
        .menu-card img { width: 100%; height: 180px; object-fit: cover; }
        .menu-info { padding: 15px; text-align: left; flex-grow: 1; }
        .menu-info h4 { color: #d9a65e; margin-bottom: 5px; }
        .menu-info button { background: #d9a65e; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; }

        /* About */
        .about-section { text-align: center; max-width: 800px; margin: auto; }
        .about-section h2 { color: #d9a65e; margin-bottom: 15px; }
        .employee-card { display: flex; align-items: center; justify-content: center; gap: 15px; margin-top: 15px; padding: 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); color: inherit; }
        .employee-icon { font-size: 2rem; color: #d9a65e; }

        /* Footer */
        .footer { text-align: center; padding: 40px 20px; margin-top: 60px; }
        .dark-footer { background: #000; color: #fff; }
        .light-footer { background: #f7f7f7; color: #222; }
        .footer h3 { color: #d9a65e; margin-bottom: 10px; }
        .footer-contact p { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 5px 0; }

        @media(max-width: 700px) {
          .navbar { flex-direction: column; gap: 10px; }
          ul { flex-direction: column; }
          .hero h1 { font-size: 2rem; }
          .menu-card { width: 100%; height: auto; }
        }
      `}</style>
    </div>
  );
}
