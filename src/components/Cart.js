import React, { useEffect, useState, useRef } from "react";
import {
  FaEdit,
  FaTrash,
  FaShoppingCart,
  FaCheckCircle,
  FaHome,
  FaClock,
  FaCreditCard,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaMinus,
  FaPlus,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import Navbar from "./Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderRemoved, setOrderRemoved] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showLastOrderPayment, setShowLastOrderPayment] = useState(false);
  const [paymentOption, setPaymentOption] = useState("50%");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [animateMessage, setAnimateMessage] = useState(false);

  const navigate = useNavigate();

  const warningTimer = useRef(null);
  const removeTimer = useRef(null);
  const lastOrderWarningTimer = useRef(null);
  const lastOrderRemoveTimer = useRef(null);

  const clearAllTimers = () => {
    [warningTimer, removeTimer, lastOrderWarningTimer, lastOrderRemoveTimer].forEach(
      (t) => t.current && clearTimeout(t.current)
    );
  };

  const startPaymentTimers = (orderId) => {
    warningTimer.current = setTimeout(() => {
      setMessage(
        <div style={msgStyle.warning}>
          <FaExclamationTriangle style={{ marginRight: 8 }} />
          Warning: Please pay within 1 minute to keep the order.
        </div>
      );
      setAnimateMessage(true);
      setTimeout(() => setAnimateMessage(false), 500);
    }, 60000);

    removeTimer.current = setTimeout(() => {
      removeOrderFromDB(orderId);
    }, 120000);
  };

  const startLastOrderTimers = (orderId) => {
    lastOrderWarningTimer.current = setTimeout(() => {
      setMessage(
        <div style={msgStyle.warning}>
          <FaExclamationTriangle style={{ marginRight: 8 }} />
          Warning: Pay the remaining amount within 1 minute or the order will be removed.
        </div>
      );
      setAnimateMessage(true);
      setTimeout(() => setAnimateMessage(false), 500);
    }, 60000);

    lastOrderRemoveTimer.current = setTimeout(() => {
      removeOrderFromDB(orderId);
    }, 120000);
  };

  const removeOrderFromDB = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
      setMessage(
        <div style={msgStyle.error}>
          <FaTimes style={{ marginRight: 8 }} />
          Error: Your order was removed because you did not pay on time.
        </div>
      );
      setAnimateMessage(true);
      setTimeout(() => setAnimateMessage(false), 500);
      setShowPaymentForm(false);
      setShowLastOrderPayment(false);
      setOrderRemoved(true);
      setLastOrder(null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
  }, []);

  useEffect(() => {
    const sum = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);
    setTotal(sum);
  }, [cartItems]);

  useEffect(() => {
    const fetchLast = async () => {
      try {
        const buyer = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await axios.get(
          `http://localhost:5000/api/orders/last?buyerId=${buyer.id}`
        );
        if (res.data) setLastOrder(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLast();
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const handleRemove = (id) => {
    const updated = cartItems.filter((i) => i.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleEdit = (id, currentQuantity) => {
    setEditingItemId(id);
    setEditQuantity(currentQuantity);
  };

  const saveEdit = () => {
    if (editQuantity > 0) {
      const updated = cartItems.map((i) =>
        i.id === editingItemId ? { ...i, quantity: editQuantity } : i
      );
      setCartItems(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
      setEditingItemId(null);
    }
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditQuantity(1);
  };

  const handleConfirmOrder = async () => {
    if (!cartItems.length) return alert("Your cart is empty.");
    const buyer = JSON.parse(localStorage.getItem("user") || "{}");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/cart/confirm", {
        buyerId: buyer.id,
        buyerName: buyer.username,
        items: cartItems,
      });

      if (res.data.success) {
        setMessage(
          <div style={msgStyle.success}>
            <FaCheckCircle style={{ fontSize: 24, marginRight: 6 }} />
            <span>Your order has been placed!</span>
          </div>
        );
        setAnimateMessage(true);
        setTimeout(() => setAnimateMessage(false), 500);

        const newOrder = {
          id: res.data.orderId,
          items: cartItems,
          total,
          status: "pending",
          created_at: new Date().toISOString(),
        };
        setLastOrder(newOrder);
        setShowPaymentForm(true);
        setOrderPlaced(true);

        localStorage.removeItem("cart");
        setCartItems([]);

        startPaymentTimers(newOrder.id);
      } else {
        setMessage(<div style={msgStyle.error}>Failed to place order.</div>);
        setAnimateMessage(true);
        setTimeout(() => setAnimateMessage(false), 500);
      }
    } catch (error) {
      console.error(error);
      setMessage(<div style={msgStyle.error}>Server error.</div>);
      setAnimateMessage(true);
      setTimeout(() => setAnimateMessage(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentMethod) return alert("Choose a payment method.");

    clearTimeout(warningTimer.current);
    clearTimeout(removeTimer.current);

    setMessage(
      <div style={msgStyle.success}>
        <FaCheckCircle style={{ fontSize: 24, marginRight: 6 }} />
        <span>
          Payment submitted ({paymentMethod}).<br />
          Your order is now <b>paid</b> (pending verification).
        </span>
      </div>
    );
    setAnimateMessage(true);
    setTimeout(() => setAnimateMessage(false), 500);
    setShowPaymentForm(false);
    if (lastOrder) setLastOrder({ ...lastOrder, status: "paid" });
  };

  const openLastOrderPayment = () => {
    if (!lastOrder) return;
    setShowLastOrderPayment(true);
    startLastOrderTimers(lastOrder.id);
  };

  const handleLastOrderPayment = async (e) => {
    e.preventDefault();
    clearTimeout(lastOrderWarningTimer.current);
    clearTimeout(lastOrderRemoveTimer.current);

    if (!lastOrder) return;
    const amount = paymentOption === "50%" ? lastOrder.total * 0.5 : lastOrder.total;

    try {
      await axios.post(`http://localhost:5000/api/orders/${lastOrder.id}/pay`, {
        amount,
        method: paymentMethod,
      });
      setMessage(
        <div style={msgStyle.success}>
          <FaCheckCircle style={{ marginRight: 8 }} />
          Success: {paymentOption} paid. Order confirmed.
        </div>
      );
      setAnimateMessage(true);
      setTimeout(() => setAnimateMessage(false), 500);
      setLastOrder({ ...lastOrder, status: "paid" });
    } catch (err) {
      setMessage(<div style={msgStyle.error}>Payment failed.</div>);
      setAnimateMessage(true);
      setTimeout(() => setAnimateMessage(false), 500);
    } finally {
      setShowLastOrderPayment(false);
    }
  };

  const handleGoHome = () => navigate("/");

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>
          <FaShoppingCart style={{ marginRight: 12 }} />
          Your Cart
        </h2>

        {message && (
          <div 
            style={{
              ...styles.messageContainer,
              ...(animateMessage ? styles.messageAnimated : {})
            }}
          >
            {message}
          </div>
        )}

        {lastOrder && !showLastOrderPayment && (
          <div style={styles.lastOrderContainer}>
            <h3 style={styles.lastOrderTitle}>
              <FaClock style={{ marginRight: 8 }} />
              Last Order Details
            </h3>
            <div style={styles.lastOrderTable}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell}>Order ID</th>
                    <th style={styles.tableHeaderCell}>Date</th>
                    <th style={styles.tableHeaderCell}>Items</th>
                    <th style={styles.tableHeaderCell}>Total</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tableRow}>
                    <td style={styles.tableCell}>#{lastOrder.id}</td>
                    <td style={styles.tableCell}>
                      {new Date(lastOrder.created_at).toLocaleDateString()}
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.itemsCell}>
                        {lastOrder.items && lastOrder.items.map((item, index) => (
                          <div key={index} style={styles.itemInTable}>
                            {item.name} x {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={styles.tableCell}>{lastOrder.total} RWF</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(lastOrder.status === 'paid' ? styles.statusPaid : styles.statusPending)
                      }}>
                        {lastOrder.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        style={{
                          ...styles.lastOrderBtn,
                          ...(lastOrder.status !== "pending" ? styles.disabledBtn : {})
                        }}
                        onClick={openLastOrderPayment}
                        disabled={lastOrder.status !== "pending"}
                      >
                        {lastOrder.status === "pending"
                          ? "Complete Payment"
                          : "Already Paid"}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {cartItems.length === 0 && !showPaymentForm && !orderRemoved ? (
          <div style={styles.emptyCart}>
            <FaShoppingCart size={64} style={styles.emptyCartIcon} />
            <p style={styles.emptyCartText}>Your cart is empty</p>
            <button style={styles.continueShoppingBtn} onClick={handleGoHome}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div style={styles.cartItems}>
              {cartItems.map((i) => (
                <div key={i.id} style={styles.cartItem}>
                  <img
                    src={`http://localhost:5000${i.image}`}
                    alt={i.name}
                    style={styles.itemImage}
                  />
                  <div style={styles.itemInfo}>
                    <h3 style={styles.itemName}>{i.name}</h3>
                    <p style={styles.itemPrice}>{i.price} RWF</p>
                    
                    {editingItemId === i.id ? (
                      <div style={styles.quantityEditor}>
                        <button 
                          style={styles.quantityBtn}
                          onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                        >
                          <FaMinus />
                        </button>
                        <input 
                          type="number" 
                          min="1" 
                          value={editQuantity} 
                          onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                          style={styles.quantityInput}
                        />
                        <button 
                          style={styles.quantityBtn}
                          onClick={() => setEditQuantity(editQuantity + 1)}
                        >
                          <FaPlus />
                        </button>
                        <div style={styles.editActions}>
                          <button style={styles.saveBtn} onClick={saveEdit}>
                            <FaSave />
                          </button>
                          <button style={styles.cancelBtn} onClick={cancelEdit}>
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.itemQuantity}>
                        <span style={styles.quantityLabel}>Quantity: {i.quantity}</span>
                        <span style={styles.itemTotal}>
                          Total: {i.price * i.quantity} RWF
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={styles.itemActions}>
                    <button 
                      style={{
                        ...styles.actionBtn,
                        ...(editingItemId !== null ? styles.disabledBtn : {})
                      }}
                      onClick={() => handleEdit(i.id, i.quantity)}
                      disabled={editingItemId !== null}
                    >
                      <FaEdit />
                    </button>
                    <button style={{...styles.actionBtn, ...styles.deleteBtn}} onClick={() => handleRemove(i.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!showPaymentForm && !orderRemoved && cartItems.length > 0 && (
              <div style={styles.cartSummary}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Subtotal:</span>
                  <span style={styles.summaryValue}>{total} RWF</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Shipping:</span>
                  <span style={styles.summaryValue}>0 RWF</span>
                </div>
                <div style={{...styles.summaryRow, ...styles.grandTotalRow}}>
                  <span style={styles.summaryLabel}>Total:</span>
                  <span style={styles.summaryValue}>{total} RWF</span>
                </div>
                <button
                  style={styles.confirmOrderBtn}
                  onClick={handleConfirmOrder}
                  disabled={loading}
                >
                  {loading ? (
                    "Placing Order..."
                  ) : (
                    <>
                      <FaShoppingCart style={{ marginRight: 8 }} />
                      Confirm Order
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {showPaymentForm && !orderRemoved && (
          <div style={styles.paymentForm}>
            <h3 style={styles.paymentTitle}>Choose Payment Method</h3>
            <form onSubmit={handlePaymentSubmit}>
              <div style={styles.paymentOptions}>
                <label style={styles.paymentOption}>
                  <input
                    type="radio"
                    name="payment"
                    value="MoMo"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={styles.radioInput}
                  />
                  <div style={styles.paymentOptionContent}>
                    <FaMoneyBillWave style={styles.paymentIcon} />
                    <div>
                      <span style={styles.paymentOptionTitle}>Pay via MoMo</span>
                      <small style={styles.paymentOptionDesc}>Code 44973</small>
                    </div>
                  </div>
                </label>
                <label style={styles.paymentOption}>
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Delivery"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={styles.radioInput}
                  />
                  <div style={styles.paymentOptionContent}>
                    <FaCreditCard style={styles.paymentIcon} />
                    <div>
                      <span style={styles.paymentOptionTitle}>Cash on Delivery</span>
                      <small style={styles.paymentOptionDesc}>Pay when you receive</small>
                    </div>
                  </div>
                </label>
              </div>
              <button type="submit" style={styles.submitPaymentBtn}>
                Submit Payment Choice
              </button>
            </form>
          </div>
        )}

        {showLastOrderPayment && lastOrder && (
          <div style={styles.paymentForm}>
            <h3 style={styles.paymentTitle}>
              Pay Remaining Amount – Order #{lastOrder.id}
            </h3>
            <p style={styles.paymentAmount}>
              Total: <strong>{lastOrder.total} RWF</strong>
            </p>
            <form onSubmit={handleLastOrderPayment}>
              <div style={styles.paymentOptions}>
                <div style={styles.paymentAmountOptions}>
                  <label style={styles.paymentAmountOption}>
                    <input
                      type="radio"
                      name="pct"
                      value="50%"
                      checked={paymentOption === "50%"}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      style={styles.radioInput}
                    />
                    <div style={styles.amountOptionContent}>
                      <span style={styles.amountOptionTitle}>Pay 50%</span>
                      <span style={styles.amountOptionValue}>{lastOrder.total * 0.5} RWF</span>
                    </div>
                  </label>
                  <label style={styles.paymentAmountOption}>
                    <input
                      type="radio"
                      name="pct"
                      value="100%"
                      checked={paymentOption === "100%"}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      style={styles.radioInput}
                    />
                    <div style={styles.amountOptionContent}>
                      <span style={styles.amountOptionTitle}>Pay 100%</span>
                      <span style={styles.amountOptionValue}>{lastOrder.total} RWF</span>
                    </div>
                  </label>
                </div>
                
                <div style={styles.paymentMethodOptions}>
                  <label style={styles.paymentOption}>
                    <input
                      type="radio"
                      name="methodLast"
                      value="MoMo"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={styles.radioInput}
                    />
                    <div style={styles.paymentOptionContent}>
                      <FaMoneyBillWave style={styles.paymentIcon} />
                      <div>
                        <span style={styles.paymentOptionTitle}>MoMo</span>
                      </div>
                    </div>
                  </label>
                  <label style={styles.paymentOption}>
                    <input
                      type="radio"
                      name="methodLast"
                      value="Cash on Delivery"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={styles.radioInput}
                    />
                    <div style={styles.paymentOptionContent}>
                      <FaCreditCard style={styles.paymentIcon} />
                      <div>
                        <span style={styles.paymentOptionTitle}>Cash on Delivery</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <button type="submit" style={styles.submitPaymentBtn}>
                Confirm Payment
              </button>
            </form>
          </div>
        )}

        {orderPlaced && !showPaymentForm && (
          <div style={styles.orderSuccessActions}>
            <button style={styles.homeBtn} onClick={handleGoHome}>
              <FaHome style={{ marginRight: 8 }} />
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- STYLES -------------------- */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  container: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '30px 20px'
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 40,
    fontSize: '2.5rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  messageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    padding: '15px 20px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  messageAnimated: {
    animation: 'pulse 0.5s ease-in-out'
  },
  lastOrderContainer: {
    background: 'white',
    borderRadius: 16,
    padding: 25,
    marginBottom: 30,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.3s ease'
  },
  lastOrderTitle: {
    margin: '0 0 20px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.5rem',
    color: '#2c3e50',
    fontWeight: '600'
  },
  lastOrderTable: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 20
  },
  tableHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  tableHeaderCell: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '1rem'
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
    '&:hover': {
      backgroundColor: '#f8f9fa'
    }
  },
  tableCell: {
    padding: '15px',
    color: '#2c3e50',
    fontSize: '0.95rem'
  },
  itemsCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5
  },
  itemInTable: {
    padding: '5px 10px',
    background: '#f8f9fa',
    borderRadius: 6,
    fontSize: '0.9rem'
  },
  statusBadge: {
    padding: '5px 12px',
    borderRadius: 20,
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  statusPaid: {
    background: '#d4edda',
    color: '#155724'
  },
  statusPending: {
    background: '#fff3cd',
    color: '#856404'
  },
  lastOrderBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 20,
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease'
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  emptyCart: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: 20,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    marginBottom: 30
  },
  emptyCartIcon: {
    color: '#bdc3c7',
    marginBottom: 20
  },
  emptyCartText: {
    margin: '0 0 30px',
    fontSize: '1.3rem',
    color: '#7f8c8d'
  },
  continueShoppingBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: 30,
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },
  cartItems: {
    marginBottom: 30
  },
  cartItem: {
    display: 'flex',
    background: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease'
  },
  itemImage: {
    width: 150,
    height: 150,
    objectFit: 'cover'
  },
  itemInfo: {
    flex: 1,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  itemName: {
    margin: '0 0 8px',
    color: '#2c3e50',
    fontSize: '1.3rem',
    fontWeight: '600'
  },
  itemPrice: {
    margin: '0 0 15px',
    fontWeight: '700',
    color: '#667eea',
    fontSize: '1.2rem'
  },
  itemQuantity: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  quantityLabel: {
    color: '#7f8c8d',
    fontSize: '1rem'
  },
  itemTotal: {
    fontWeight: '700',
    color: '#2c3e50',
    fontSize: '1.1rem'
  },
  quantityEditor: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '2px solid #e0e0e0',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: '#667eea'
  },
  quantityInput: {
    width: 60,
    textAlign: 'center',
    border: '2px solid #e0e0e0',
    borderRadius: 8,
    padding: '8px',
    fontSize: '1rem',
    fontWeight: '600'
  },
  editActions: {
    display: 'flex',
    gap: 8,
    marginLeft: 10
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: '#27ae60',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  cancelBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: '#e74c3c',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 20
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: 'none',
    background: '#f8f9fa',
    color: '#667eea',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    fontSize: '1.1rem'
  },
  deleteBtn: {
    color: '#e74c3c'
  },
  cartSummary: {
    background: 'white',
    borderRadius: 16,
    padding: 25,
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  grandTotalRow: {
    borderBottom: 'none',
    borderTop: '2px solid #667eea',
    marginTop: 10,
    paddingTop: 20
  },
  summaryLabel: {
    color: '#7f8c8d',
    fontSize: '1.1rem'
  },
  summaryValue: {
    fontWeight: '700',
    color: '#2c3e50',
    fontSize: '1.2rem'
  },
  confirmOrderBtn: {
    width: '100%',
    padding: 18,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '1.2rem',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    fontWeight: '600',
    marginTop: 25,
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
  },
  paymentForm: {
    background: 'white',
    borderRadius: 16,
    padding: 30,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    marginTop: 30
  },
  paymentTitle: {
    color: '#2c3e50',
    marginBottom: 25,
    fontSize: '1.5rem',
    fontWeight: '600',
    textAlign: 'center'
  },
  paymentAmount: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#2c3e50',
    marginBottom: 25
  },
  paymentOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  paymentAmountOptions: {
    display: 'flex',
    gap: 15,
    marginBottom: 20
  },
  paymentAmountOption: {
    flex: 1,
    padding: 15,
    border: '2px solid #e0e0e0',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center'
  },
  amountOptionContent: {
    marginLeft: 10,
    display: 'flex',
    flexDirection: 'column'
  },
  amountOptionTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '1.1rem'
  },
  amountOptionValue: {
    color: '#667eea',
    fontWeight: '700',
    fontSize: '1rem'
  },
  paymentMethodOptions: {
    display: 'flex',
    gap: 15
  },
  paymentOption: {
    flex: 1,
    padding: 20,
    border: '2px solid #e0e0e0',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center'
  },
  radioInput: {
    marginRight: 15
  },
  paymentOptionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  paymentIcon: {
    fontSize: '1.5rem',
    color: '#667eea'
  },
  paymentOptionTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '1.1rem',
    display: 'block'
  },
  paymentOptionDesc: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
    display: 'block',
    marginTop: 4
  },
  submitPaymentBtn: {
    width: '100%',
    padding: 16,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginTop: 25,
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
  },
  orderSuccessActions: {
    textAlign: 'center',
    marginTop: 30
  },
  homeBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: 30,
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
    display: 'inline-flex',
    alignItems: 'center'
  }
};

const msgStyle = {
  success: {
    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
    color: 'white',
    boxShadow: '0 5px 20px rgba(46, 204, 113, 0.3)'
  },
  error: {
    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    color: 'white',
    boxShadow: '0 5px 20px rgba(231, 76, 60, 0.3)'
  },
  warning: {
    background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
    color: 'white',
    boxShadow: '0 5px 20px rgba(243, 156, 18, 0.3)'
  }
};

export default Cart;