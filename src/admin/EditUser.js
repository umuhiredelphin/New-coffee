// EditUser.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${id}`);
        setUser(res.data);
        setForm({
          username: res.data.username,
          email: res.data.email,
          phone: res.data.phone || "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, form);
      alert("User updated successfully!");
      navigate("/admin/users");
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  if (loading) return <p>Loading user...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-container" style={{ display: "flex" }}>
      <Sidebar />
      <div className="users-page" style={{ flex: 1, padding: "20px" }}>
        <h2>Edit User</h2>
        <form onSubmit={handleSubmit} className="edit-form">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
          <div className="form-buttons">
            <button type="submit" className="btn save-btn">
              Save
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="btn cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Embedded CSS */}
      <style>{`
        .users-page {
          max-width: 600px;
          margin: auto;
          font-family: Arial, sans-serif;
        }

        .users-page h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
        }

        .edit-form input {
          width: 100%;
          padding: 10px 12px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease-in-out;
        }

        .edit-form input:focus {
          border-color: #77a8a8;
          outline: none;
        }

        .form-buttons {
          display: flex;
          justify-content: flex-start;
          gap: 10px;
        }

        .btn {
          padding: 10px 18px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease-in-out;
        }

        .save-btn {
          background-color: #77a8a8;
          color: #fff;
        }

        .save-btn:hover {
          background-color: #559999;
        }

        .cancel-btn {
          background-color: #f44336;
          color: #fff;
        }

        .cancel-btn:hover {
          background-color: #d32f2f;
        }

        @media (max-width: 500px) {
          .users-page {
            padding: 10px;
          }
          .form-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
