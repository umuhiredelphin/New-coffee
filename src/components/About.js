import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import aboutImage from "../assets/momo.png"; // optional image

const About = () => {
  return (
    <>
      <Navbar />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1>About F&F Coffee Shop</h1>
          <p>Discover our story, passion, and dedication to the perfect coffee experience.</p>
        </div>

        {/* Story & Mission */}
        <div style={styles.content}>
          <div style={styles.textSection}>
            <h2>Our Story</h2>
            <p>
              F&F Coffee Shop started as a small local cafe with a big dream: to bring the finest coffee and
              cozy atmosphere to every coffee lover. Our journey has been driven by passion, creativity,
              and the pursuit of quality.
            </p>

            <h2>Our Mission</h2>
            <p>
              Our mission is simple – provide exceptional coffee, delicious food, and an inviting environment
              for friends, family, and solo visitors. Every cup we serve is crafted with love and care.
            </p>

            <h2>Our Values</h2>
            <ul>
              <li>Quality: Only the best beans and ingredients are used.</li>
              <li>Customer Care: Your satisfaction is our priority.</li>
              <li>Community: Supporting local producers and sustainability.</li>
              <li>Innovation: Bringing new flavors and experiences to your table.</li>
            </ul>
          </div>

          <div style={styles.imageSection}>
            <img src={aboutImage} alt="About Coffee" style={styles.image} />
          </div>
        </div>

        {/* Why Choose Us */}
        <div style={styles.whyUs}>
          <h2>Why Choose F&F Coffee Shop?</h2>
          <div style={styles.cards}>
            <div style={styles.card}>
              <h3>Premium Quality</h3>
              <p>We use only fresh, high-quality ingredients for every cup and meal.</p>
            </div>
            <div style={styles.card}>
              <h3>Cozy Environment</h3>
              <p>Relax in our comfortable, warm, and inviting space with friends or alone.</p>
            </div>
            <div style={styles.card}>
              <h3>Friendly Staff</h3>
              <p>Our team is always ready to make your experience delightful and memorable.</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div style={styles.teamSection}>
          <h2>Meet Our Team</h2>
          <p>Our dedicated team is here to make your coffee experience unforgettable.</p>
          <div style={styles.teamCards}>
            <div style={styles.card}>
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Team" style={styles.teamImage} />
              <h3>John Doe</h3>
              <p>Head Barista</p>
            </div>
            <div style={styles.card}>
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Team" style={styles.teamImage} />
              <h3>Jane Smith</h3>
              <p>Manager</p>
            </div>
            <div style={styles.card}>
              <img src="https://randomuser.me/api/portraits/men/12.jpg" alt="Team" style={styles.teamImage} />
              <h3>Mark Lee</h3>
              <p>Chef</p>
            </div>
          </div>
        </div>

        {/* Location & Map */}
        <div style={styles.mapSection}>
          <h2>Our Location</h2>
          <p>Visit us at 123 Coffee Street, Kigali, Rwanda</p>
          <iframe
            title="F&F Coffee Shop Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3974.123456!2d30.058!3d-1.953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dce0abcd1234%3A0xabcdef123456!2sCoffee+Shop!5e0!3m2!1sen!2srw!4v1697071500000!5m2!1sen!2srw"
            width="100%"
            height="350"
            style={{ border: 0, borderRadius: "15px" }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>

        {/* Contact Info */}
        <div style={styles.contactSection}>
          <h2>Contact Us</h2>
          <p>Email: info@ffcafe.com | Phone: +250 788 123 456</p>
          <p>Follow us on social media for updates and offers!</p>
        </div>
      </div>

      <Footer />
    </>
  );
};

const styles = {
  container: {
    paddingTop: "80px",
    paddingBottom: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
    paddingLeft: "20px",
    paddingRight: "20px",
  },
  header: { textAlign: "center", marginBottom: "50px" },
  content: { display: "flex", flexDirection: "row", gap: "40px", flexWrap: "wrap", marginBottom: "50px" },
  textSection: { flex: 1, minWidth: "280px" },
  imageSection: { flex: 1, minWidth: "280px", display: "flex", justifyContent: "center", alignItems: "center" },
  image: { width: "100%", maxWidth: "450px", borderRadius: "15px", objectFit: "cover", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" },
  whyUs: { textAlign: "center", marginBottom: "50px" },
  cards: { display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap", marginTop: "20px" },
  card: { backgroundColor: "#fff", borderRadius: "15px", padding: "20px", width: "250px", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", textAlign: "center", transition: "0.3s", cursor: "pointer" },
  cardHover: { transform: "translateY(-5px)", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" },
  teamSection: { textAlign: "center", marginTop: "50px" },
  teamCards: { display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap", marginTop: "20px" },
  teamImage: { width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" },
  mapSection: { marginTop: "50px", textAlign: "center" },
  contactSection: { marginTop: "30px", textAlign: "center" },
};

export default About;
