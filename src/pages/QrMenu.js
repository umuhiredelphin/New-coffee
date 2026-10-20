import React, { useState, useEffect } from "react";
import { FiDownload, FiMaximize2, FiX, FiSmartphone } from "react-icons/fi";
import { FaCoffee } from "react-icons/fa";
import menuPdf from "../assets/F&F COFFEE SHOP MENU.pdf";
import logo from "../assets/logo.png";

const APP_STORE_URL = "https://example.com/ff-coffee-app";

function QrMenu() {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(ua));
  }, []);

  const handleOpenPdf = () => {
    window.open(menuPdf, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 flex flex-col">
      <header className="sticky top-0 z-40 bg-espresso-950/90 backdrop-blur-md border-b border-espresso-800/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="F&F Coffee"
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-black/30"
            />
            <div>
              <h1 className="text-base font-bold text-cream-50 leading-tight font-playfair">
                F&F Coffee
              </h1>
              <p className="text-[10px] text-gold-400 tracking-widest uppercase">
                Digital Menu
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowComingSoon(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-950 text-xs font-bold rounded-full shadow-lg shadow-gold-500/30 hover:scale-105 active:scale-95 transition-transform"
          >
            <FiSmartphone className="w-4 h-4" />
            Open App
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 py-5">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold text-gold-400">
            Our Menu
          </h2>
          <p className="text-cream-300 text-sm mt-1">
            Explore our handcrafted coffee, drinks &amp; food
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          <button
            onClick={handleOpenPdf}
            className="flex items-center gap-2 px-4 py-2 bg-espresso-800/60 border border-espresso-700 text-cream-100 text-sm font-medium rounded-full hover:bg-espresso-700 transition-colors"
          >
            <FiMaximize2 className="w-4 h-4" />
            Open Full Screen
          </button>
          <a
            href={menuPdf}
            download="F&F-COFFEE-SHOP-MENU.pdf"
            className="flex items-center gap-2 px-4 py-2 bg-espresso-800/60 border border-espresso-700 text-cream-100 text-sm font-medium rounded-full hover:bg-espresso-700 transition-colors"
          >
            <FiDownload className="w-4 h-4" />
            Download PDF
          </a>
        </div>

        <div className="bg-espresso-800/40 border border-espresso-700/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          <object
            data={`${menuPdf}#view=FitH`}
            type="application/pdf"
            className="w-full h-[75vh] min-h-[420px] bg-espresso-900"
          >
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-500/10 mb-4">
                <FaCoffee className="text-gold-400 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-cream-50 mb-2 font-poppins">
                View the F&amp;F Coffee menu
              </h3>
              <p className="text-cream-300 text-sm mb-5 max-w-md mx-auto">
                Your browser cannot display the PDF inline. Tap below to open or
                download the menu.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={handleOpenPdf}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-950 text-sm font-bold rounded-full shadow-lg shadow-gold-500/30"
                >
                  <FiMaximize2 className="w-4 h-4" />
                  Open Menu
                </button>
                <a
                  href={menuPdf}
                  download="F&F-COFFEE-SHOP-MENU.pdf"
                  className="flex items-center gap-2 px-5 py-2.5 bg-espresso-800 border border-espresso-700 text-cream-100 text-sm font-semibold rounded-full"
                >
                  <FiDownload className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </object>
        </div>

        {isMobile && (
          <p className="text-center text-cream-300/60 text-xs mt-3">
            Tip: pinch to zoom, or tap “Open Full Screen” for the best view.
          </p>
        )}
      </main>

      <footer className="border-t border-espresso-800/50 py-4">
        <p className="text-center text-cream-300/50 text-xs">
          &copy; {new Date().getFullYear()} F&amp;F Coffee Shop. All rights
          reserved.
        </p>
      </footer>

      {showComingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="relative w-full max-w-sm bg-gradient-to-b from-espresso-800 to-espresso-900 border border-espresso-700 rounded-2xl p-6 text-center shadow-2xl shadow-black/60 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-cream-300/70 hover:text-cream-50 hover:bg-espresso-700 transition-colors"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 mb-4 shadow-lg shadow-gold-500/30">
              <FaCoffee className="text-espresso-950 text-3xl" />
            </div>

            <h3 className="text-xl font-bold text-cream-50 font-playfair mb-2">
              F&amp;F Coffee App
            </h3>
            <p className="text-cream-300 text-sm leading-relaxed">
              The F&amp;F Coffee mobile app is coming soon. Scan, order and earn
              rewards right from your phone — stay tuned!
            </p>

            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-espresso-950/60 border border-gold-500/30 rounded-full">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse-soft" />
              <span className="text-gold-300 text-xs font-semibold tracking-wide">
                Coming Soon
              </span>
            </div>

            <button
              onClick={() => setShowComingSoon(false)}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-950 text-sm font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-transform"
            >
              Got it
            </button>

            <a
              href={APP_STORE_URL}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            >
              App
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default QrMenu;
