"use client";

import React from "react";
import QRCode from "react-qr-code";

interface ABAQRProps {
  qrString: string;
  amount?: string;
  merchantName?: string;
  className?: string;
}

const ABAQR: React.FC<ABAQRProps> = ({ 
  qrString, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm ${className}`}>
      <div className="relative group">
        <div className="p-1 bg-white">
          <QRCode
            value={qrString}
            size={220}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
            level="H" 
          />
        </div>
        
        {/* Discreet Center Branding */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-lg">
           <div className="bg-[#0a5c7c] w-9 h-9 rounded-md flex items-center justify-center shadow-sm">
             <span className="text-white font-black text-lg leading-none tracking-tighter">ABA</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ABAQR;
