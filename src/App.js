import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// ======= PUBLIC / USER PAGES =======
import HomeDashboard from "./components/Index"; // Default landing page
import Home from "./components/Home"; // Logged-in homepage
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import BookTable from "./components/BookTable";
import BuyNow from "./components/BuyNow";
import UserCart from "./components/Cart"; // Renamed to avoid conflict
import About from "./components/About";
import ResetPassword from "./components/ResetPassword"; // ✅ NEW IMPORT
import OrderHistory from "./pages/OrderHistory";
import Profile from './components/Profile';




// ======= ADMIN DASHBOARD & PAGES =======
import Admin from "./admin/Admin";
import Users from "./admin/pages/Users";
import EditUser from "./admin/EditUser";
import AddMenu from "./admin/pages/AddMenu";
import AddTable from "./admin/pages/AddTable";
import TableReservation from "./admin/pages/TableReservation";
import AdminCart from "./admin/AdminCart"; // Admin Cart version
import ManageAccount from "./admin/ManageAccount"; // adjust path

// ======= EMPLOYEE DASHBOARD =======
import Employee from "./employee/Employee";

// ======= NEW NotFound Component (Single File) =======
const NotFound = () => {
  const navigate = useNavigate();

  const styles = {
    notFoundContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      color: '#333',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box',
    },
    notFoundContent: {
      maxWidth: '600px',
    },
    notFoundCode: {
      fontSize: '10rem',
      fontWeight: 700,
      color: '#e0e0e0',
      margin: 0,
      lineHeight: 1,
    },
    notFoundIcon: {
      color: '#6c757d',
      margin: '1rem 0',
    },
    notFoundTitle: {
      fontSize: '2.5rem',
      fontWeight: 600,
      margin: '0.5rem 0',
    },
    notFoundMessage: {
      fontSize: '1.1rem',
      color: '#6c757d',
      lineHeight: 1.6,
      marginBottom: '2rem',
    },
    goHomeBtn: {
      display: 'inline-block',
      backgroundColor: '#007bff',
      color: '#ffffff',
      padding: '12px 30px',
      fontSize: '1rem',
      fontWeight: 500,
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
    },
  };

  return (
    <main style={styles.notFoundContainer}>
      <div style={styles.notFoundContent}>
        <h1 style={styles.notFoundCode}>404</h1>
        <div style={styles.notFoundIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="80px" height="80px">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <h2 style={styles.notFoundTitle}>Oops! Page Not Found</h2>
        <p style={styles.notFoundMessage}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button onClick={() => navigate('/')} style={styles.goHomeBtn}>
          Go to Homepage
        </button>
      </div>
    </main>
  );
};


function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/"); // ✅ Back to Index after logout
  };

  return (
    <Routes>
      {/* ======= PUBLIC ROUTES ======= */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/home" /> : <HomeDashboard />}
      />

      <Route
        path="/home"
        element={
          isLoggedIn ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />
        }
      />

      <Route path="/admin/manage-account" element={<ManageAccount />} />
      <Route
        path="/login"
        element={
          !isLoggedIn ? (
            <Login setIsLoggedIn={setIsLoggedIn} />
          ) : (
            <Navigate to="/home" />
          )
        }
      />
      <Route
        path="/signup"
        element={
          !isLoggedIn ? (
            <SignUp setIsLoggedIn={setIsLoggedIn} />
          ) : (
            <Navigate to="/home" />
          )
        }
      />

      {/* ✅ NEW RESET PASSWORD ROUTE */}
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ======= USER FEATURES ======= */}
      <Route path="/book-table" element={<BookTable />} />
      <Route path="/buy/:id" element={<BuyNow />} />
      <Route path="/cart" element={<UserCart />} />
      <Route path="/about" element={<About />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orderhistory" element={<OrderHistory />} />

      {/* ======= ADMIN ROUTES ======= */}
      <Route
        path="/admin"
        element={
          isLoggedIn ? (
            <Admin onLogout={handleLogout} />
          ) : (
            <Navigate to="/admin" />
          )
        }
        
      />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/users/edit/:id" element={<EditUser />} />
      <Route path="/admin/menu/add" element={<AddMenu />} />
      <Route path="/admin/tables/add" element={<AddTable />} />
      <Route path="/admin/table-reservations" element={<TableReservation />} />
      <Route path="/admin/cart" element={<AdminCart />} />


      {/* ======= EMPLOYEE ROUTES ======= */}
      <Route
        path="/employee"
        element={
          isLoggedIn ? (
            <Employee onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />


      {/* ======= FALLBACK: UPDATED to show NotFound page ======= */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}