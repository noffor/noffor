// app/[country]/[lang]/admin/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const country = (params?.country as string) || "qa";
  const lang = (params?.lang as string) || "en";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ সেভ করা ইমেইল লোড (useEffect ব্যবহার করে)
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('admin_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) {
      // localStorage available না হলে ইগনোর
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ভ্যালিডেশন
    if (!email.trim()) {
      setError("ইমেইল দিন");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("পাসওয়ার্ড দিন");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      setLoading(false);
      return;
    }

    try {
      // সাইন ইন
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("ইমেইল বা পাসওয়ার্ড ভুল");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("ইমেইল ভেরিফাই করা হয়নি। দয়া করে ইমেইল চেক করুন।");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      // রিমেম্বার মি
      try {
        if (rememberMe) {
          localStorage.setItem('admin_email', email);
        } else {
          localStorage.removeItem('admin_email');
        }
      } catch (e) {
        // localStorage available না হলে ইগনোর
      }

      // প্রোফাইল চেক
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', data.user!.id)
        .maybeSingle();

      if (!profile || profile.role !== 'admin') {
        setError("আপনার অ্যাডমিন অ্যাক্সেস নেই");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // অ্যাডমিন নাম সেভ
      try {
        localStorage.setItem('admin_name', profile.name || 'Admin');
      } catch (e) {
        // localStorage available না হলে ইগনোর
      }

      // সফল
      router.push(`/${country}/${lang}/admin/dashboard`);
      
    } catch (err) {
      setError("কিছু একটা সমস্যা হয়েছে");
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("rubelrana@noffor.com");
    setPassword("");
    setError("");
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: "rgba(26,26,26,0.95)",
        backdropFilter: "blur(10px)",
        padding: "40px 30px",
        borderRadius: 20,
        width: 400,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,102,0,0.1)"
      }}>
        {/* লোগো */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{
            width: 60,
            height: 60,
            background: "linear-gradient(135deg, #f60, #e00)",
            borderRadius: 16,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 15,
            boxShadow: "0 10px 30px rgba(255,102,0,0.3)"
          }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
          </div>
          <h1 style={{ 
            color: "#fff", 
            fontSize: 26, 
            fontWeight: 700,
            marginBottom: 5 
          }}>
            অ্যাডমিন প্যানেল
          </h1>
          <p style={{ 
            color: "#888", 
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}>
            <span style={{
              background: "rgba(255,102,0,0.2)",
              color: "#f60",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600
            }}>
              {country.toUpperCase()}
            </span>
            <span style={{
              background: "rgba(255,255,255,0.1)",
              color: "#aaa",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600
            }}>
              {lang.toUpperCase()}
            </span>
          </p>
        </div>

        {/* এরর */}
        {error && (
          <div style={{
            background: "rgba(255,0,0,0.15)",
            border: "1px solid rgba(255,0,0,0.3)",
            padding: "12px 15px",
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ color: "#ff6b6b", fontSize: 13, flex: 1 }}>{error}</span>
            <button 
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                color: "#ff6b6b",
                cursor: "pointer",
                fontSize: 18,
                padding: "0 5px"
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* ফর্ম */}
        <form onSubmit={handleLogin}>
          {/* ইমেইল */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: "block",
              color: "#aaa",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1
            }}>
              📧 ইমেইল
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@noffor.com"
                style={{
                  width: "100%",
                  padding: "14px 15px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  borderRadius: 12,
                  outline: "none",
                  fontSize: 14,
                  boxSizing: "border-box",
                  transition: "all 0.3s"
                }}
                required
                disabled={loading}
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail("")}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* পাসওয়ার্ড */}
          <div style={{ marginBottom: 12 }}>
            <label style={{
              display: "block",
              color: "#aaa",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1
            }}>
              🔒 পাসওয়ার্ড
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%",
                  padding: "14px 50px 14px 15px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  borderRadius: 12,
                  outline: "none",
                  fontSize: 14,
                  boxSizing: "border-box",
                  transition: "all 0.3s"
                }}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: 18,
                  padding: "5px"
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* রিমেম্বার মি + ফরগট */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25
          }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              color: "#888",
              fontSize: 12
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: "#f60",
                  width: 16,
                  height: 16,
                  cursor: "pointer"
                }}
              />
              মনে রাখুন
            </label>
            <span style={{
              color: "#f60",
              fontSize: 12,
              cursor: "pointer"
            }}>
              পাসওয়ার্ড ভুলে গেছেন?
            </span>
          </div>

          {/* সাবমিট */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading 
                ? "linear-gradient(135deg, #555, #444)" 
                : "linear-gradient(135deg, #f60, #e00)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              boxShadow: loading ? "none" : "0 10px 30px rgba(255,102,0,0.3)",
              letterSpacing: 0.5
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{
                  width: 18,
                  height: 18,
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.8s linear infinite"
                }} />
                সাইন ইন হচ্ছে...
              </span>
            ) : (
              "🚀 সাইন ইন"
            )}
          </button>
        </form>

        {/* ডেমো বাটন */}
        <button
          type="button"
          onClick={fillDemo}
          style={{
            width: "100%",
            marginTop: 15,
            padding: "10px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#888",
            borderRadius: 12,
            cursor: "pointer",
            fontSize: 12,
            transition: "all 0.3s"
          }}
        >
          🔑 ডেমো অ্যাডমিন ইমেইল
        </button>

        {/* ফুটার */}
        <p style={{
          textAlign: "center",
          color: "#555",
          fontSize: 10,
          marginTop: 20
        }}>
          🔒 সিকিউর অ্যাডমিন অ্যাক্সেস • NOFFOR
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}