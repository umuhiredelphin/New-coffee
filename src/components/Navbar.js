import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaUtensils,
  FaChair,
  FaBell,
  FaShoppingCart,
  FaTimes,
  FaInfoCircle,
  FaQuestionCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaBox,
  FaTh,
  FaCog,
  FaChevronRight,
  FaTags,
  FaFire,
  FaStar,
  FaHeadset,
} from "react-icons/fa";
import axios from "axios";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrollShadow, setScrollShadow] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const notifRef = useRef(null);

  const getImageUrl = (path) => (path ? `http://localhost:5000${path}` : "https://via.placeholder.com/150");

  useEffect(() => {
    const handleScroll = () => setScrollShadow(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user || !user.username) return;
    try {
      const orderRes = await axios.get(
        `http://localhost:5000/api/orders/notifications/${encodeURIComponent(user.username)}`
      );

      const orderNotifs = orderRes.data.map(notif => ({
        ...notif,
        type: "order",
        id: `order-${notif.id}`,
        read: notif.read || false,
        message: notif.message || `Order for ${notif.food_name} is ${notif.status}`,
        timestamp: notif.timestamp || new Date().toISOString()
      }));

      const allNotifications = [...orderNotifs].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) markAllAsRead();
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`http://localhost:5000/api/orders/read-all/${encodeURIComponent(user.username)}`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleNotificationClick = (notif) => {
    if (notif.type === "order") navigate("/orderhistory");
    setShowNotifications(false);
  };
  
  const filteredNotifications = activeTab === "all" ? notifications : notifications.filter(n => n.type === activeTab.slice(0, -1));

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <nav className={`flex justify-between items-center bg-black/90 backdrop-blur-xl text-cream-50 font-poppins px-8 py-3 mx-auto max-w-7xl fixed top-0 left-0 right-0 w-full z-[9999] rounded-t-2xl transition-all duration-300 ${scrollShadow ? 'shadow-2xl shadow-black/50' : 'shadow-none'}`}>
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center relative">
              <div 
                className="w-9 h-9 rounded-full overflow-hidden cursor-pointer flex items-center justify-center relative mr-1"
                onClick={() => navigate("/profile")}
              >
                {user.profileImage ? (
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <FaUserCircle 
                  size={28} 
                  color="#fff" 
                  className={user.profileImage ? "hidden" : "flex"} 
                />
              </div>
              
              <div 
                className="flex items-center justify-center p-2 rounded-full cursor-pointer bg-espresso-950 hover:bg-espresso-800 transition-all duration-300"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <FaTh size={24} color="#fff" />
              </div>
              
              {showProfileMenu && (
                <div className="absolute top-0 left-11 w-[280px] bg-espresso-900 rounded-xl shadow-2xl z-[100] overflow-hidden" ref={profileMenuRef}>
                  <div className="flex items-center p-4 border-b border-espresso-800">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex items-center justify-center">
                      {user.profileImage ? (
                        <img
                          src={getImageUrl(user.profileImage)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <FaUserCircle 
                        size={24} 
                        color="#fff" 
                        className={user.profileImage ? "hidden" : "flex"} 
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-base font-semibold text-cream-50">{user?.username || "User"}</div>
                      <div className="text-sm text-cream-100/60">{user?.email || ""}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <button 
                      className="flex items-center justify-between gap-3 px-4 py-3 bg-transparent border-0 border-b border-espresso-800 text-cream-50 cursor-pointer hover:bg-espresso-800/50 transition-all duration-300 w-full"
                      onClick={() => {
                        navigate("/profile");
                        setShowProfileMenu(false);
                      }}
                    >
                      <FaUserCircle size={16} />
                      <span>My Profile</span>
                      <FaChevronRight size={12} color="#666" />
                    </button>
                    <button 
                      className="flex items-center justify-between gap-3 px-4 py-3 bg-transparent border-0 border-b border-espresso-800 text-cream-50 cursor-pointer hover:bg-espresso-800/50 transition-all duration-300 w-full"
                      onClick={() => {
                        navigate("/settings");
                        setShowProfileMenu(false);
                      }}
                    >
                      <FaCog size={16} />
                      <span>Settings</span>
                      <FaChevronRight size={12} color="#666" />
                    </button>
                    <button 
                      className="flex items-center justify-between gap-3 px-4 py-3 bg-transparent border-0 border-b border-espresso-800 text-red-500 cursor-pointer hover:bg-espresso-800/50 transition-all duration-300 w-full"
                      onClick={() => {
                        localStorage.removeItem("user");
                        navigate("/");
                        setShowProfileMenu(false);
                      }}
                    >
                      <FaSignOutAlt size={16} />
                      <span>Log Out</span>
                      <FaChevronRight size={12} color="#666" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <FaUserCircle size={28} color="#777" onClick={() => handleNavClick("/login")} className="cursor-pointer" />
          )}
        </div>

        <ul className="list-none flex gap-0 m-0 p-0 items-center">
          <li><button className="bg-transparent border-none text-cream-50 font-medium flex items-center gap-0.5 cursor-pointer text-[10px] sm:text-xs lg:text-sm px-1 sm:px-1.5 lg:px-2.5 py-1.5 rounded-lg hover:text-gold-400 hover:bg-espresso-800/50 transition-all duration-300 whitespace-nowrap" onClick={() => handleNavClick("/")}><FaHome size={13} /> <span className="inline text-[10px] sm:text-[11px] lg:text-sm">Home</span></button></li>
          <li><button className="bg-transparent border-none text-cream-50 font-medium flex items-center gap-0.5 cursor-pointer text-[10px] sm:text-xs lg:text-sm px-1 sm:px-1.5 lg:px-2.5 py-1.5 rounded-lg hover:text-gold-400 hover:bg-espresso-800/50 transition-all duration-300 whitespace-nowrap" onClick={() => handleNavClick("/menu")}><FaUtensils size={11} /> <span className="inline text-[10px] sm:text-[11px] lg:text-sm">Menu</span></button></li>
          <li><button className="bg-transparent border-none text-cream-50 font-medium flex items-center gap-0.5 cursor-pointer text-[10px] sm:text-xs lg:text-sm px-1 sm:px-1.5 lg:px-2.5 py-1.5 rounded-lg hover:text-gold-400 hover:bg-espresso-800/50 transition-all duration-300 whitespace-nowrap" onClick={() => handleNavClick("/menu")}><FaTags size={11} /> <span className="inline text-[10px] sm:text-[11px] lg:text-sm">Categories</span></button></li>
          <li><button className="bg-transparent border-none text-cream-50 font-medium flex items-center gap-0.5 cursor-pointer text-[10px] sm:text-xs lg:text-sm px-1 sm:px-1.5 lg:px-2.5 py-1.5 rounded-lg hover:text-gold-400 hover:bg-espresso-800/50 transition-all duration-300 whitespace-nowrap" onClick={() => handleNavClick("/menu")}><FaFire size={11} /> <span className="inline text-[10px] sm:text-[11px] lg:text-sm">Best Sellers</span></button></li>
          <li><button className="bg-transparent border-none text-cream-50 font-medium flex items-center gap-0.5 cursor-pointer text-[10px] sm:text-xs lg:text-sm px-1 sm:px-1.5 lg:px-2.5 py-1.5 rounded-lg hover:text-gold-400 hover:bg-espresso-800/50 transition-all duration-300 whitespace-nowrap" onClick={() => handleNavClick("/menu")}><FaStar size={11} /> <span className="inline text-[10px] sm:text-[11px] lg:text-sm">New Arrivals</span></button></li>
          <li><button className="bg-transparent border-none text-cream-50 font-medium flex items-center gap-0.5 cursor-pointer text-[10px] sm:text-xs lg:text-sm px-1 sm:px-1.5 lg:px-2.5 py-1.5 rounded-lg hover:text-gold-400 hover:bg-espresso-800/50 transition-all duration-300 whitespace-nowrap" onClick={() => handleNavClick("/book-table")}><FaChair size={13} /> <span className="inline text-[10px] sm:text-[11px] lg:text-sm">Book</span></button></li>
          <li><button className="bg-transparent border-none text-cream-50 font-medium flex items-center gap-0.5 cursor-pointer text-[10px] sm:text-xs lg:text-sm px-1 sm:px-1.5 lg:px-2.5 py-1.5 rounded-lg hover:text-gold-400 hover:bg-espresso-800/50 transition-all duration-300 whitespace-nowrap" onClick={() => handleNavClick("/about")}><FaInfoCircle size={11} /> <span className="inline text-[10px] sm:text-[11px] lg:text-sm">About</span></button></li>
        </ul>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mr-1 sm:mr-2">
          <div className="relative p-1 rounded-full cursor-pointer bg-espresso-950 hover:bg-espresso-800 transition-all duration-300" onClick={() => handleNavClick("/help")}>
            <FaQuestionCircle size={16} color="#fff" />
          </div>

          <div className="relative p-1 rounded-full cursor-pointer bg-espresso-950 hover:bg-espresso-800 transition-all duration-300" onClick={() => handleNavClick("/about")}>
            <FaHeadset size={16} color="#fff" />
          </div>

          <div className="relative p-1 rounded-full cursor-pointer bg-espresso-950 hover:bg-espresso-800 transition-all duration-300" onClick={() => handleNavClick("/settings")}>
            <FaCog size={16} color="#fff" />
          </div>

          <div className="relative p-1 rounded-full cursor-pointer bg-espresso-950 hover:bg-espresso-800 transition-all duration-300" onClick={() => handleNavClick("/cart")}>
            <FaShoppingCart size={16} color="#fff" />
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-gold-400 rounded-full px-1.5 py-0.5 text-[10px] text-espresso-950 font-bold">{cartCount}</span>}
          </div>

          <div className="relative p-1 rounded-full cursor-pointer bg-espresso-950 hover:bg-espresso-800 transition-all duration-300">
            <FaBox 
              size={16} 
              color="#fff" 
              onClick={() => navigate("/orderhistory")} 
              className="cursor-pointer"
            />
          </div>

          <div className="relative p-1 rounded-full cursor-pointer bg-espresso-950 hover:bg-espresso-800 transition-all duration-300" ref={notifRef}>
            <FaBell size={16} color="#fff" onClick={handleToggleNotifications} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-gold-400 rounded-full px-1 py-0 text-[9px] text-espresso-950 font-bold">{unreadCount}</span>}

            {showNotifications && (
              <div className="absolute top-10 right-0 w-[350px] max-w-[90vw] bg-espresso-900 text-cream-50 rounded-xl shadow-2xl p-3 z-[100]">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="m-0 text-cream-50 font-semibold">Notifications</h4>
                  <FaTimes className="cursor-pointer text-cream-50" onClick={() => setShowNotifications(false)} />
                </div>
                
                <div className="flex border-b border-espresso-800 mb-2.5">
                  <button className={`bg-transparent border-none px-3 py-2 cursor-pointer transition-all duration-300 ${activeTab === 'all' ? 'text-cream-50 border-b-2 border-gold-400' : 'text-cream-100/60 border-b-2 border-transparent hover:text-cream-50'}`} onClick={() => setActiveTab('all')}>All</button>
                  <button className={`bg-transparent border-none px-3 py-2 cursor-pointer transition-all duration-300 ${activeTab === 'orders' ? 'text-cream-50 border-b-2 border-gold-400' : 'text-cream-100/60 border-b-2 border-transparent hover:text-cream-50'}`} onClick={() => setActiveTab('orders')}>Orders</button>
                </div>

                <ul className="list-none p-0 m-0 max-h-[300px] overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <li className="text-center text-cream-100/60 py-5">No new notifications</li>
                  ) : (
                    filteredNotifications.map(notif => (
                      <li key={notif.id} className={`mb-2.5 p-2.5 border-b border-espresso-800 rounded-lg transition-all duration-300 cursor-pointer ${notif.read ? 'opacity-70 bg-white/5' : 'hover:bg-espresso-800/50'}`} onClick={() => handleNotificationClick(notif)}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2.5 flex-1">
                            <div className="flex items-center">
                              {notif.status === "Confirmed" || notif.status === "Accepted" ? 
                                <FaCheckCircle color="#2ecc71" /> : 
                                notif.status === "Cancelled" || notif.status === "Rejected" ? 
                                  <FaExclamationCircle color="#e74c3c" /> : 
                                  <FaClock color="#f39c12" />}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-sm text-cream-50">{notif.message}</span>
                              <span className="text-xs text-cream-100/60">{formatTimestamp(notif.timestamp)}</span>
                            </div>
                          </div>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-gold-400"></div>}
                        </div>
                      </li>
                    ))
                  )}
                </ul>

                {notifications.length > 0 && (
                  <div className="border-t border-espresso-800 pt-2.5 mt-1">
                    <button className="bg-transparent border border-gold-400 text-gold-400 rounded px-3 py-1.5 text-xs cursor-pointer hover:bg-gold-400 hover:text-espresso-950 transition-all duration-300" onClick={markAllAsRead}>Mark all as read</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="h-[75px]" />
    </>
  );
};

export default Navbar;
