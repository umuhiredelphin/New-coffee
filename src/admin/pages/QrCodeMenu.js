import React, { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { FiDownload, FiPrinter, FiLink, FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiExternalLink } from "react-icons/fi";
import { FaQrcode, FaCoffee } from "react-icons/fa";
import logo from "../../assets/logo.png";

const STORAGE_KEY = "ff_menu_qr_url";
const PUBLIC_MENU_PATH = "/qr-menu";

const getDefaultUrl = () => {
  const { origin } = window.location;
  if (origin && !/localhost|127\.0\.0\.1/i.test(origin)) {
    return `${origin}${PUBLIC_MENU_PATH}`;
  }
  return `${origin}${PUBLIC_MENU_PATH}`;
};

const isValidUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isProductionUrl = (value) => {
  if (!isValidUrl(value)) return false;
  try {
    const { hostname, protocol } = new URL(value.trim());
    if (protocol !== "https:") return false;
    return !/localhost|127\.0\.0\.1|0\.0\.0\.0|\.local$/i.test(hostname);
  } catch {
    return false;
  }
};

const buildPosterCanvas = async (url, isProd) => {
  const qrSize = 700;
  const pad = 90;
  const headerH = 220;
  const footerH = 150;
  const width = qrSize + pad * 2;
  const height = headerH + qrSize + footerH + pad;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#2c1810");
  gradient.addColorStop(1, "#1a0e08");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#d4a853";
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  ctx.fillStyle = "#d4a853";
  ctx.font = "bold 58px 'Playfair Display', Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("F&F Coffee", width / 2, 105);

  ctx.fillStyle = "#fdf8f0";
  ctx.font = "600 30px 'Poppins', sans-serif";
  ctx.fillText("Scan for Our Menu", width / 2, 160);

  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: qrSize,
    color: { dark: "#1a0e08", light: "#ffffff" },
  });

  const qrImg = new Image();
  await new Promise((resolve, reject) => {
    qrImg.onload = resolve;
    qrImg.onerror = reject;
    qrImg.src = qrDataUrl;
  });

  const qrX = (width - qrSize) / 2;
  const qrY = headerH;
  const radius = 24;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(qrX + radius, qrY);
  ctx.arcTo(qrX + qrSize, qrY, qrX + qrSize, qrY + qrSize, radius);
  ctx.arcTo(qrX + qrSize, qrY + qrSize, qrX, qrY + qrSize, radius);
  ctx.arcTo(qrX, qrY + qrSize, qrX, qrY, radius);
  ctx.arcTo(qrX, qrY, qrX + qrSize, qrY, radius);
  ctx.closePath();
  ctx.fill();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = "#e8ddd3";
  ctx.font = "400 24px 'Poppins', sans-serif";
  ctx.fillText("F&F COFFEE SHOP", width / 2, qrY + qrSize + 70);
  ctx.fillStyle = "#b89574";
  ctx.font = "400 20px 'Poppins', sans-serif";
  ctx.fillText(isProd ? "Scan with your phone camera" : "TEST QR - NOT FOR PRINTING", width / 2, qrY + qrSize + 108);

  if (!isProd) {
    ctx.strokeStyle = "rgba(220, 53, 69, 0.9)";
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, width - 48, height - 48);
    ctx.save();
    ctx.translate(width / 2, qrY + qrSize / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillStyle = "rgba(220, 53, 69, 0.85)";
    ctx.font = "bold 72px 'Poppins', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TEST", 0, 24);
    ctx.restore();
  }

  return canvas;
};

export default function QrCodeMenu() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [savedUrl, setSavedUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const previewRef = useRef(null);

  const isProd = isProductionUrl(savedUrl);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = stored || getDefaultUrl();
    setUrl(initial);
    setSavedUrl(initial);
  }, []);

  useEffect(() => {
    if (!savedUrl || !isValidUrl(savedUrl)) {
      setQrDataUrl("");
      return;
    }
    let active = true;
    QRCode.toDataURL(savedUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 512,
      color: { dark: "#1a0e08", light: "#ffffff" },
    })
      .then((d) => {
        if (active) setQrDataUrl(d);
      })
      .catch(() => {
        if (active) setQrDataUrl("");
      });
    return () => {
      active = false;
    };
  }, [savedUrl]);

  const handleSave = useCallback(() => {
    const value = url.trim();
    if (!isValidUrl(value)) {
      setUrlError("Enter a complete URL starting with http:// or https://");
      return;
    }
    setUrlError("");
    localStorage.setItem(STORAGE_KEY, value);
    setSavedUrl(value);
  }, [url]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    const def = getDefaultUrl();
    setUrl(def);
    setSavedUrl(def);
    setUrlError("");
  };

  const handleDownloadPng = async () => {
    if (!isProd) return;
    setBusy(true);
    try {
      const canvas = await buildPosterCanvas(savedUrl, isProd);
      const link = document.createElement("a");
      link.download = "ff-coffee-menu-qr.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => {
    if (!isProd) return;
    window.print();
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-espresso-950/60 border border-espresso-700 rounded-xl text-cream-50 text-sm placeholder-espresso-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-b from-espresso-950 via-espresso-900 to-espresso-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 print:hidden">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <FaQrcode className="text-espresso-950 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-bold text-gold-400">
                Menu QR Code
              </h1>
              <p className="text-cream-300 text-sm">
                Generate and print the QR code that opens the public digital menu.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-espresso-800/40 border border-espresso-700/60 rounded-2xl p-6 print:hidden">
            <h2 className="text-lg font-bold text-cream-50 mb-4 flex items-center gap-2">
              <FiLink className="text-gold-400" /> Menu Link
            </h2>

            <label className="block text-xs font-semibold text-cream-300 mb-1.5">
              Production menu URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              placeholder="https://your-domain.com/qr-menu"
              className={inputCls}
            />
            {urlError && (
              <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                <FiAlertTriangle className="w-3.5 h-3.5" />
                {urlError}
              </p>
            )}

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-950 text-sm font-bold rounded-xl hover:scale-[1.01] active:scale-95 transition-transform"
              >
                Save &amp; Generate
              </button>
              <button
                onClick={handleReset}
                title="Reset to current site URL"
                className="p-2.5 bg-espresso-950/60 border border-espresso-700 rounded-xl text-cream-200 hover:bg-espresso-700 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 pt-5 border-t border-espresso-700/60 space-y-2.5">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-cream-300/60 w-28 flex-shrink-0">
                  Encodes:
                </span>
                <span className="text-cream-100 break-all">{savedUrl || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-cream-300/60 w-28 flex-shrink-0">
                  Status:
                </span>
                {isProd ? (
                  <span className="inline-flex items-center gap-1.5 text-green-400 font-semibold">
                    <FiCheckCircle className="w-3.5 h-3.5" /> Production URL —
                    ready to print
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
                    <FiAlertTriangle className="w-3.5 h-3.5" /> Not production —
                    printing disabled
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 bg-espresso-950/50 border border-espresso-700/50 rounded-xl p-3.5">
              <p className="text-cream-300/70 text-[11px] leading-relaxed">
                The QR code encodes the full public URL. Dev/local URLs are
                watermarked <span className="text-red-400 font-semibold">TEST — NOT FOR PRINTING</span>{" "}
                and cannot be downloaded or printed. Set a real{" "}
                <span className="text-gold-300">https</span> production URL to
                enable the final code.
              </p>
            </div>

            <a
              href={savedUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 text-xs font-semibold"
            >
              <FiExternalLink className="w-3.5 h-3.5" /> Preview public menu
            </a>
          </div>

          <div className="bg-espresso-800/40 border border-espresso-700/60 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-cream-50 mb-4 flex items-center gap-2 print:hidden">
              <FaQrcode className="text-gold-400" /> Live Preview
            </h2>

            <div
              ref={previewRef}
              id="qr-print-area"
              className="relative bg-gradient-to-b from-espresso-900 to-espresso-950 border border-espresso-700/60 rounded-2xl p-6 flex flex-col items-center text-center"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <FaCoffee className="text-espresso-950" />
                </div>
                <span className="text-cream-50 font-playfair font-bold text-xl">
                  F&amp;F Coffee
                </span>
              </div>
              <p className="text-gold-300 text-sm mb-5">Scan for Our Menu</p>

              {qrDataUrl ? (
                <div className="relative">
                  <img
                    src={qrDataUrl}
                    alt="Menu QR code"
                    className="w-52 h-52 bg-white rounded-xl p-2 shadow-lg shadow-black/40"
                  />
                  {!isProd && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-red-600/90 text-white text-sm font-bold px-4 py-1.5 rounded-md -rotate-[30deg] shadow-lg tracking-wider">
                        TEST
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-52 h-52 rounded-xl border-2 border-dashed border-espresso-600 flex items-center justify-center text-cream-300/50 text-xs">
                  Enter a valid URL
                </div>
              )}

              <p className="text-cream-300/60 text-[11px] mt-4">
                {isProd ? "Scan with your phone camera" : "TEST QR — NOT FOR PRINTING"}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-5 print:hidden">
              <button
                onClick={handleDownloadPng}
                disabled={!isProd || busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-950 text-sm font-bold rounded-xl hover:scale-[1.01] active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <FiDownload className="w-4 h-4" />
                {busy ? "Generating..." : "Download PNG"}
              </button>
              <button
                onClick={handlePrint}
                disabled={!isProd}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-espresso-950/60 border border-espresso-700 text-cream-100 text-sm font-bold rounded-xl hover:bg-espresso-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiPrinter className="w-4 h-4" />
                Print
              </button>
            </div>

            {!isProd && (
              <p className="text-amber-400/90 text-[11px] mt-3 text-center print:hidden">
                Download &amp; Print unlock once a production https URL is saved.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-print-area, #qr-print-area * { visibility: visible; }
          #qr-print-area {
            position: fixed;
            inset: 0;
            margin: auto;
            max-width: 100%;
            border: none;
            border-radius: 0;
            padding-top: 6cm;
            background: #1a0e08 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
