import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaCoffee, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaWhatsapp, FaClock, FaStar, FaHeart, FaUsers, FaLeaf, FaAward, FaQuoteLeft } from "react-icons/fa";
import aboutImage from "../assets/momo.png";

const About = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-5">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold tracking-wide mb-4">
              <FaCoffee size={12} /> Since 2015
            </div>
            <h1 className="font-playfair text-4xl md:text-6xl text-cream-50 mb-4">
              About <span className="text-gold-400">F&F Coffee</span>
            </h1>
            <p className="text-cream-300/60 text-base md:text-lg max-w-2xl mx-auto">
              Discover our story, passion, and dedication to the perfect coffee experience.
            </p>
          </div>

          {/* Story + Image */}
          <div className="flex flex-col md:flex-row gap-10 mb-14 items-center">
            <div className="flex-1">
              <h2 className="font-playfair text-3xl text-gold-400 mb-4">Our Story</h2>
              <p className="text-cream-100 mb-4 leading-relaxed">
                F&F Coffee Shop started as a small local cafe with a big dream: to bring the finest coffee and
                cozy atmosphere to every coffee lover. Our journey has been driven by passion, creativity,
                and the pursuit of quality since day one.
              </p>
              <p className="text-cream-100 mb-4 leading-relaxed">
                What began as a humble corner shop in Kigali has grown into a beloved community hub where
                friends meet, ideas brew, and every cup tells a story.
              </p>

              <h2 className="font-playfair text-3xl text-gold-400 mb-4 mt-8">Our Mission</h2>
              <p className="text-cream-100 mb-6 leading-relaxed">
                Our mission is simple — provide exceptional coffee, delicious food, and an inviting environment
                for friends, family, and solo visitors. Every cup we serve is crafted with love and care.
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <img src={aboutImage} alt="About Coffee"
                className="w-full max-w-[450px] rounded-2xl object-cover shadow-2xl" />
            </div>
          </div>

          {/* Values */}
          <div className="mb-14">
            <h2 className="font-playfair text-3xl text-gold-400 mb-6 text-center">Our Values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FaStar, title: "Quality", desc: "Only the best beans and ingredients are used in every creation." },
                { icon: FaHeart, title: "Customer Care", desc: "Your satisfaction is our priority from the moment you walk in." },
                { icon: FaUsers, title: "Community", desc: "Supporting local producers and sustainable practices." },
                { icon: FaLeaf, title: "Innovation", desc: "Bringing new flavors and experiences to your table." },
              ].map((v, i) => (
                <div key={i}
                  className="bg-espresso-800/40 backdrop-blur-sm rounded-xl p-5 border border-espresso-700/10 hover:border-gold-400/20 hover:-translate-y-1 transition-all duration-300">
                  <v.icon className="text-gold-400 text-xl mb-3" />
                  <h3 className="text-cream-50 font-bold text-sm mb-1">{v.title}</h3>
                  <p className="text-cream-300/50 text-xs leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-14">
            <div className="bg-gradient-to-br from-espresso-800/40 to-espresso-900/40 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-espresso-700/20 text-center">
              <FaQuoteLeft className="text-gold-400/30 text-3xl mb-4 mx-auto" />
              <h2 className="font-playfair text-3xl text-gold-400 mb-6">Why Choose F&F Coffee Shop?</h2>
              <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {[
                  { title: "Premium Quality", desc: "We use only fresh, high-quality ingredients for every cup and meal." },
                  { title: "Cozy Environment", desc: "Relax in our comfortable, warm, and inviting space with friends or alone." },
                  { title: "Friendly Staff", desc: "Our team is always ready to make your experience delightful and memorable." },
                ].map((w, i) => (
                  <div key={i}
                    className="bg-espresso-900/50 rounded-xl p-5 border border-espresso-700/10 hover:border-gold-400/20 hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-gold-400 font-bold text-base mb-2">{w.title}</h3>
                    <p className="text-cream-300/50 text-sm">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="text-center mb-14">
            <h2 className="font-playfair text-3xl text-gold-400 mb-2">Meet Our Team</h2>
            <p className="text-cream-300/60 mb-8 text-sm">Our dedicated team is here to make your coffee experience unforgettable.</p>
            <div className="flex justify-center gap-6 flex-wrap">
              {[
                { name: "John Doe", role: "Head Barista", img: "https://randomuser.me/api/portraits/men/32.jpg" },
                { name: "Jane Smith", role: "Manager", img: "https://randomuser.me/api/portraits/women/44.jpg" },
                { name: "Mark Lee", role: "Chef", img: "https://randomuser.me/api/portraits/men/12.jpg" },
              ].map((t, i) => (
                <div key={i}
                  className="bg-espresso-800/40 backdrop-blur-sm rounded-2xl p-5 w-[200px] shadow-lg border border-espresso-700/10 hover:border-gold-400/20 hover:-translate-y-1 transition-all duration-300">
                  <img src={t.img} alt={t.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-gold-400/30" />
                  <h3 className="font-playfair text-gold-400 font-bold text-sm">{t.name}</h3>
                  <p className="text-cream-300/50 text-xs">{t.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mb-14 text-center">
            <h2 className="font-playfair text-3xl text-gold-400 mb-4">Our Location</h2>
            <p className="text-cream-300/60 text-sm mb-6">Visit us and experience the finest coffee in town</p>
            <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-espresso-700/20">
              <iframe
                title="F&F Coffee Shop Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3974.123456!2d30.058!3d-1.953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dce0abcd1234%3A0xabcdef123456!2sCoffee+Shop!5e0!3m2!1sen!2srw!4v1697071500000!5m2!1sen!2srw"
                width="100%" height="300" className="border-0" allowFullScreen="" loading="lazy" />
            </div>
          </div>

          {/* Contact + Social Media */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-espresso-800/40 to-espresso-900/40 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border border-espresso-700/20">
              <h2 className="font-playfair text-3xl text-gold-400 mb-6 text-center">Get In Touch</h2>
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
                <div className="flex items-center gap-4 bg-espresso-900/50 rounded-xl p-4 border border-espresso-700/10">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                    <FaEnvelope className="text-gold-400" size={16} />
                  </div>
                  <div>
                    <p className="text-cream-300/40 text-[10px] uppercase tracking-wide">Email</p>
                    <a href="mailto:info@ffcafe.com" className="text-cream-50 hover:text-gold-400 text-sm transition-colors no-underline">info@ffcafe.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-espresso-900/50 rounded-xl p-4 border border-espresso-700/10">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                    <FaPhone className="text-gold-400" size={16} />
                  </div>
                  <div>
                    <p className="text-cream-300/40 text-[10px] uppercase tracking-wide">Phone</p>
                    <a href="tel:+250788123456" className="text-cream-50 hover:text-gold-400 text-sm transition-colors no-underline">+250 788 123 456</a>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-espresso-900/50 rounded-xl p-4 border border-espresso-700/10">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt className="text-gold-400" size={16} />
                  </div>
                  <div>
                    <p className="text-cream-300/40 text-[10px] uppercase tracking-wide">Address</p>
                    <p className="text-cream-50 text-sm">123 Coffee Street, Kigali, Rwanda</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-espresso-900/50 rounded-xl p-4 border border-espresso-700/10">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                    <FaClock className="text-gold-400" size={16} />
                  </div>
                  <div>
                    <p className="text-cream-300/40 text-[10px] uppercase tracking-wide">Hours</p>
                    <p className="text-cream-50 text-sm">Mon-Sat: 7AM - 9PM | Sun: 8AM - 6PM</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-cream-300/50 text-sm mb-4">Follow us on social media</p>
                <div className="flex items-center justify-center gap-3">
                  {[
                    { icon: FaFacebook, href: "https://facebook.com/ffcoffee", color: "hover:text-blue-400" },
                    { icon: FaInstagram, href: "https://instagram.com/ffcoffee", color: "hover:text-pink-400" },
                    { icon: FaTwitter, href: "https://twitter.com/ffcoffee", color: "hover:text-sky-400" },
                    { icon: FaWhatsapp, href: "https://wa.me/250788123456", color: "hover:text-green-400" },
                  ].map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full bg-espresso-900/60 flex items-center justify-center text-cream-50/60 ${s.color} hover:bg-espresso-800 border border-espresso-700/30 hover:border-gold-400/30 transition-all duration-300`}>
                      <s.icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default About;
