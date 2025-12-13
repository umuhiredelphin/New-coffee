import React from "react";

// ===============================
// Today Special Section
// ===============================
function TodaySpecial() {
  return (
    <section style={{
      background: "linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)",
      padding: "60px 20px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: "url('/coffee-pattern.png')",
        opacity: 0.1,
        backgroundSize: "cover"
      }}></div>
      
      <div style={{ 
        maxWidth: "1000px", 
        margin: "0 auto", 
        textAlign: "center",
        position: "relative",
        zIndex: 1
      }}>
        <div style={{
          display: "inline-block",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          padding: "8px 20px",
          borderRadius: "30px",
          marginBottom: "20px",
          fontSize: "0.9rem",
          fontWeight: "600",
          letterSpacing: "1px",
          color: "#fff"
        }}>LIMITED TIME OFFER</div>
        
        <h2 style={{ 
          fontSize: "2.8rem", 
          color: "#ffffff", 
          marginBottom: "20px",
          fontWeight: "700"
        }}>🥤 20% Off on All Iced Coffees Today!</h2>
        
        <p style={{ 
          fontSize: "1.2rem", 
          color: "#f5f5f5", 
          maxWidth: "700px", 
          margin: "0 auto 30px",
          lineHeight: "1.6"
        }}>Beat the heat with our refreshing iced coffee collection. Perfectly brewed, chilled, and ready to energize your day.</p>
        
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap"
        }}>
          <button style={{
            backgroundColor: "#ffffff",
            color: "#6d4c41",
            border: "none",
            borderRadius: "30px",
            padding: "15px 35px",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)"
          }}>Order Now</button>
          
          <button style={{
            backgroundColor: "transparent",
            color: "#ffffff",
            border: "2px solid #ffffff",
            borderRadius: "30px",
            padding: "15px 35px",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}>View Menu</button>
        </div>
        
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "40px",
          gap: "15px"
        }}>
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
            padding: "15px",
            width: "150px"
          }}>
            <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#ffffff" }}>20%</div>
            <div style={{ fontSize: "0.9rem", color: "#f5f5f5" }}>Discount</div>
          </div>
          
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
            padding: "15px",
            width: "150px"
          }}>
            <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#ffffff" }}>Today</div>
            <div style={{ fontSize: "0.9rem", color: "#f5f5f5" }}>Only</div>
          </div>
          
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
            padding: "15px",
            width: "150px"
          }}>
            <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#ffffff" }}>All</div>
            <div style={{ fontSize: "0.9rem", color: "#f5f5f5" }}>Iced Coffees</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===============================
// Testimonials Section
// ===============================
function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      comment: "Best coffee in town! The atmosphere is cozy and the staff is incredibly friendly. I come here every morning before work.",
      avatar: "/avatar1.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 5,
      comment: "The quality of their coffee is unmatched. I've tried many coffee shops, but this one has become my absolute favorite.",
      avatar: "/avatar2.jpg"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      rating: 4,
      comment: "Love their specialty drinks! The seasonal offerings are always creative and delicious. A bit pricey but worth it for the quality.",
      avatar: "/avatar3.jpg"
    }
  ];

  return (
    <section style={{ 
      padding: "60px 20px", 
      backgroundColor: "#ffffff"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            color: "#3e2723", 
            marginBottom: "15px",
            fontWeight: "700"
          }}>What Our Customers Say</h2>
          <p style={{ 
            fontSize: "1.1rem", 
            color: "#5d4037", 
            maxWidth: "600px", 
            margin: "0 auto"
          }}>Don't just take our word for it. Here's what our customers have to say about their experience at F&F Coffee Shop.</p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "30px",
          marginTop: "40px"
        }}>
          {testimonials.map(testimonial => (
            <div
              key={testimonial.id}
              style={{
                backgroundColor: "#f8f4f1",
                borderRadius: "16px",
                padding: "30px",
                boxShadow: "0 5px 15px rgba(62, 39, 35, 0.08)",
                position: "relative",
                height: "100%"
              }}
            >
              <div style={{
                position: "absolute",
                top: "-15px",
                left: "30px",
                fontSize: "3rem",
                color: "#8d6e63",
                opacity: 0.2
              }}>"</div>
              
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#d7ccc8",
                  marginRight: "15px",
                  overflow: "hidden"
                }}>
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <h4 style={{ 
                    margin: "0 0 5px 0", 
                    color: "#3e2723",
                    fontSize: "1.1rem"
                  }}>{testimonial.name}</h4>
                  <div style={{ color: "#ffc107" }}>
                    {"★".repeat(testimonial.rating)}
                    {"☆".repeat(5 - testimonial.rating)}
                  </div>
                </div>
              </div>
              
              <p style={{ 
                color: "#5d4037", 
                fontSize: "1rem", 
                lineHeight: "1.6",
                fontStyle: "italic"
              }}>{testimonial.comment}</p>
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button style={{
            backgroundColor: "#6d4c41",
            color: "white",
            border: "none",
            borderRadius: "30px",
            padding: "12px 30px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.3s ease"
          }}>Read More Reviews</button>
        </div>
      </div>
    </section>
  );
}

// ===============================
// Export One Main Component
// ===============================
export default function HomeSections() {
  return (
    <>
      <TodaySpecial />
      <Testimonials />
    </>
  );
}