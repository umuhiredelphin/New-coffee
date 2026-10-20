import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FaSearch, FaQuestionCircle, FaUser, FaCreditCard, FaHeadset,
  FaShieldAlt, FaShoppingBag, FaBook, FaCog, FaBell, FaArrowRight,
  FaChevronDown, FaTimes, FaPaperPlane, FaPhone, FaWhatsapp,
  FaEnvelope, FaBug, FaTicketAlt, FaPlayCircle, FaLightbulb,
  FaStar, FaUsers, FaComments, FaExclamationTriangle,
  FaRobot, FaCommentDots, FaCheckCircle, FaClock, FaRegClock,
  FaSpinner, FaExternalLinkAlt, FaYoutube, FaFileAlt, FaRocket,
  FaServer, FaLock, FaWifi, FaTools, FaLifeRing, FaSmile,
  FaRegLightbulb, FaChartLine, FaGlobe, FaChair
} from "react-icons/fa";

const categories = [
  { icon: FaUser, title: "Account Issues", desc: "Login, registration, profile settings", color: "from-blue-400 to-blue-600" },
  { icon: FaCreditCard, title: "Payment Problems", desc: "Transactions, refunds, mobile money", color: "from-green-400 to-green-600" },
  { icon: FaHeadset, title: "Technical Support", desc: "App errors, loading issues, bugs", color: "from-purple-400 to-purple-600" },
  { icon: FaShieldAlt, title: "Security & Privacy", desc: "Password, data protection, 2FA", color: "from-red-400 to-red-600" },
  { icon: FaShoppingBag, title: "Orders & Services", desc: "Order status, delivery, cancellations", color: "from-orange-400 to-orange-600" },
  { icon: FaBook, title: "App Usage Guide", desc: "How to use features & navigation", color: "from-teal-400 to-teal-600" },
  { icon: FaCog, title: "Settings Help", desc: "Notifications, preferences, language", color: "from-pink-400 to-pink-600" },
  { icon: FaBell, title: "Notifications", desc: "Alerts, reminders, push notifications", color: "from-indigo-400 to-indigo-600" },
];

const faqs = [
  { q: "How do I create an account?", a: "Click 'Sign Up' on the homepage, enter your name, email, phone, and a secure password. You'll receive a confirmation email to verify your account." },
  { q: "How can I reset my password?", a: "On the login page, click 'Forgot Password'. Enter your email and we'll send you a reset link. Follow the instructions to set a new password." },
  { q: "What payment methods do you accept?", a: "We accept MTN Mobile Money (MoMo), Airtel Money, and cash on delivery. All mobile money payments are processed instantly and securely." },
  { q: "How do I track my order?", a: "Go to 'Order History' from your profile menu. You'll see real-time status updates for all your orders from preparation to delivery." },
  { q: "Can I cancel my order?", a: "Orders can be cancelled within 5 minutes of placing them. Go to Order History, find your order, and click Cancel if the option is available." },
  { q: "How do I book a table?", a: "Navigate to 'Book a Table', select your preferred date, time, and number of guests. Confirm your booking and you'll receive a confirmation." },
  { q: "How does the loyalty program work?", a: "Every purchase earns you points. Accumulate points to redeem free items and exclusive discounts. Check your rewards in the Profile section." },
  { q: "How do I contact support?", a: "You can reach us via live chat, email at support@ffcafe.com, phone +250 788 123 456, or WhatsApp. We're available 7am–7pm daily." },
];

const tutorials = [
  { icon: FaPlayCircle, title: "Getting Started Guide", duration: "5 min", level: "Beginner", progress: 100 },
  { icon: FaShoppingBag, title: "How to Place an Order", duration: "3 min", level: "Beginner", progress: 100 },
  { icon: FaChair, title: "Booking a Table Online", duration: "4 min", level: "Beginner", progress: 100 },
  { icon: FaStar, title: "Using Loyalty Rewards", duration: "6 min", level: "Intermediate", progress: 0 },
  { icon: FaCog, title: "Customizing Your Profile", duration: "2 min", level: "Beginner", progress: 0 },
  { icon: FaShieldAlt, title: "Security Best Practices", duration: "8 min", level: "Advanced", progress: 0 },
];

const emergencyAlerts = [
  { icon: FaExclamationTriangle, title: "Scheduled Maintenance", desc: "System will be down on Sunday, May 25 from 2AM-4AM for upgrades.", type: "warning" },
  { icon: FaRocket, title: "New Feature Release", desc: "Real-time order tracking is now live! Check your orders in real-time.", type: "info" },
];

function HelpHero({ search, setSearch, scrollTo, setChatOpen }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-espresso-950 via-espresso-900 to-espresso-950 pt-28 pb-16 sm:pb-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold tracking-wide mb-4">
          <FaHeadset size={12} /> Support Center
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-cream-50 mb-3 leading-tight">
          How can we <span className="text-gold-400">help</span> you?
        </h1>
        <p className="text-cream-300/60 text-sm sm:text-base max-w-xl mx-auto mb-6">
          Search our knowledge base, browse tutorials, or get in touch with our support team.
        </p>

        <div className="max-w-xl mx-auto relative mb-8">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400/60 z-10" size={14} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles, FAQs, topics..."
            className="w-full pl-11 pr-4 py-3.5 bg-espresso-800/80 backdrop-blur-sm border border-espresso-700/50 rounded-xl text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 placeholder-espresso-500 transition-all shadow-lg shadow-black/20" />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {[
            { icon: FaBug, label: "Report Problem", action: () => scrollTo("contact") },
            { icon: FaHeadset, label: "Contact Support", action: () => scrollTo("contact") },
            { icon: FaCommentDots, label: "Live Chat", action: () => setChatOpen(true) },
            { icon: FaQuestionCircle, label: "FAQ", action: () => scrollTo("faq") },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-espresso-800/60 hover:bg-espresso-700/80 text-cream-50 border border-espresso-700/40 hover:border-gold-500/30 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 backdrop-blur-sm">
              <btn.icon className="text-gold-400" size={13} /> {btn.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ cat }) {
  const Icon = cat.icon;
  return (
    <div className="group relative bg-espresso-800/40 backdrop-blur-sm rounded-2xl p-5 border border-espresso-700/20 hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gold-500/5 cursor-pointer">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="text-white" size={20} />
      </div>
      <h3 className="text-cream-50 font-bold text-sm mb-1">{cat.title}</h3>
      <p className="text-cream-300/50 text-xs leading-relaxed">{cat.desc}</p>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}

function FAQItem({ faq, isOpen, toggle }) {
  return (
    <div className="bg-espresso-800/40 backdrop-blur-sm rounded-xl border border-espresso-700/20 overflow-hidden transition-all duration-300 hover:border-espresso-600/40">
      <button onClick={toggle} className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all hover:bg-espresso-800/40">
        <FaQuestionCircle className="text-gold-400 shrink-0" size={14} />
        <span className="flex-1 text-cream-50 text-sm font-medium">{faq.q}</span>
        <FaChevronDown className={`text-cream-50/40 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} size={11} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-4">
          <div className="w-8 h-0.5 bg-gold-500/40 rounded-full mb-3" />
          <p className="text-cream-300/60 text-sm leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

function TicketTracking() {
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({ name: "", email: "", subject: "", message: "" });

  const statuses = [
    { label: "Submitted", icon: FaPaperPlane, color: "text-gold-400", bar: "bg-gold-400" },
    { label: "In Review", icon: FaSpinner, color: "text-blue-400", bar: "bg-blue-400" },
    { label: "Resolved", icon: FaCheckCircle, color: "text-green-400", bar: "bg-green-400" },
    { label: "Closed", icon: FaTimes, color: "text-red-400", bar: "bg-red-400" },
  ];

  const handleTrack = () => {
    if (!ticketId.trim()) return;
    setTicket({ id: ticketId, status: "In Review", date: new Date().toLocaleDateString(), subject: "Support Request" });
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    const id = "TKT-" + Date.now().toString(36).toUpperCase();
    setTicket({ id, status: "Submitted", date: new Date().toLocaleDateString(), subject: ticketForm.subject });
    setTicketForm({ name: "", email: "", subject: "", message: "" });
    setShowForm(false);
  };

  const currentIdx = ticket ? statuses.findIndex(s => s.label === ticket.status) : -1;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-8 mb-10">
      <div className="text-center mb-6">
        <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em]">Support Tickets</span>
        <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cream-50 mt-1">Track Your Request</h2>
      </div>

      <div className="bg-espresso-800/40 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-espresso-700/20">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <FaTicketAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/60" size={13} />
            <input type="text" value={ticketId} onChange={(e) => setTicketId(e.target.value)}
              placeholder="Enter ticket number (e.g. TKT-ABC123)"
              className="w-full pl-9 pr-3 py-2.5 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 placeholder-espresso-500" />
          </div>
          <button onClick={handleTrack}
            className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-espresso-950 font-bold rounded-lg text-sm transition-all whitespace-nowrap">
            Track Ticket
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-espresso-900/60 hover:bg-espresso-800 text-cream-50 border border-espresso-700/50 rounded-lg text-sm transition-all whitespace-nowrap">
            New Ticket
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmitTicket} className="mb-4 p-4 bg-espresso-900/40 rounded-xl border border-espresso-700/20 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Your Name" required value={ticketForm.name} onChange={(e) => setTicketForm(p => ({ ...p, name: e.target.value }))}
                className="px-3 py-2 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 placeholder-espresso-500" />
              <input type="email" placeholder="Your Email" required value={ticketForm.email} onChange={(e) => setTicketForm(p => ({ ...p, email: e.target.value }))}
                className="px-3 py-2 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 placeholder-espresso-500" />
            </div>
            <input type="text" placeholder="Subject" required value={ticketForm.subject} onChange={(e) => setTicketForm(p => ({ ...p, subject: e.target.value }))}
              className="w-full px-3 py-2 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 placeholder-espresso-500" />
            <textarea rows={3} placeholder="Describe your issue..." required value={ticketForm.message} onChange={(e) => setTicketForm(p => ({ ...p, message: e.target.value }))}
              className="w-full px-3 py-2 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 placeholder-espresso-500 resize-none" />
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-lg text-sm transition-all hover:shadow-lg hover:shadow-gold-500/20">
              <FaPaperPlane className="inline mr-1.5" size={12} /> Submit Ticket
            </button>
          </form>
        )}

        {ticket && (
          <div className="p-4 bg-espresso-900/40 rounded-xl border border-espresso-700/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-cream-400/60 text-xs">Ticket</span>
                <p className="text-cream-50 font-bold text-sm">{ticket.id}</p>
              </div>
              <span className="text-cream-400/40 text-xs">{ticket.date}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-cream-300/60 text-xs">{ticket.subject}</span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                ticket.status === "Submitted" ? "bg-gold-500/20 text-gold-400" :
                ticket.status === "In Review" ? "bg-blue-500/20 text-blue-400" :
                ticket.status === "Resolved" ? "bg-green-500/20 text-green-400" :
                "bg-red-500/20 text-red-400"
              }`}>{ticket.status}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {statuses.map((s, i) => {
                const Icon = s.icon;
                const isActive = i <= currentIdx;
                const isLast = i === statuses.length - 1;
                return (
                  <React.Fragment key={s.label}>
                    <div className={`flex flex-col items-center gap-1 ${isLast ? "" : "flex-1"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive ? `${s.bar} text-white` : 'bg-espresso-700 text-cream-400/40'
                      }`}>
                        <Icon size={12} />
                      </div>
                      <span className={`text-[9px] ${isActive ? s.color : 'text-cream-400/30'}`}>{s.label}</span>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-0.5 rounded-full -mt-5 ${i < currentIdx ? s.bar : 'bg-espresso-700'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TutorialCard({ tut }) {
  const Icon = tut.icon;
  return (
    <div className="group bg-espresso-800/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-espresso-700/20 hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
            <Icon className="text-gold-400" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-cream-50 font-semibold text-sm truncate">{tut.title}</h4>
            <div className="flex items-center gap-2 text-cream-400/40 text-[10px]">
              <span>{tut.duration}</span>
              <span>•</span>
              <span>{tut.level}</span>
            </div>
          </div>
          <FaPlayCircle className="text-gold-400/60 group-hover:text-gold-400 transition-colors shrink-0" size={18} />
        </div>
        <div className="w-full h-1.5 bg-espresso-700/50 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500"
            style={{ width: `${tut.progress}%` }} />
        </div>
        <span className="text-[10px] text-cream-400/40 mt-1 block">{tut.progress}% complete</span>
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  return (
    <div className={`flex gap-2 mb-3 ${msg.isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.isUser ? 'bg-gold-500' : 'bg-espresso-700'}`}>
        {msg.isUser ? <FaUser size={10} className="text-espresso-950" /> : <FaRobot size={10} className="text-cream-50" />}
      </div>
      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
        msg.isUser ? 'bg-gold-500 text-espresso-950 rounded-tr-sm' : 'bg-espresso-700/60 text-cream-50 rounded-tl-sm'
      }`}>
        {msg.text}
      </div>
    </div>
  );
}

const quickReplies = [
  "How do I place an order?",
  "What payment methods do you accept?",
  "How do I reset my password?",
  "Can I cancel my order?",
];

const chatResponses = {
  "how do i place an order": "To place an order: 1) Browse the menu, 2) Add items to your cart, 3) Go to Cart and click Checkout, 4) Choose pickup or delivery, 5) Pay with MoMo or cash. Easy! ☕",
  "what payment methods do you accept": "We accept: 1) MTN Mobile Money (MoMo), 2) Airtel Money, 3) Cash on delivery. All payments are secure and processed instantly.",
  "how do i reset my password": "Go to the login page and click 'Forgot Password'. Enter your email and we'll send you a reset link. Check your spam folder if you don't see it.",
  "can i cancel my order": "Yes! You can cancel within 5 minutes of placing your order. Go to Order History and click Cancel if available. After 5 min, please contact support.",
};

function SupportChat({ isOpen, setOpen }) {
  const [messages, setMessages] = useState([
    { text: "Hi! 👋 I'm the F&F Coffee assistant. How can I help you today?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const [showQuick, setShowQuick] = useState(true);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { text: msg, isUser: true }]);
    setInput("");
    setShowQuick(false);
    setTimeout(() => {
      const lower = msg.toLowerCase();
      let reply = "I'll connect you with a human agent shortly! For now, try asking about orders, payments, or account issues. 😊";
      for (const [key, val] of Object.entries(chatResponses)) {
        if (lower.includes(key)) { reply = val; break; }
      }
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
      if (showQuick) setShowQuick(false);
    }, 800);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-2rem)] bg-espresso-900 rounded-2xl shadow-2xl shadow-black/50 border border-espresso-700/30 z-[9999] overflow-hidden animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-3 bg-espresso-800 border-b border-espresso-700/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center">
                <FaRobot className="text-espresso-950" size={14} />
              </div>
              <div>
                <h4 className="text-cream-50 text-sm font-semibold">Support Assistant</h4>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-cream-400/50 text-[10px]">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-cream-400/60 hover:text-cream-50 transition-colors">
              <FaTimes size={14} />
            </button>
          </div>

          <div className="h-[320px] overflow-y-auto p-4 bg-espresso-950/30">
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            {showQuick && (
              <div className="mt-3">
                <p className="text-cream-400/40 text-[10px] mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((qr, i) => (
                    <button key={i} onClick={() => handleSend(qr)}
                      className="px-3 py-1.5 bg-espresso-700/50 hover:bg-espresso-700 text-cream-300/80 text-[10px] rounded-full border border-espresso-600/30 transition-all">
                      {qr}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-espresso-700/30 bg-espresso-800/50">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40 placeholder-espresso-500" />
              <button onClick={() => handleSend()}
                className="px-3 py-2 bg-gold-500 hover:bg-gold-400 text-espresso-950 rounded-lg transition-all">
                <FaPaperPlane size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-gold-500 to-gold-400 rounded-full shadow-2xl shadow-gold-500/40 flex items-center justify-center text-espresso-950 hover:scale-110 transition-transform z-[9999]">
        {isOpen ? <FaTimes size={22} /> : <FaCommentDots size={22} />}
      </button>
    </>
  );
}

export default function Help() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const sectionRefs = useRef({});

  const scrollTo = (section) => {
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredCategories = categories.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.desc.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTutorials = tutorials.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 font-poppins">
        <HelpHero search={search} setSearch={setSearch} scrollTo={scrollTo} setChatOpen={setChatOpen} />

        {/* Emergency Alerts */}
        {emergencyAlerts.map((alert, i) => (
          <div key={i} className="max-w-4xl mx-auto px-4 sm:px-8 mb-4 -mt-4">
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border ${
              alert.type === "warning"
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
            }`}>
              <alert.icon className="shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-semibold text-xs">{alert.title}</p>
                <p className="text-[10px] opacity-70">{alert.desc}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Help Categories */}
        <section id="categories" className="max-w-5xl mx-auto px-4 sm:px-8 mb-10">
          <div className="text-center mb-6">
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em]">Browse Topics</span>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cream-50 mt-1">Help Categories</h2>
            <p className="text-cream-300/50 text-sm mt-1">Find the right solution for your issue</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCategories.map((cat, i) => <CategoryCard key={i} cat={cat} />)}
          </div>
          {filteredCategories.length === 0 && (
            <div className="text-center py-10">
              <FaSearch className="text-espresso-600 text-3xl mx-auto mb-2" />
              <p className="text-cream-300/50 text-sm">No categories match your search.</p>
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-8 mb-10">
          <div className="text-center mb-6">
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em]">Got Questions?</span>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cream-50 mt-1">Frequently Asked Questions</h2>
            <p className="text-cream-300/50 text-sm mt-1">Quick answers to common questions</p>
          </div>
          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8">
                <FaSearch className="text-espresso-600 text-2xl mx-auto mb-2" />
                <p className="text-cream-300/50 text-sm">No FAQs match your search.</p>
              </div>
            ) : (
              filteredFaqs.map((f, i) => (
                <FAQItem key={i} faq={f} isOpen={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))
            )}
          </div>
        </section>

        {/* Ticket Tracking */}
        <TicketTracking />

        {/* Tutorials */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8 mb-10">
          <div className="text-center mb-6">
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em]">Learn & Grow</span>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cream-50 mt-1">Tutorials & Guides</h2>
            <p className="text-cream-300/50 text-sm mt-1">Step-by-step instructions to get the most out of F&F Coffee</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTutorials.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-8">
                <FaSearch className="text-espresso-600 text-2xl mx-auto mb-2" />
                <p className="text-cream-300/50 text-sm">No tutorials match your search.</p>
              </div>
            ) : (
              filteredTutorials.map((t, i) => <TutorialCard key={i} tut={t} />)
            )}
          </div>
        </section>

        {/* Contact Support */}
        <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-8 mb-10">
          <div className="bg-gradient-to-br from-espresso-800/40 to-espresso-900/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-espresso-700/20">
            <div className="text-center mb-6">
              <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em]">Get In Touch</span>
              <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cream-50 mt-1">Contact Support</h2>
              <p className="text-cream-300/50 text-sm mt-1">We're here to help 7am – 7pm daily</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { icon: FaCommentDots, label: "Live Chat", desc: "Instant reply", action: () => setChatOpen(true), color: "from-gold-400 to-gold-500" },
                { icon: FaEnvelope, label: "Email", desc: "support@ffcafe.com", href: "mailto:support@ffcafe.com", color: "from-blue-400 to-blue-600" },
                { icon: FaPhone, label: "Phone", desc: "+250 788 123 456", href: "tel:+250788123456", color: "from-green-400 to-green-600" },
                { icon: FaWhatsapp, label: "WhatsApp", desc: "+250 788 123 456", href: "https://wa.me/250788123456", color: "from-emerald-400 to-emerald-600" },
              ].map((item, i) => (
                item.href ? (
                  <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-espresso-900/40 rounded-xl border border-espresso-700/20 hover:border-gold-500/30 transition-all no-underline group">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="text-white" size={16} />
                    </div>
                    <div>
                      <h4 className="text-cream-50 text-sm font-semibold">{item.label}</h4>
                      <p className="text-cream-400/50 text-[10px]">{item.desc}</p>
                    </div>
                  </a>
                ) : (
                  <button key={i} onClick={item.action}
                    className="flex items-center gap-3 p-4 bg-espresso-900/40 rounded-xl border border-espresso-700/20 hover:border-gold-500/30 transition-all text-left group">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="text-white" size={16} />
                    </div>
                    <div>
                      <h4 className="text-cream-50 text-sm font-semibold">{item.label}</h4>
                      <p className="text-cream-400/50 text-[10px]">{item.desc}</p>
                    </div>
                  </button>
                )
              ))}
            </div>

            {/* Ticket Form */}
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm text-gold-400 font-semibold hover:text-gold-300 transition-colors">
                <span>Submit a support request</span>
                <FaChevronDown className="transition-transform group-open:rotate-180" size={11} />
              </summary>
              <div className="mt-4 p-5 bg-espresso-900/40 rounded-xl border border-espresso-700/20">
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <input type="text" placeholder="Full Name"
                    className="px-3 py-2.5 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 placeholder-espresso-500" />
                  <input type="email" placeholder="Email Address"
                    className="px-3 py-2.5 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 placeholder-espresso-500" />
                </div>
                <select className="w-full px-3 py-2.5 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 mb-3">
                  <option value="">Select a topic...</option>
                  <option value="account">Account Issue</option>
                  <option value="payment">Payment Problem</option>
                  <option value="order">Order Issue</option>
                  <option value="technical">Technical Problem</option>
                  <option value="other">Other</option>
                </select>
                <textarea rows={4} placeholder="Describe your issue in detail..."
                  className="w-full px-3 py-2.5 bg-espresso-900/60 border border-espresso-700/50 rounded-lg text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 placeholder-espresso-500 resize-none mb-3" />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-espresso-800/60 hover:bg-espresso-700/80 text-cream-50 border border-espresso-700/50 rounded-lg text-sm cursor-pointer transition-all">
                    <FaPaperPlane size={12} className="rotate-90" />
                    Attach Screenshot
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                  <button className="px-5 py-2.5 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 font-bold rounded-lg text-sm transition-all hover:shadow-lg hover:shadow-gold-500/20">
                    Submit Request
                  </button>
                </div>
              </div>
            </details>
          </div>
        </section>

        {/* Community */}
        <section className="max-w-4xl mx-auto px-4 sm:px-8 mb-10">
          <div className="text-center mb-6">
            <span className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em]">Community</span>
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-cream-50 mt-1">Join the Conversation</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: FaComments, title: "Discussions", desc: "Join conversations with other coffee lovers", count: "234 topics" },
              { icon: FaStar, title: "Trending", desc: "See what others are asking about", count: "12 trending" },
              { icon: FaLightbulb, title: "Suggestions", desc: "Share your ideas to improve F&F Coffee", count: "89 ideas" },
            ].map((item, i) => (
              <div key={i} className="bg-espresso-800/40 backdrop-blur-sm rounded-2xl p-5 border border-espresso-700/20 hover:border-gold-500/30 transition-all hover:-translate-y-1 cursor-pointer">
                <item.icon className="text-gold-400" size={20} />
                <h4 className="text-cream-50 font-bold text-sm mt-2 mb-1">{item.title}</h4>
                <p className="text-cream-300/50 text-xs mb-2">{item.desc}</p>
                <span className="text-gold-400/60 text-[10px] font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>

      {/* AI Chatbot Floating */}
      <SupportChat isOpen={chatOpen} setOpen={setChatOpen} />
    </>
  );
}
