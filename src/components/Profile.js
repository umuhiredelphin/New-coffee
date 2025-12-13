import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaCamera,
  FaCheckCircle,
  FaArrowLeft,
  FaSignOutAlt,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCreditCard,
  FaChartLine,
  FaWallet,
  FaBox,
  FaMoneyBillWave,
  FaTimes,
  FaExclamationTriangle,
  FaCog,
  FaEdit,
  FaSave,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
  FaImage,
  FaIdCard,
  FaChevronRight,
} from "react-icons/fa";
import axios from "axios";
import "./Profile.css";

// --- Notification Component ---
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="notification-close" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
};

// --- Helper: get full image URL ---
const getImageUrl = (path) => (path ? `http://localhost:5000${path}` : "https://via.placeholder.com/150");

// --- Main Profile Component ---
const Profile = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  const [userProfile, setUserProfile] = useState(initialUser);
  const [activeSection, setActiveSection] = useState("profile");
  const [orderHistory, setOrderHistory] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idMissing, setIdMissing] = useState(false);
  
  // Profile editing states
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Password states
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!userProfile) navigate("/login");
  }, [userProfile, navigate]);

  useEffect(() => {
    if (!userProfile) return;

    if (!userProfile.id && userProfile.email) {
      setIdMissing(true);
      axios.get(`http://localhost:5000/api/users/by-email/${encodeURIComponent(userProfile.email)}`)
        .then(res => {
          if (res.data.success) {
            const updatedUser = { ...userProfile, ...res.data.user };
            setUserProfile(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setIdMissing(false);
            fetchUserData(updatedUser);
          } else showNotification("Could not retrieve your user ID. Please log out and log back in.", "error");
        })
        .catch(() => showNotification("Could not retrieve your user ID. Please log out and log back in.", "error"))
        .finally(() => setLoading(false));
    } else {
      fetchUserData(userProfile);
    }
  }, [userProfile?.email]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || "",
        email: userProfile.email || "",
        phone: userProfile.phone || ""
      });
    }
  }, [userProfile]);

  const fetchUserData = (user) => {
    if (!user?.id) return;
    setLoading(true);

    axios.get(`http://localhost:5000/api/users/profile/${user.id}`)
      .then(profileRes => {
        if (profileRes.data.success) {
          const updatedUser = { ...user, ...profileRes.data.user };
          setUserProfile(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      })
      .catch(err => console.error("Failed to fetch profile:", err));

    axios.get(`http://localhost:5000/api/cart/orders/${encodeURIComponent(user.username)}`)
      .then(orderRes => {
        if (orderRes.data.success) {
          setOrderHistory(orderRes.data.orders);
          const total = orderRes.data.orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
          setTotalSpent(total);
        }
      })
      .catch(err => console.error("Failed to fetch order history:", err))
      .finally(() => setLoading(false));
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const refreshProfile = () => {
    if (!userProfile?.id) return;
    axios.get(`http://localhost:5000/api/users/profile/${userProfile.id}`)
      .then(res => {
        if (res.data.success) {
          const updatedUser = { ...userProfile, ...res.data.user };
          setUserProfile(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      })
      .catch(err => console.error("Failed to refresh profile:", err));
  };

  // Profile editing functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification("File size must be less than 5MB", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showNotification("Only image files are allowed", "error");
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      showNotification("No image file selected. Please choose an image first.", "error");
      return;
    }

    if (!userProfile?.id) {
      showNotification("User ID is missing. Please log out and log back in.", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("profileImage", profileImage);
    formData.append("userId", userProfile.id);

    try {
      const res = await axios.post("http://localhost:5000/api/users/upload-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        showNotification("Profile image updated successfully!");
        setPreviewImage(null);
        setProfileImage(null);
        refreshProfile();
      } else {
        showNotification(res.data.message || "Failed to update profile image.", "error");
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to update profile image.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile?.id) {
      showNotification("User ID is missing. Please log out and log back in.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/users/update-profile/${userProfile.id}`, formData);
      
      if (res.data.success) {
        showNotification("Profile updated successfully!");
        setEditMode(false);
        
        // Update user profile in state and localStorage
        const updatedUser = { ...userProfile, ...formData };
        setUserProfile(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        showNotification(res.data.message || "Failed to update profile.", "error");
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      username: userProfile.username || "",
      email: userProfile.email || "",
      phone: userProfile.phone || ""
    });
  };

  // Password functions
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New password and confirm password do not match!', "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users/change-password', {
        userId: userProfile.id,
        ...passwordData,
      });
      if (res.data.success) {
        showNotification('Password changed successfully!');
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to change password.', "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <header className="profile-header">
          <button className="back-button" onClick={() => navigate("/")}>
            <FaArrowLeft size={20} /> Back
          </button>
          <h1 className="profile-title">My Profile</h1>
        </header>
        <div className="profile-content">
          <div className="loading-container">
            <span className="loading-spinner"></span>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <button className="back-button" onClick={() => navigate("/")}>
          <FaArrowLeft size={20} /> Back
        </button>
        <h1 className="profile-title">My Profile</h1>
      </header>

      <div className="profile-content">
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        
        <div className="profile-layout">
          {/* Left Sidebar - Navigation */}
          <div className="profile-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-profile-image">
                <img
                  src={getImageUrl(userProfile?.profileImage)}
                  alt="Profile"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
                />
              </div>
              <h3 className="sidebar-username">{userProfile?.username || "User"}</h3>
              <p className="sidebar-email">{userProfile?.email || ""}</p>
            </div>
            
            <nav className="sidebar-nav">
              <button 
                className={`sidebar-nav-item ${activeSection === 'profile' ? 'active' : ''}`} 
                onClick={() => setActiveSection('profile')}
              >
                <FaUser size={18} />
                <span>Edit Profile</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeSection === 'password' ? 'active' : ''}`} 
                onClick={() => setActiveSection('password')}
              >
                <FaLock size={18} />
                <span>Change Password</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeSection === 'orders' ? 'active' : ''}`} 
                onClick={() => setActiveSection('orders')}
              >
                <FaBox size={18} />
                <span>Order History</span>
              </button>
              <button 
                className={`sidebar-nav-item ${activeSection === 'payments' ? 'active' : ''}`} 
                onClick={() => setActiveSection('payments')}
              >
                <FaCreditCard size={18} />
                <span>Payment History</span>
              </button>
            </nav>
            
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt size={16} />
              <span>Log Out</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="profile-main">
            {activeSection === 'profile' && (
              <div className="settings-section">
                <div className="settings-header">
                  <h2 className="settings-title">Edit Profile</h2>
                  {!editMode ? (
                    <button className="edit-button" onClick={() => setEditMode(true)}>
                      <FaEdit size={16} /> Edit
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                      <button className="save-button" onClick={handleSaveProfile} disabled={saving}>
                        {saving ? <><span className="loading-spinner"></span> Saving...</> : <><FaSave size={16} /> Save</>}
                      </button>
                    </div>
                  )}
                </div>

                <div className="settings-content">
                  <div className="profile-image-section">
                    <div className="profile-image-container">
                      <img
                        src={previewImage || getImageUrl(userProfile?.profileImage)}
                        alt="Profile"
                        className="profile-image"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
                      />
                    </div>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    <div className="image-actions">
                      <button className="secondary-button" onClick={() => fileInputRef.current.click()}>
                        <FaCamera size={16} /> Change Photo
                      </button>
                      
                      {previewImage && (
                        <button className="primary-button" onClick={handleImageUpload} disabled={uploading}>
                          {uploading ? <><span className="loading-spinner"></span> Uploading...</> : <><FaCheckCircle size={16} /> Upload</>}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Member Since</label>
                      <input
                        type="text"
                        value={formatDate(userProfile?.created_at)}
                        disabled
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'password' && (
              <div className="settings-section">
                <div className="settings-header">
                  <h2 className="settings-title">Change Password</h2>
                </div>

                <div className="settings-content">
                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordInputChange}
                          className="form-input"
                          required
                        />
                        <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility('current')}>
                          {showPassword.current ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          className="form-input"
                          required
                        />
                        <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility('new')}>
                          {showPassword.new ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <div className="password-input-container">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          className="form-input"
                          required
                        />
                        <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility('confirm')}>
                          {showPassword.confirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="primary-button" disabled={isSubmitting}>
                      {isSubmitting ? <><span className="loading-spinner"></span> Changing...</> : <><FaLock size={16} /> Change Password</>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeSection === 'orders' && (
              <div className="settings-section">
                <div className="settings-header">
                  <h2 className="settings-title">Order History</h2>
                </div>

                <div className="settings-content">
                  <div className="stats-container">
                    <div className="stat-item">
                      <FaBox size={24} color="#3498db" />
                      <p className="stat-value">{orderHistory.length}</p>
                      <p className="stat-label">Total Orders</p>
                    </div>
                    <div className="stat-item">
                      <FaMoneyBillWave size={24} color="#2ecc71" />
                      <p className="stat-value">{formatCurrency(totalSpent)}</p>
                      <p className="stat-label">Total Spent</p>
                    </div>
                  </div>

                  {orderHistory.length === 0 ? (
                    <div className="empty-state">
                      <FaInfoCircle size={32} color="#95a5a6" />
                      <p>No order history available</p>
                    </div>
                  ) : (
                    <div className="order-list">
                      {orderHistory.map(order => (
                        <div key={order.id} className="order-item">
                          <div className="order-details">
                            <h4 className="order-id">Order #{order.id}</h4>
                            <p className="order-date">{formatDate(order.created_at)}</p>
                            <p className="order-status">{order.status}</p>
                          </div>
                          <div className="order-amount">
                            <p className="order-total">{formatCurrency(order.total)}</p>
                            <FaChevronRight color="#ccc" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'payments' && (
              <div className="settings-section">
                <div className="settings-header">
                  <h2 className="settings-title">Payment History</h2>
                </div>

                <div className="settings-content">
                  <div className="stats-container">
                    <div className="stat-item">
                      <FaWallet size={24} color="#3498db" />
                      <p className="stat-value">{formatCurrency(totalSpent)}</p>
                      <p className="stat-label">Total Spent</p>
                    </div>
                    <div className="stat-item">
                      <FaChartLine size={24} color="#2ecc71" />
                      <p className="stat-value">{orderHistory.length}</p>
                      <p className="stat-label">Transactions</p>
                    </div>
                  </div>

                  {orderHistory.length === 0 ? (
                    <div className="empty-state">
                      <FaInfoCircle size={32} color="#95a5a6" />
                      <p>No payment history available</p>
                    </div>
                  ) : (
                    <div className="payment-list">
                      {orderHistory.map(payment => (
                        <div key={payment.id} className="payment-item">
                          <div className="payment-details">
                            <h4 className="payment-id">Payment #{payment.id}</h4>
                            <p className="payment-date">{formatDate(payment.created_at)}</p>
                            <p className="payment-description">{payment.description || `Order #${payment.order_id}`}</p>
                          </div>
                          <div className="payment-amount">
                            <p className="payment-total">{formatCurrency(payment.amount)}</p>
                            <span className="payment-status" style={{ backgroundColor: 
                              payment.status === 'paid' ? '#2ecc71' : 
                              payment.status === 'pending' ? '#f39c12' : 
                              '#e74c3c' }}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;