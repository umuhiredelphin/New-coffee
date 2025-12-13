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
  FaHistory,
  FaBars,
  FaBox,       // Icon for latest orders
  FaTh,        // Icon for profile menu
  FaCog,       // Settings icon
  FaChevronRight, // Icon for menu items
} from "react-icons/fa";
import axios from "axios";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrollShadow, setScrollShadow] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'orders'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showProfileMenu, setShowProfileMenu] = useState(false); // State for profile menu dropdown
  const profileMenuRef = useRef(null); // Ref for detecting clicks outside the profile menu

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const notifRef = useRef(null);

  // Helper: get full image URL
  const getImageUrl = (path) => (path ? `http://localhost:5000${path}` : "https://via.placeholder.com/150");

  // --- Effects ---
  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add/remove scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrollShadow(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load cart count from localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  }, []);

  // Close dropdowns when clicking outside
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

  // --- Data Fetching ---
  // Fetch notifications from the server
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
    const interval = setInterval(fetchNotifications, 30000); // Refetch every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // --- Event Handlers ---
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
    setIsMobileMenuOpen(false);
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

  const isMobile = windowWidth <= 768;

  return (
    <>
      <nav style={{...styles.navbar, boxShadow: scrollShadow ? "0 3px 12px rgba(0,0,0,0.3)" : "none"}}>
        <div style={styles.left}>
          {user ? (
            <div style={styles.profileSection}>
              <div 
                style={styles.profileImageContainer}
                onClick={() => navigate("/profile")}
              >
                {user.profileImage ? (
                  <img
                    src={getImageUrl(user.profileImage)}
                    alt="Profile"
                    style={styles.profileImage}
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
                  style={{ 
                    display: user.profileImage ? "none" : "flex" 
                  }} 
                />
              </div>
              
              {/* Profile Menu Toggle Button */}
              <div 
                style={styles.profileMenuToggle}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <FaTh size={24} color="#fff" />
              </div>
              
              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div style={styles.profileMenu} ref={profileMenuRef}>
                  <div style={styles.profileMenuHeader}>
                    <div style={styles.profileMenuImageContainer}>
                      {user.profileImage ? (
                        <img
                          src={getImageUrl(user.profileImage)}
                          alt="Profile"
                          style={styles.profileMenuImage}
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
                        style={{ 
                          display: user.profileImage ? "none" : "flex" 
                        }} 
                      />
                    </div>
                    <div style={styles.profileMenuInfo}>
                      <div style={styles.profileMenuName}>{user?.username || "User"}</div>
                      <div style={styles.profileMenuEmail}>{user?.email || ""}</div>
                    </div>
                  </div>
                  
                  <div style={styles.profileMenuItems}>
                    <button 
                      style={styles.profileMenuItem} 
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
                      style={styles.profileMenuItem} 
                      onClick={() => {
                        navigate("/settings"); // Navigate to the new settings page
                        setShowProfileMenu(false);
                      }}
                    >
                      <FaCog size={16} />
                      <span>Settings</span>
                      <FaChevronRight size={12} color="#666" />
                    </button>
                    <button 
                      style={{...styles.profileMenuItem, ...styles.logoutItem}} 
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
            <FaUserCircle size={28} color="#777" onClick={() => handleNavClick("/login")} style={{ cursor: "pointer" }} />
          )}
        </div>

        {/* Hamburger menu for mobile */}
        {isMobile && (
          <div style={styles.mobileMenuIcon} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FaTimes size={24} color="#fff" /> : <FaBars size={24} color="#fff" />}
          </div>
        )}

        {/* Desktop navigation links */}
        {!isMobile && (
          <ul style={styles.navLinks}>
            <li><button style={styles.linkBtn} onClick={() => handleNavClick("/")}><FaHome /> Home</button></li>
            <li><button style={styles.linkBtn} onClick={() => handleNavClick("/menu")}><FaUtensils /> Menu</button></li>
            <li><button style={styles.linkBtn} onClick={() => handleNavClick("/book-table")}><FaChair /> Book Table</button></li>
            <li><button style={styles.linkBtn} onClick={() => handleNavClick("/about")}><FaInfoCircle /> About</button></li>
            <li><button style={styles.linkBtn} onClick={() => handleNavClick("/help")}><FaQuestionCircle /> Help</button></li>
          </ul>
        )}

        <div style={styles.rightSection}>
          <div style={styles.iconWrapper} onClick={() => handleNavClick("/cart")}>
            <FaShoppingCart size={22} color="#fff" />
            {cartCount > 0 && <span style={styles.iconBadge}>{cartCount}</span>}
          </div>

          {/* Latest Orders Icon */}
          <div style={styles.iconWrapper}>
            <FaBox 
              size={22} 
              color="#fff" 
              onClick={() => navigate("/orderhistory")} 
              style={{ cursor: "pointer" }}
            />
          </div>

          {/* Notifications Icon */}
          <div style={styles.iconWrapper} ref={notifRef}>
            <FaBell size={22} color="#fff" onClick={handleToggleNotifications} />
            {unreadCount > 0 && <span style={styles.iconBadge}>{unreadCount}</span>}

            {showNotifications && (
              <div style={{
                ...styles.notificationBox,
                ...(isMobile ? styles.notificationBoxMobile : {})
              }}>
                <div style={styles.notificationHeader}>
                  <h4 style={{ margin: 0 }}>Notifications</h4>
                  <FaTimes style={{ cursor: "pointer" }} onClick={() => setShowNotifications(false)} />
                </div>
                
                <div style={styles.notificationTabs}>
                  <button style={{...styles.tabBtn, ...(activeTab === 'all' ? styles.activeTab : {})}} onClick={() => setActiveTab('all')}>All</button>
                  <button style={{...styles.tabBtn, ...(activeTab === 'orders' ? styles.activeTab : {})}} onClick={() => setActiveTab('orders')}>Orders</button>
                </div>

                <ul style={styles.notificationList}>
                  {filteredNotifications.length === 0 ? (
                    <li style={styles.noNotif}>No new notifications</li>
                  ) : (
                    filteredNotifications.map(notif => (
                      <li key={notif.id} style={{...styles.notificationItem, ...(notif.read ? styles.readNotification : {})}} onClick={() => handleNotificationClick(notif)}>
                        <div style={styles.notifRow}>
                          <div style={styles.notifContent}>
                            <div style={styles.notifIcon}>
                              {notif.status === "Confirmed" || notif.status === "Accepted" ? 
                                <FaCheckCircle color="#2ecc71" /> : 
                                notif.status === "Cancelled" || notif.status === "Rejected" ? 
                                  <FaExclamationCircle color="#e74c3c" /> : 
                                  <FaClock color="#f39c12" />}
                            </div>
                            <div style={styles.notifDetails}>
                              <span style={styles.notifMessage}>{notif.message}</span>
                              <span style={styles.notifTime}>{formatTimestamp(notif.timestamp)}</span>
                            </div>
                          </div>
                          {!notif.read && <div style={styles.unreadDot}></div>}
                        </div>
                      </li>
                    ))
                  )}
                </ul>

                {notifications.length > 0 && (
                  <div style={styles.notificationFooter}>
                    <button style={styles.markAllReadBtn} onClick={markAllAsRead}>Mark all as read</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobile && isMobileMenuOpen && (
        <div style={styles.mobileMenuOverlay}>
          <ul style={styles.mobileNavLinks}>
            <li><button style={styles.mobileLinkBtn} onClick={() => handleNavClick("/")}><FaHome /> Home</button></li>
            <li><button style={styles.mobileLinkBtn} onClick={() => handleNavClick("/menu")}><FaUtensils /> Menu</button></li>
            <li><button style={styles.mobileLinkBtn} onClick={() => handleNavClick("/book-table")}><FaChair /> Book Table</button></li>
            <li><button style={styles.mobileLinkBtn} onClick={() => handleNavClick("/about")}><FaInfoCircle /> About</button></li>
            <li><button style={styles.mobileLinkBtn} onClick={() => handleNavClick("/help")}><FaQuestionCircle /> Help</button></li>
          </ul>
        </div>
      )}

      <div style={{ height: "75px" }} />
    </>
  );
};

// --- Styles ---
const styles = {
  navbar: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: "#111", 
    padding: "12px 30px", 
    margin: "0 auto", 
    maxWidth: "1200px", 
    color: "#fff", 
    position: "fixed", 
    top: 0, 
    left: 0, 
    right: 0, 
    width: "100%", 
    zIndex: 9999, 
    borderRadius: "15px 15px 0 0", 
    transition: "box-shadow 0.3s ease, background-color 0.3s ease" 
  },
  left: { display: "flex", alignItems: "center" },
  profileSection: {
    display: "flex",
    alignItems: "center",
    position: "relative"
  },
  profileImageContainer: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    overflow: "hidden",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginRight: "5px"
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%"
  },
  profileMenuToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px", // Increased from 6px to accommodate larger icon
    borderRadius: "50%",
    cursor: "pointer",
    background: "#222",
    transition: "background 0.2s"
  },
  profileMenu: {
    position: "absolute",
    top: "0",
    left: "45px",
    width: "280px",
    backgroundColor: "#1e1e1e",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
    zIndex: 100,
    overflow: "hidden"
  },
  profileMenuHeader: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #333"
  },
  profileMenuImageContainer: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    overflow: "hidden",
    marginRight: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  profileMenuImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  profileMenuInfo: {
    display: "flex",
    flexDirection: "column"
  },
  profileMenuName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff"
  },
  profileMenuEmail: {
    fontSize: "14px",
    color: "#aaa"
  },
  profileMenuItems: {
    display: "flex",
    flexDirection: "column"
  },
  profileMenuItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 15px",
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.2s",
    borderBottom: "1px solid #333"
  },
  logoutItem: {
    color: "#e74c3c"
  },
  navLinks: { 
    listStyle: "none", 
    display: "flex", 
    gap: "25px", 
    margin: 0, 
    padding: 0, 
    alignItems: "center" 
  },
  linkBtn: { 
    background: "none", 
    border: "none", 
    color: "#fff", 
    fontWeight: 500, 
    display: "flex", 
    alignItems: "center", 
    gap: "6px", 
    cursor: "pointer", 
    fontSize: "16px", 
    padding: "8px 12px", 
    borderRadius: "8px", 
    transition: "0.2s" 
  },
  rightSection: { 
    display: "flex", 
    alignItems: "center", 
    gap: "15px", 
    marginRight: "20px" 
  },
  iconWrapper: { 
    position: "relative", 
    padding: "6px", 
    borderRadius: "50%", 
    cursor: "pointer", 
    background: "#222" 
  },
  iconBadge: { 
    position: "absolute", 
    top: "-6px", 
    right: "-6px", 
    background: "#e74c3c", 
    borderRadius: "50%", 
    padding: "2px 6px", 
    fontSize: "11px", 
    color: "#fff" 
  },
  notificationBox: { 
    position: "absolute", 
    top: "40px", 
    right: 0, 
    backgroundColor: "#1e1e1e", 
    color: "#fff", 
    borderRadius: "12px", 
    boxShadow: "0 4px 15px rgba(0,0,0,0.5)", 
    padding: "12px", 
    width: "350px", 
    zIndex: 100 
  },
  notificationBoxMobile: {
    width: "90vw",
    maxWidth: "350px",
    right: "5vw",
    left: "5vw"
  },
  notificationHeader: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "8px" 
  },
  notificationTabs: { 
    display: "flex", 
    borderBottom: "1px solid #333", 
    marginBottom: "10px" 
  },
  tabBtn: { 
    background: "none", 
    border: "none", 
    color: "#aaa", 
    padding: "8px 12px", 
    cursor: "pointer", 
    borderBottom: "2px solid transparent", 
    transition: "all 0.2s" 
  },
  activeTab: { 
    color: "#fff", 
    borderBottom: "2px solid #3498db" 
  },
  notificationList: { 
    listStyle: "none", 
    padding: 0, 
    margin: 0, 
    maxHeight: "300px", 
    overflowY: "auto" 
  },
  notificationItem: { 
    marginBottom: "10px", 
    padding: "10px", 
    borderBottom: "1px solid #333", 
    borderRadius: "6px", 
    transition: "background 0.2s", 
    cursor: "pointer" 
  },
  readNotification: { 
    opacity: 0.7, 
    background: "rgba(255,255,255,0.05)" 
  },
  notifRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  notifContent: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    flex: 1 
  },
  notifIcon: { 
    display: "flex", 
    alignItems: "center" 
  },
  notifDetails: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "4px" 
  },
  notifMessage: { 
    fontWeight: 500, 
    fontSize: "14px" 
  },
  notifTime: { 
    fontSize: "12px", 
    color: "#aaa" 
  },
  unreadDot: { 
    width: "8px", 
    height: "8px", 
    borderRadius: "50%", 
    background: "#3498db" 
  },
  noNotif: { 
    textAlign: "center", 
    color: "#aaa", 
    padding: "20px 0" 
  },
  notificationFooter: { 
    borderTop: "1px solid #333", 
    paddingTop: "10px", 
    marginTop: "5px" 
  },
  markAllReadBtn: { 
    background: "none", 
    border: "1px solid #3498db", 
    color: "#3498db", 
    borderRadius: "4px", 
    padding: "6px 12px", 
    fontSize: "12px", 
    cursor: "pointer", 
    transition: "all 0.2s" 
  },
  mobileMenuIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: "5px"
  },
  mobileMenuOverlay: {
    position: "fixed",
    top: "75px",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    zIndex: 9998,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "20px"
  },
  mobileNavLinks: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  mobileLinkBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "18px",
    padding: "15px 20px",
    borderRadius: "8px",
    transition: "0.2s",
    width: "80%",
    justifyContent: "flex-start"
  }
};

export default Navbar;