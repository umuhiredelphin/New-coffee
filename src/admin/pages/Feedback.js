import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Sidebar";
import Header from "../Header";
import {
  FaStar, FaTrash, FaCheckCircle, FaSearch, FaRegStar, FaCommentDots,
  FaChartBar, FaStarHalfAlt, FaUser, FaCalendarAlt,
  FaArrowRight, FaArrowLeft
} from "react-icons/fa";

const API = "http://localhost:5000";

export default function Feedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("unreviewed");
  const [stats, setStats] = useState({ total: 0, avgRating: 0, reviewed: 0, unreviewed: 0, distribution: [0, 0, 0, 0, 0] });
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const fetchFeedback = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sort) params.append("sort", sort);
      const res = await axios.get(`${API}/api/admin/feedback?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || [];
      setFeedbacks(data);

      // Compute stats
      const total = data.length;
      const unreviewed = data.filter(f => !f.isReviewed).length;
      const reviewed = total - unreviewed;
      const sumRating = data.reduce((acc, f) => acc + (f.rating || 0), 0);
      const avgRating = total > 0 ? (sumRating / total) : 0;
      const dist = [0, 0, 0, 0, 0];
      data.forEach(f => { const r = Math.min(4, Math.max(0, (f.rating || 1) - 1)); dist[r]++; });
      setStats({ total, avgRating, reviewed, unreviewed, distribution: dist });
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("cart");
    navigate("/");
  };

  const handleMarkReviewed = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/feedback/${id}/review`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, isReviewed: true } : f));
      setStats(prev => ({ ...prev, unreviewed: prev.unreviewed - 1, reviewed: prev.reviewed + 1 }));
    } catch (err) {
      console.error("Failed to mark as reviewed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/admin/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      console.error("Failed to delete feedback:", err);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const totalPages = Math.ceil(feedbacks.length / perPage);
  const paginated = feedbacks.slice((currentPage - 1) * perPage, currentPage * perPage);

  const renderStars = (rating, size = 12) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar key={i} size={size} className={i < rating ? 'text-gold-400' : 'text-espresso-600'} />
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-espresso-950">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 ml-60 flex flex-col">
        <Header onLogout={handleLogout} title="Customer Feedback" />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/10">
                  <FaCommentDots className="text-espresso-950 text-sm" />
                </div>
                <span className="text-cream-50/50 text-[10px] font-medium uppercase tracking-wider">Total</span>
              </div>
              <p className="text-2xl font-bold text-cream-50">{stats.total}</p>
              <p className="text-[10px] text-cream-50/40 mt-0.5">All messages</p>
            </div>
            <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <FaStarHalfAlt className="text-espresso-950 text-sm" />
                </div>
                <span className="text-cream-50/50 text-[10px] font-medium uppercase tracking-wider">Avg Rating</span>
              </div>
              <p className="text-2xl font-bold text-cream-50">{stats.avgRating.toFixed(1)}</p>
              <div className="mt-1">{renderStars(Math.round(stats.avgRating), 10)}</div>
            </div>
            <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/10">
                  <FaCheckCircle className="text-espresso-950 text-sm" />
                </div>
                <span className="text-cream-50/50 text-[10px] font-medium uppercase tracking-wider">Reviewed</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{stats.reviewed}</p>
              <p className="text-[10px] text-cream-50/40 mt-0.5">Completed reviews</p>
            </div>
            <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/10">
                  <FaRegStar className="text-espresso-950 text-sm" />
                </div>
                <span className="text-cream-50/50 text-[10px] font-medium uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gold-400">{stats.unreviewed}</p>
              <p className="text-[10px] text-cream-50/40 mt-0.5">Awaiting review</p>
            </div>
            <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <FaUser className="text-espresso-950 text-sm" />
                </div>
                <span className="text-cream-50/50 text-[10px] font-medium uppercase tracking-wider">Responded</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{stats.reviewed}</p>
              <p className="text-[10px] text-cream-50/40 mt-0.5">Total responded</p>
            </div>
          </div>

          {/* Rating Distribution Bar */}
          {stats.total > 0 && (
            <div className="bg-espresso-900/60 backdrop-blur-sm border border-espresso-800/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-cream-50 mb-3 flex items-center gap-2">
                <FaChartBar className="text-gold-400" size={14} /> Rating Distribution
              </h3>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.distribution[star - 1] || 0;
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-cream-400/60 text-xs w-12 flex items-center gap-1">
                        <FaStar size={10} className="text-gold-400" /> {star}
                      </span>
                      <div className="flex-1 h-2.5 bg-espresso-800/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-500"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-cream-400/60 text-[11px] w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-500/60 text-sm" />
                <input
                  type="text" placeholder="Search feedback..."
                  value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-56 pl-9 pr-4 py-2 bg-espresso-800/60 border border-espresso-700 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>
              <select
                value={sort} onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-espresso-800/60 border border-espresso-700 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              >
                <option value="unreviewed">Unreviewed First</option>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
            <span className="text-cream-500/50 text-xs">{feedbacks.length} feedback messages</span>
          </div>

          {/* Feedback List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-20 bg-espresso-900/40 rounded-xl border border-espresso-800/20">
              <FaRegStar className="text-5xl text-espresso-600 mx-auto mb-4" />
              <p className="text-cream-400/60 text-sm">No feedback messages yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginated.map((fb) => (
                  <div key={fb._id}
                    className={`bg-espresso-900/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 border transition-all duration-200 ${
                      fb.isReviewed ? 'border-espresso-700/30' : 'border-gold-500/20 shadow-sm shadow-gold-500/5'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-espresso-950 font-bold text-sm shadow-lg shadow-gold-500/20">
                        {fb.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-cream-50 font-semibold text-sm">{fb.name}</h3>
                            {!fb.isReviewed && (
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                            )}
                          </div>
                          <span className="text-cream-500/50 text-xs">{fb.email}</span>
                          <span className="text-cream-500/40 text-xs hidden sm:inline">|</span>
                          <span className="text-cream-500/50 text-xs flex items-center gap-1">
                            <FaCalendarAlt size={9} /> {formatDate(fb.createdAt)}
                          </span>
                        </div>

                        <p className="text-cream-300/80 text-sm leading-relaxed">{fb.message}</p>

                        <div className="flex items-center gap-3 mt-2">
                          {renderStars(fb.rating)}
                          {fb.isReviewed ? (
                            <span className="text-green-400/60 text-[10px] flex items-center gap-1">
                              <FaCheckCircle size={10} /> Reviewed
                            </span>
                          ) : (
                            <span className="text-gold-400/60 text-[10px] flex items-center gap-1">
                              <FaRegStar size={10} /> Pending Review
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 sm:flex-shrink-0">
                        {!fb.isReviewed && (
                          <button onClick={() => handleMarkReviewed(fb._id)} title="Mark as reviewed"
                            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all text-xs">
                            <FaCheckCircle size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(fb._id)} title="Delete"
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xs">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-espresso-800/60 border border-espresso-700/30 text-cream-400 hover:text-gold-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <FaArrowLeft size={12} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        p === currentPage
                          ? 'bg-gold-500 text-espresso-950'
                          : 'bg-espresso-800/60 text-cream-400 hover:bg-espresso-700'
                      }`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-espresso-800/60 border border-espresso-700/30 text-cream-400 hover:text-gold-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <FaArrowRight size={12} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
