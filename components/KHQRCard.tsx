import React from "react";
import QRCode from "react-qr-code";

interface KHQRCardProps {
  qrString: string;
  className?: string;
}

/**
 * A professional KHQR Card component that uses the project's official SVG template (QR Tag)
 * combined with a dynamic, high-resolution QR code.
 */
const KHQRCard = ({ qrString, className = "" }: KHQRCardProps) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width="204"
        height="321"
        viewBox="0 0 204 321"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        {/* Background White Base */}
        <rect width="204" height="321" rx="16" fill="white" />
        
        {/* Header Ribbon */}
        <path d="M0 16C0 7.16344 7.16344 0 16 0H188C196.837 0 204 7.16344 204 16V26L14.7951 13.8093H203.974L204 0H0V16Z" fill="#9B1F21" />
        <path d="M0 0V26L14.7951 13.8093H203.974L204 0H0Z" fill="#9B1F21"/>
        
        {/* Footer Stripe */}
        <path d="M204 307H0V305C0 296.163 7.16344 289 16 289H188C196.837 289 204 296.163 204 305V321C204 321 204 321 204 321H0V307Z" fill="#9B1F21" className="opacity-0"/>
        <path d="M204 307H0V321H204V307Z" fill="#9B1F21"/>

        {/* PAY Branding */}
        <g fill="#9B1F21">
          <path d="M79.6815 54.3869V41.7477H84.4046C85.6021 41.7477 86.683 41.9971 87.6144 42.4961C88.5457 42.995 89.3107 43.7434 89.8262 44.658C90.3584 45.606 90.6245 46.7369 90.6245 48.0507C90.6245 49.3645 90.3584 50.512 89.8262 51.4433C89.3107 52.358 88.5457 53.123 87.6144 53.6053C86.683 54.1042 85.6021 54.3537 84.4046 54.3537H79.6815V54.3869ZM81.9932 52.3414H84.4046C85.2195 52.3414 85.9014 52.1751 86.4502 51.8258C86.999 51.4766 87.4148 50.9943 87.6809 50.3623C87.9636 49.7304 88.0966 48.9654 88.0966 48.0839C88.0966 47.2025 87.9636 46.4541 87.6809 45.8055C87.3982 45.1736 86.999 44.6747 86.4502 44.3421C85.9014 43.9928 85.2195 43.8265 84.4046 43.8265H81.9932V52.3414Z"/>
          <path d="M92.6873 54.387V41.7477H100.77V43.9928H95.0489V46.687H99.4892V48.9321H95.0489V52.1584H100.953V54.4036H92.6873V54.387Z"/>
          <path d="M106.041 54.3869L101.55 41.7477H103.879L107.371 51.7094H106.906L110.415 41.7477H112.743L108.253 54.3869H106.041Z"/>
          <path d="M118.181 54.387V41.7477H122.954C124.168 41.7477 125.083 42.0138 125.682 42.5293C126.28 43.0449 126.563 43.8099 126.563 44.7911C126.563 45.5228 126.397 46.1548 126.064 46.6537C125.731 47.1526 125.233 47.5185 124.567 47.7513V47.3189C125.582 47.5351 126.33 47.9343 126.829 48.5163C127.328 49.0984 127.577 49.8634 127.577 50.8114C127.577 51.9422 127.212 52.8403 126.48 53.4556C125.748 54.0876 124.734 54.4036 123.47 54.4036L118.181 54.387ZM120.493 46.7202H122.605C123.17 46.7202 123.586 46.6038 123.869 46.371C124.152 46.1382 124.285 45.7723 124.285 45.2734C124.285 44.7578 124.152 44.3753 123.869 44.1425C123.586 43.9097 123.17 43.8099 122.605 43.8099H120.493V46.7202ZM120.493 52.3414H123.104C123.736 52.3414 124.235 52.2083 124.617 51.9589C125 51.6928 125.183 51.2271 125.183 50.5619C125.183 49.8801 124.983 49.4144 124.584 49.1649C124.185 48.9155 123.686 48.7991 123.104 48.7991H120.493V52.3414Z"/>
          <path d="M133.432 44.0094H134.031L130.388 54.3869H128.143L132.634 41.7477H134.812L139.302 54.3869H137.057L133.432 44.0094ZM136.375 51.3934H131.087V49.3645H136.375V51.3934Z"/>
          <path d="M140.765 54.3869V41.7477H143.043L148.448 49.9133V41.7477H150.76V54.3869H148.864L143.077 45.7224V54.3869H140.765Z"/>
          <path d="M153.521 54.3869V41.7477H155.833V54.3869H153.521ZM160.689 54.3869L156.016 47.7014L160.689 41.7477H163.4L158.694 47.7014L163.4 54.3869H160.689Z"/>
        </g>

        {/* Decorative Arrows */}
        <path d="M56.0667 33L50.7781 38.2885L60.5736 48.0673L50.7781 57.8461L56.0667 63.1347L65.8455 53.3559L71.134 48.0673L56.0667 33Z" fill="#9B1F21"/>
        <path d="M46.28 42.7973L41 48.0773L46.28 53.3574L51.56 48.0773L46.28 42.7973Z" fill="#9B1F21"/>

        {/* Main QR Section */}
        <rect x="42" y="91" width="122" height="122" rx="12" fill="white" />
        <rect x="42" y="91" width="122" height="122" rx="12" stroke="#F1F5F9" strokeWidth="1" />
        
        {/* The Dynamic Sharp QR */}
        <svg x="51.13" y="100.13" width="103.73" height="103.73">
          <QRCode
            value={qrString}
            size={103.73}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
            level="H"
          />
        </svg>

        {/* KHQR Available Here Text */}
        <text x="102" y="234" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="900" textAnchor="middle" fill="black">SCAN WITH ABA MOBILE</text>
        <text x="102" y="246" fontFamily="Inter, sans-serif" fontSize="7" fontWeight="500" textAnchor="middle" fill="#64748B">TO PAY SECURELY</text>

        {/* Bottom Logo Area */}
        <g transform="translate(62, 282)">
           {/* Simple ABA Logo Representation */}
           <rect width="80" height="20" rx="4" fill="#E1232E" />
           <text x="40" y="14" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="900" textAnchor="middle" fill="white">ABA PAY</text>
        </g>
      </svg>
    </div>
  );
};

export default KHQRCard;
