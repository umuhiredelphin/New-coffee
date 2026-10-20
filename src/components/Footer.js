import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCoffee
} from "react-icons/fa";
import momoLogo from "../assets/momo.png";
import logo from "../assets/logo.png";

function Footer() {
  const socialLinks = [
    { icon: FaFacebookF, url: "https://facebook.com/ffcoffee", label: "Facebook" },
    { icon: FaTwitter, url: "https://twitter.com/ffcoffee", label: "Twitter" },
    { icon: FaInstagram, url: "https://instagram.com/ffcoffee", label: "Instagram" },
    { icon: FaLinkedinIn, url: "https://linkedin.com/company/ffcoffee", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-espresso-950 text-cream-50 font-poppins mt-auto border-t border-espresso-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

          {/* Column 1 - Logo + About Us */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <img src={logo} alt="F&F Coffee Logo" className="w-12 h-12 object-contain" />
              <div>
                <span className="text-lg font-playfair font-bold text-cream-50 group-hover:text-gold-400 transition-colors">
                  F&F Coffee
                </span>
                <p className="text-[10px] text-cream-400/50 tracking-[0.15em] uppercase">Premium Brew Since 2015</p>
              </div>
            </Link>
            <p className="text-cream-300/60 text-sm leading-relaxed max-w-xs">
              We craft premium coffee with passion and love. From bean to cup,
              every sip tells a story of quality, community, and Rwandan excellence.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gold-400 font-semibold text-base uppercase tracking-wider">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { path: "/", label: "Home" },
                { path: "/menu", label: "Menu" },
                { path: "/about", label: "About Us" },
                { path: "/book-table", label: "Book a Table" },
                { path: "/cart", label: "Cart" },
                { path: "/help", label: "Help" },
                { path: "/profile", label: "My Profile" },
                { path: "/orderhistory", label: "Orders" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-cream-300/60 hover:text-gold-400 text-sm transition-colors no-underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3 - Contact Us */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gold-400 font-semibold text-base uppercase tracking-wider">Contact Us</h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-cream-300/70 text-sm">
                <FaMapMarkerAlt className="text-gold-400 shrink-0" size={14} />
                <span>KG 123 St, Kigali, Rwanda</span>
              </div>
              <a href="tel:+250788123456" className="flex items-center gap-3 text-cream-300/70 hover:text-gold-400 text-sm transition-colors no-underline">
                <FaPhoneAlt className="text-gold-400 shrink-0" size={14} />
                <span>+250 788 123 456</span>
              </a>
              <a href="tel:+250720123456" className="flex items-center gap-3 text-cream-300/70 hover:text-gold-400 text-sm transition-colors no-underline">
                <FaPhoneAlt className="text-gold-400 shrink-0" size={14} />
                <span>+250 720 123 456</span>
              </a>
              <a href="mailto:contact@ffcoffee.com" className="flex items-center gap-3 text-cream-300/70 hover:text-gold-400 text-sm transition-colors no-underline">
                <FaEnvelope className="text-gold-400 shrink-0" size={14} />
                <span>contact@ffcoffee.com</span>
              </a>
            </div>

            {/* Social Media */}
            <div className="flex gap-3 mt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-espresso-800 text-cream-50 no-underline text-base transition-all duration-300 hover:bg-gold-500 hover:text-espresso-950"
                    title={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>

            {/* MoMo Pay */}
            <div className="flex items-center gap-3 mt-2 bg-gradient-to-r from-gold-400 to-gold-500 text-espresso-950 px-4 py-3 rounded-xl font-bold text-sm w-fit">
              <img src={momoLogo} alt="MTN MoMo Pay" className="w-7 h-7 object-contain" />
              <span>Pay with MTN MoMo</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-espresso-800/30 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cream-400/50 text-xs">
            &copy; {new Date().getFullYear()} F&F Coffee Shop. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-cream-400/50 text-xs">
            <FaCoffee className="text-gold-400" />
            <span>Open Daily: 7am – 7pm</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cream-400/40 text-xs">We accept</span>
            <img src={momoLogo} alt="MTN MoMo" className="w-5 h-5 object-contain" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
