import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaHome, FaInfoCircle, FaUtensils, FaPhoneAlt, FaBlog, FaQuestionCircle } from "react-icons/fa";
import momoLogo from "../assets/momo.png";
import logo from "../assets/logo.png";

function Footer() {
  const socialLinks = [
    { icon: FaFacebookF, url: "https://facebook.com", label: "Facebook" },
    { icon: FaTwitter, url: "https://twitter.com", label: "Twitter" },
    { icon: FaInstagram, url: "https://instagram.com", label: "Instagram" },
    { icon: FaLinkedinIn, url: "https://linkedin.com", label: "LinkedIn" },
  ];

  const navLinks = [
    { path: "/", icon: FaHome, label: "Home" },
    { path: "/about", icon: FaInfoCircle, label: "About" },
    { path: "/menu", icon: FaUtensils, label: "Menu" },
    { path: "/booking", icon: FaUtensils, label: "Booking" },
    { path: "/contact", icon: FaPhoneAlt, label: "Contact" },
    { path: "/help", icon: FaQuestionCircle, label: "Help" },
  ];

  return (
    <footer style={styles.footer}>
      {/* Top Row: Logo + Links + MoMo Pay */}
      <div style={styles.topRow}>
        {/* Left - Logo */}
        <div style={styles.logoSection}>
          <img src={logo} alt="Brew Haven Logo" style={styles.logo} />
        </div>

        {/* Center - Navigation Links with icon + text */}
        <div style={styles.linksSection}>
          <div style={styles.navLinks}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path} style={styles.navLink}>
                  <Icon style={{ marginRight: "0.5rem" }} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Social Icons in circles */}
          <div style={styles.social}>
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.circleLink}
                  title={social.label}
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>

        {/* Right - MoMo Pay */}
        <div style={styles.momoSection}>
          <img src={momoLogo} alt="MTN MoMo Pay" style={styles.momoLogo} />
          <span style={styles.momoText}>Pay with MTN MoMo</span>
        </div>
      </div>

      {/* Bottom Info */}
      <div style={styles.info}>
        <p>&copy; 2025 Brew Haven Coffee Shop. All rights reserved.</p>
        <p>Open Daily: 7am – 7pm | 123 Coffee St, Roastville</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#010000ff",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    marginTop: "auto",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "1200px",
    flexWrap: "wrap",
    gap: "1rem",
  },
  logoSection: {
    flexShrink: 0,
  },
  logo: {
    width: "150px",
    height: "auto",
    objectFit: "contain",
  },
  linksSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexGrow: 1,
    gap: "0.7rem",
  },
  navLinks: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "0.8rem",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    borderRadius: "25px",
    backgroundColor: "#333",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  navLinkHover: {
    backgroundColor: "#ffcc00",
    color: "#000",
    transform: "scale(1.1)",
  },
  social: {
    display: "flex",
    justifyContent: "center",
    gap: "0.8rem",
    marginTop: "0.5rem",
  },
  circleLink: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "#333",
    color: "#fff",
    textDecoration: "none",
    fontSize: "1.2rem",
    transition: "all 0.3s ease",
  },
  momoSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    fontSize: "1rem",
    backgroundColor: "#ffcc00",
    color: "#000",
    padding: "0.5rem 0.8rem",
    borderRadius: "8px",
    fontWeight: "bold",
    flexShrink: 0,
  },
  momoLogo: {
    width: "28px",
    height: "28px",
    objectFit: "contain",
  },
  momoText: {
    fontSize: "1rem",
  },
  info: {
    fontSize: "0.9rem",
    color: "#ccc",
    textAlign: "center",
    marginTop: "1rem",
  },
};

export default Footer;
