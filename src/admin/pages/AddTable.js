import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck } from "react-icons/fi";

// --- Design System (Colors, Shadows, etc.) ---
const theme = {
  colors: {
    primary: '#3E2723', // Deep Coffee Brown
    secondary: '#5D4037', // Lighter Brown
    accent: '#FF9800',   // Vibrant Orange
    background: '#FDFBF9', // Creamy Off-White
    surface: '#FFFFFF',   // Pure White for cards
    textPrimary: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    success: '#4CAF50', // Green for success
  },
  shadows: {
    card: '0 4px 12px rgba(0, 0, 0, 0.08)',
    button: '0 2px 5px rgba(0, 0, 0, 0.1)',
    notification: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  borderRadius: '12px',
};

// --- Success Notification Component ---
const SuccessNotification = ({ isVisible, message, subMessage, onClose }) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius,
      boxShadow: theme.shadows.notification,
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      minWidth: '300px',
      maxWidth: '400px',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      animation: 'slideIn 0.3s ease-out',
    }}>
      <div style={{
        backgroundColor: theme.colors.success,
        color: 'white',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FiCheck size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 0.25rem 0', color: theme.colors.textPrimary, fontSize: '1.1rem' }}>
          {message}
        </h3>
        <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
          {subMessage}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: theme.colors.textSecondary,
          padding: '0.25rem',
        }}
      >
        <FiX size={18} />
      </button>
    </div>
  );
};

// --- Styles Object ---
const styles = {
  pageWrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: theme.colors.background,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  mainContent: {
    flex: 1,
    padding: "2rem",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  heading: {
    color: theme.colors.primary,
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: 0,
  },
  // --- Tab Navigation Styles ---
  tabContainer: {
    display: 'flex',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius,
    padding: '0.5rem',
    marginBottom: '2rem',
    boxShadow: theme.shadows.card,
    width: 'fit-content',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: theme.colors.textSecondary,
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  activeTab: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.surface,
    boxShadow: theme.shadows.button,
  },
  // --- Table Grid View Styles ---
  tablesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  tableCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius,
    boxShadow: theme.shadows.card,
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardBody: {
    padding: '1.5rem',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: '0 0 0.5rem 0',
  },
  cardStatus: {
    fontSize: '0.9rem',
    color: theme.colors.textSecondary,
    marginBottom: '1rem',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: 'auto',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  editButton: {
    color: theme.colors.primary,
  },
  deleteButton: {
    color: '#D32F2F', // Red for delete
  },
  // --- Form Styles (Used for both Add and Edit) ---
  formContainer: {
    backgroundColor: theme.colors.surface,
    padding: '2.5rem',
    borderRadius: theme.borderRadius,
    boxShadow: theme.shadows.card,
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  formHeading: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    margin: 0,
  },
  cancelButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: theme.colors.textSecondary,
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: `1px solid ${theme.colors.border}`,
    boxSizing: 'border-box',
  },
  imagePreviewContainer: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  previewImg: {
    maxWidth: '100%',
    maxHeight: '250px',
    borderRadius: '8px',
    objectFit: 'cover',
    boxShadow: theme.shadows.card,
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  submitButton: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.surface,
    border: 'none',
    padding: '0.9rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    flexGrow: 1,
  },
  cancelButtonForm: {
    backgroundColor: '#ccc',
    color: '#333',
    border: 'none',
    padding: '0.9rem 2rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

// --- Sub-Component for a single Table Card ---
const TableCard = ({ table, onEdit, onDelete }) => {
  return (
    <div style={styles.tableCard}>
      <img
        src={table.table_image}
        alt={`Table ${table.table_number}`}
        style={styles.cardImage}
      />
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>Table {table.table_number}</h3>
        <p style={styles.cardStatus}>Status: Available</p>
        <div style={styles.cardActions}>
          <button style={{ ...styles.iconButton, ...styles.editButton }} onClick={() => onEdit(table)}>
            <FiEdit size={18} />
          </button>
          <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={() => onDelete(table.id)}>
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const TablePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [tables, setTables] = useState([]);
  const [editingTable, setEditingTable] = useState(null);
  const [tableNumber, setTableNumber] = useState("");
  const [tableImage, setTableImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // State for success notification
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successSubMessage, setSuccessSubMessage] = useState("");

  const showSuccessNotification = (message, subMessage) => {
    setSuccessMessage(message);
    setSuccessSubMessage(subMessage);
    setShowSuccess(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const fetchTables = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tables");
      const data = await res.json();
      setTables(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch tables");
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // --- Form Handlers ---
  const resetForm = () => {
    setTableNumber("");
    setTableImage(null);
    setImagePreview(null);
    setEditingTable(null);
    setShowForm(false);
  };

  const handleEditClick = (table) => {
    setEditingTable(table);
    setTableNumber(table.table_number);
    setImagePreview(table.table_image);
    setShowForm(true);
  };

  // --- CORRECTED: handleDeleteClick function ---
  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/tables/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        showSuccessNotification(
          "Table deleted successfully!",
          `Table ID: ${id}`
        );
        fetchTables();
      } else {
        alert(`Error: ${data.message || "Failed to delete table"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Could not delete table.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableNumber) {
      alert("Table number is required!");
      return;
    }

    const formData = new FormData();
    formData.append("tableNumber", tableNumber);
    if (tableImage && typeof tableImage !== 'string') { // Only append if it's a new file
      formData.append("tableImage", tableImage);
    }

    const isEditing = editingTable !== null;
    const url = isEditing
      ? `http://localhost:5000/api/tables/${editingTable.id}`
      : "http://localhost:5000/api/tables";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessNotification(
          `Table ${isEditing ? 'updated' : 'added'} successfully!`,
          `Table Number: ${tableNumber}`
        );
        resetForm();
        fetchTables();
      } else {
        alert(data.message || `Failed to ${isEditing ? 'update' : 'add'} table`);
      }
    } catch (err) {
      console.error(err);
      alert(`Error ${isEditing ? 'updating' : 'adding'} table`);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTableImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      // Handle case where file is deselected
      setTableImage(null);
      setImagePreview(editingTable ? editingTable.table_image : null);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Sidebar />
      <div style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.heading}>Tables Management</h1>
        </header>

        <div style={styles.tabContainer}>
          <button
            style={{ ...styles.tab, ...(!showForm ? styles.activeTab : {}) }}
            onClick={() => resetForm()}
          >
            Manage Tables
          </button>
          <button
            style={{ ...styles.tab, ...(showForm ? styles.activeTab : {}) }}
            onClick={() => setShowForm(true)}
          >
            <FiPlus /> Add New Table
          </button>
        </div>

        {showForm ? (
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formHeading}>
                {editingTable ? "Edit Table" : "Add a New Table"}
              </h2>
              <button style={styles.cancelButton} onClick={resetForm}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label style={styles.label}>
                Table Number
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Table Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={styles.input}
                />
              </label>

              {imagePreview && (
                <div style={styles.imagePreviewContainer}>
                  <img src={imagePreview} alt="Preview" style={styles.previewImg} />
                </div>
              )}

              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelButtonForm}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  <FiPlus /> {editingTable ? "Update Table" : "Add Table Now"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={styles.tablesGrid}>
            {tables.length === 0 ? (
              <p>No tables found. Add one to get started!</p>
            ) : (
              tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Success Notification Component */}
      <SuccessNotification
        isVisible={showSuccess}
        message={successMessage}
        subMessage={successSubMessage}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default TablePage;