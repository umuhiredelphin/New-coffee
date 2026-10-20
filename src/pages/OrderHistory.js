import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import CoffeeLoader from "../components/CoffeeLoader";
import { 
  FaCalendarAlt, 
  FaBox,          
  FaMoneyBillWave, 
  FaSearch, 
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaCheck,
  FaTruck,
  FaShoppingBag,
  FaClock
} from "react-icons/fa";

const OrderHistory = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [dateFilter, setDateFilter] = useState("all");

  const user = JSON.parse(localStorage.getItem("user")); // assume always exists

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/orders/history/${user.id}`);

        setOrderHistory(res.data);
        setFilteredOrders(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch order history:", err);
        setError("Failed to load order history. Please try again later.");
        setOrderHistory([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user.id]);

  useEffect(() => {
    let filtered = [...orderHistory];

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.items?.some(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "7days":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          filterDate.setMonth(now.getMonth() - 6);
          break;
        default:
          break;
      }

      filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
    }

    setFilteredOrders(filtered);
  }, [orderHistory, searchTerm, statusFilter, dateFilter]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpandedOrders = new Set(expandedOrders);
    if (newExpandedOrders.has(orderId)) {
      newExpandedOrders.delete(orderId);
    } else {
      newExpandedOrders.add(orderId);
    }
    setExpandedOrders(newExpandedOrders);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered": return <FaCheck />;
      case "processing": return <FaBox />;
      case "shipped": return <FaTruck />;
      case "cancelled": return <FaTimes />;
      case "pending": return <FaClock />;
      default: return <FaShoppingBag />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "#10b981";
      case "processing": return "#3b82f6";
      case "shipped": return "#f59e0b";
      case "cancelled": return "#ef4444";
      case "pending": return "#8b5cf6";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "delivered": return "Delivered";
      case "processing": return "Processing";
      case "shipped": return "Shipped";
      case "cancelled": return "Cancelled";
      case "pending": return "Pending";
      default: return status;
    }
  };

  return (
    <div className="order-history-page">
      <Navbar />

      <div className="order-history-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Track and manage your orders</p>
          </div>
          <div className="order-stats">
            <div className="stat-card">
              <div className="stat-number">{filteredOrders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {filteredOrders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="stat-label">Delivered</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by order ID or item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <FaCalendarAlt className="filter-icon" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading && <CoffeeLoader message="Loading your orders..." />}
        {error && <p className="error">{error}</p>}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="empty-state">
            <FaBox className="empty-icon" />
            <h3>No orders found</h3>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className={`order-card ${expandedOrders.has(order.id) ? "expanded" : ""}`}>
                <div className="order-header" onClick={() => toggleOrderExpansion(order.id)}>
                  <div className="order-info">
                    <div className="order-id">#{order.id}</div>
                    <div className="order-date"><FaCalendarAlt /> {formatDate(order.created_at)}</div>
                  </div>
                  <div className="order-status" style={{color: getStatusColor(order.status)}}>
                    {getStatusIcon(order.status)} {getStatusText(order.status)}
                  </div>
                  <div className="order-total"><FaMoneyBillWave /> {order.total} RWF</div>
                  <div className="expand-icon">{expandedOrders.has(order.id) ? <FaChevronUp /> : <FaChevronDown />}</div>
                </div>

                {expandedOrders.has(order.id) && (
                  <div className="order-details">
                    <h4>Items</h4>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="item-row">
                        <FaBox /> {item.name} x{item.quantity} = {item.price * item.quantity} RWF
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
