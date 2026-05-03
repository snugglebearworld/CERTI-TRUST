'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, QrCode, CheckCircle2, Lock, Award } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [certificateId, setCertificateId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;
    
    setIsLoading(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      router.push(`/info/${certificateId.trim()}`);
    }, 300);
  };

  const extractCertId = (rawValue: string): string | null => {
    // Handle full URLs like https://example.com/info/CERT-123
    try {
      const parsed = new URL(rawValue);
      const parts = parsed.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("info");
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
      // fallback: last path segment
      const last = parts[parts.length - 1];
      if (last) return last;
    } catch {
      // Not a URL — treat the raw value as the certificate ID directly
      const trimmed = rawValue.trim();
      if (trimmed) return trimmed;
    }
    return null;
  };

  const decodeQrFromFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error("canvas")); return; }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        import("jsqr").then(({ default: jsQR }) => {
          const result = jsQR(imageData.data, imageData.width, imageData.height);
          if (result?.data) resolve(result.data);
          else reject(new Error("no_qr"));
        }).catch(reject);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("load")); };
      img.src = url;
    });

  const handleQrScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Reset input so the same file can be selected again
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    let rawValue: string | undefined;

    // 1. Try native BarcodeDetector (Chrome/Edge desktop + Android Chrome)
    const BarcodeDetectorCtor = (window as Window & { BarcodeDetector?: unknown } & { BarcodeDetector: new (opts: object) => { detect: (src: ImageBitmapSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (BarcodeDetectorCtor) {
      try {
        const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
        const bitmap = await createImageBitmap(file);
        const results = await detector.detect(bitmap);
        rawValue = results?.[0]?.rawValue;
      } catch {
        // fall through to jsQR
      }
    }

    // 2. Fall back to jsQR (works in all browsers including Safari & Firefox)
    if (!rawValue) {
      try {
        rawValue = await decodeQrFromFile(file);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "no_qr") {
          alert("No QR code detected in this image. Make sure the QR code is clearly visible.");
        } else {
          alert("Could not read this image. Please try a clearer photo.");
        }
        return;
      }
    }

    const certId = extractCertId(rawValue);
    if (certId) {
      router.push(`/info/${encodeURIComponent(certId)}`);
    } else {
      alert("QR code does not contain a valid certificate link.");
    }
  };

  const handleScanQrCode = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0ea5e9]">
        {/* Overlay Pattern for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08)_0%,transparent_50%)]"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
              <ShieldCheck className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-lg">CertiTrust.LK</span>
          </div>
          <a 
            className="text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/20 transition-all duration-200 shadow-lg shadow-black/10" 
            href="admin/login"
          >
            Staff Portal Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col items-center gap-12 text-center">
              {/* Hero Text */}
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Award className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">Secure & Trusted Verification</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl leading-tight">
                  Certificate Verification
                </h1>
                
                <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-lg">
                  Instantly verify the authenticity of your certificates with our secure platform
                </p>
              </div>

              {/* Verification Form Card */}
              <div className="w-full max-w-xl group animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                  <form onSubmit={handleVerify} className="space-y-6">
                    <div className="relative flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors">
                          <Search className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <input
                          id="certificate-id"
                          type="text"
                          value={certificateId}
                          onChange={(e) => setCertificateId(e.target.value)}
                          placeholder="Enter Certificate ID"
                          className="w-full h-14 pl-12 pr-4 text-base font-medium text-white placeholder:text-white/50 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-white/40 focus:bg-white/15 focus:ring-4 focus:ring-white/10 transition-all duration-200"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="h-14 px-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-xl shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 border border-white/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
                        )}
                        {isLoading ? 'Verifying...' : 'Verify Now'}
                      </button>
                    </div>
                  </form>
                  
                  <p className="mt-3 text-sm text-white/70 font-medium text-center">
                    Example: <span className="text-white font-semibold">AZ00*****</span>
                  </p>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-transparent text-white/80 font-semibold">or</span>
                    </div>
                  </div>

                  <button
                    onClick={handleScanQrCode}
                    className="w-full bg-white/10 border-2 border-white/30 hover:border-white/50 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
                  >
                    <QrCode className="w-6 h-6" strokeWidth={2.5} />
                    Scan QR Code
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleQrScan}
                    className="hidden"
                  />
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 flex items-center justify-center gap-8 text-white/80">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-sm font-semibold">Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-sm font-semibold">Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-sm font-semibold">Trusted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 w-full text-center py-8 text-sm text-white/70 font-medium">
          © 2026 E-Verify Portal. All rights reserved.
        </footer>
      </main>
    </div>
  );
}