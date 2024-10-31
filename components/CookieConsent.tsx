'use client'
import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent');
    if (hasAccepted) {
      setIsVisible(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-green-700 text-white py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-50 ">
        
      <div className="flex flex-col sm:flex-row items-center gap-2 text-sm ">
        <span className="font-semibold">We Value Your Privacy</span>
        <span className="text-center sm:text-left">
          Our website uses cookies that are essential for its operation. If you agree to us also using analytical, functional, and targeting cookies that allow us to improve our website, personalize content, and show you relevant adverts (both on and off our website and app), please click accept. If you do not agree or would like to change your preferences, click{' '}
          <button 
            onClick={() => alert('Manage Cookie Settings')} 
            className="text-blue-400 hover:underline"
          >
            Manage Cookie Settings
          </button>
        </span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          className="bg-green-400 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;