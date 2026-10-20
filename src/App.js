import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import HomeDashboard from "./components/Index";
import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import BookTable from "./components/BookTable";
import BuyNow from "./components/BuyNow";
import UserCart from "./components/Cart";
import Payment from "./components/Payment";
import About from "./components/About";
import Help from "./components/Help";
import ResetPassword from "./components/ResetPassword";
import OrderHistory from "./pages/OrderHistory";
import Profile from './components/Profile';
import MenuPage from "./pages/menu";
import QrMenu from "./pages/QrMenu";
import Settings from "./components/Settings";

// ======= ADMIN AUTH & GUARD =======
import AdminLogin from "./admin/Login";
import AdminRoute from "./admin/AdminRoute";

// ======= ADMIN DASHBOARD & PAGES =======
import Admin from "./admin/Admin";
import Users from "./admin/pages/Users";
import EditUser from "./admin/EditUser";
import AddMenu from "./admin/pages/AddMenu";
import AddTable from "./admin/pages/AddTable";
import TableReservation from "./admin/pages/TableReservation";
import AdminCart from "./admin/AdminCart";
import ManageAccount from "./admin/ManageAccount";
import Stock from "./admin/pages/Stock";
import Payments from "./admin/pages/Payments";
import Report from "./admin/pages/Report";
import Feedback from "./admin/pages/Feedback";
import Banners from "./admin/pages/Banners";
import OrderSettings from "./admin/pages/OrderSettings";
import QrCodeMenu from "./admin/pages/QrCodeMenu";

// ======= EMPLOYEE DASHBOARD =======
import Employee from "./employee/Employee";
import EmployeeAccess from "./employee/EmployeeAccess";
import EmployeeRegister from "./employee/EmployeeRegister";
import EmployeeLogin from "./employee/EmployeeLogin";
import EmployeeSettings from "./employee/EmployeeSettings";
import EmployeeChat from "./employee/EmployeeChat";

// ======= ADMIN EMPLOYEES =======
import Employees from "./admin/pages/Employees";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="flex items-center justify-center min-h-screen bg-espresso-950 text-center p-5">
      <div className="max-w-xl animate-fade-in-up">
        <h1 className="text-9xl font-bold text-gold-400 leading-none font-playfair">404</h1>
        <div className="text-espresso-600 my-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 mx-auto text-gold-400/50">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>
        <h2 className="text-4xl font-semibold text-cream-50 mb-2 font-poppins">Oops! Page Not Found</h2>
        <p className="text-cream-200 text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-block bg-gold-500 hover:bg-gold-400 text-espresso-950 px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
        >
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
    navigate("/");
  };

  return (
    <Routes>
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

      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/book-table" element={<BookTable />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/qr-menu" element={<QrMenu />} />
      <Route path="/buy/:id" element={<BuyNow />} />
      <Route path="/cart" element={<UserCart />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/about" element={<About />} />
      <Route path="/help" element={<Help />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/orderhistory" element={<OrderHistory />} />

      {/* ======= ADMIN ROUTES ======= */}
      <Route
        path="/admin/login"
        element={
          <AdminLogin onLogin={(admin, token) => {
            localStorage.setItem("admin", JSON.stringify(admin));
            localStorage.setItem("token", token);
            navigate("/admin");
          }} />
        }
      />
      <Route
        path="/admin"
        element={
          localStorage.getItem("admin") ? (
            <Admin onLogout={handleLogout} />
          ) : (
            <Navigate to="/admin/login" />
          )
        }
      />
      <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin/users/edit/:id" element={<AdminRoute><EditUser /></AdminRoute>} />
      <Route path="/admin/menu/add" element={<AdminRoute><AddMenu /></AdminRoute>} />
      <Route path="/admin/tables/add" element={<AdminRoute><AddTable /></AdminRoute>} />
      <Route path="/admin/table-reservations" element={<AdminRoute><TableReservation /></AdminRoute>} />
      <Route path="/admin/cart" element={<AdminRoute><AdminCart /></AdminRoute>} />
      <Route path="/admin/stock" element={<AdminRoute><Stock /></AdminRoute>} />
      <Route path="/admin/payments" element={<AdminRoute><Payments /></AdminRoute>} />
      <Route path="/admin/manage-account" element={<AdminRoute><ManageAccount /></AdminRoute>} />
      <Route path="/admin/report" element={<AdminRoute><Report /></AdminRoute>} />
      <Route path="/admin/feedback" element={<AdminRoute><Feedback /></AdminRoute>} />
      <Route path="/admin/banners" element={<AdminRoute><Banners /></AdminRoute>} />
      <Route path="/admin/order-settings" element={<AdminRoute><OrderSettings /></AdminRoute>} />
      <Route path="/admin/qr-code" element={<AdminRoute><QrCodeMenu /></AdminRoute>} />
      <Route path="/admin/employees" element={<AdminRoute><Employees /></AdminRoute>} />

      {/* ======= EMPLOYEE ROUTES ======= */}
      <Route path="/employee/access" element={<EmployeeAccess />} />
      <Route path="/employee/register" element={<EmployeeRegister />} />
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route
        path="/employee/dashboard"
        element={
          localStorage.getItem("employeeToken") ? (
            <Employee onLogout={handleLogout} />
          ) : (
            <Navigate to="/employee/login" />
          )
        }
      />
      <Route
        path="/employee/settings"
        element={
          localStorage.getItem("employeeToken") ? (
            <EmployeeSettings onLogout={handleLogout} />
          ) : (
            <Navigate to="/employee/login" />
          )
        }
      />
      <Route
        path="/employee/messages"
        element={
          localStorage.getItem("employeeToken") ? (
            <EmployeeChat onLogout={handleLogout} />
          ) : (
            <Navigate to="/employee/login" />
          )
        }
      />

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
