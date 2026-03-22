import React from "react";
import { FaFacebook } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaSquareXTwitter } from "react-icons/fa6";
import { AiFillTikTok } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { IoLocationSharp } from "react-icons/io5";
import { FaSquarePhone } from "react-icons/fa6";

const Footer: React.FC = () => {
  return (
    <div
      className="relative flex flex-col p-6 lg:p-12 xl:p-20 bg-cover bg-center text-white h-auto min-h-[200px] lg:min-h-[500px]"
      style={{
        backgroundImage: "url('kbalchay.JPG')",
      }}
    >
      {/* Green Overlay */}
      <div className="absolute inset-0 bg-[#6f4e37] opacity-50 lg:opacity-80"></div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Main Content */}
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start mb-12 gap-8 lg:gap-4">
          <div className="flex flex-col items-center lg:items-start mb-6 lg:mb-0 text-center lg:text-left text-xl">
            <img
              src="DomnerDesktop.png"
              alt="Domner Logo"
              className="w-32 lg:w-48 mb-2"
            />
            <div className="text-base">
              <p>
                Best company for travel <br /> Eco-tourism area
              </p>
            </div>
            <div className="flex space-x-3 my-2">
              <a href="#" className="text-white text-base lg:text-xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-white text-base lg:text-xl">
                <AiFillInstagram />
              </a>
              <a href="#" className="text-white text-base lg:text-xl">
                <FaSquareXTwitter />
              </a>
              <a href="#" className="text-white text-base lg:text-xl">
                <AiFillTikTok />
              </a>
            </div>
            <p className="text-sm lg:text-base">&copy; 2024 Domner</p>
          </div>

          <div className="flex flex-col items-center lg:items-start mb-6 lg:mb-0 text-center lg:text-left">
            <h3 className="mb-4 lg:mb-6 text-lg lg:text-xl font-bold">
              Contact Us
            </h3>
            <div className="space-y-2">
              <p className="flex items-center justify-center lg:justify-start">
                <IoLocationSharp className="mr-2" />
                79 Kampuchea Krom Blvd (128), Phnom Penh 12251
              </p>
              <p className="flex items-center justify-center lg:justify-start">
                <MdEmail className="mr-2" />
                Email:{" "}
                <a
                  href="mailto:domnerkh@gmail.com"
                  className="text-blue-300 ml-1"
                >
                  Domner.travel@gmail.com
                </a>
              </p>
              <p className="flex items-center justify-center lg:justify-start">
                <FaSquarePhone className="mr-2" />
                Phone: +855-77 952 454
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="mb-4 lg:mb-6 text-lg lg:text-xl font-bold">
              Payment Methods
            </h3>
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
              <img
                src="visa.png"
                alt="Visa"
                className="w-12 h-8 object-contain bg-white rounded p-1"
              />
              <img
                src="unionpay.png"
                alt="Apple Pay"
                className="w-12 h-8 object-contain bg-white rounded p-1"
              />
              <img
                src="master-card.png"
                alt="Mastercard"
                className="w-12 h-8 object-contain bg-white rounded p-1"
              />
              <img
                src="paypal.png"
                alt="PayPal"
                className="w-12 h-8 object-contain bg-white rounded p-1"
              />
              <img src="aba.png" alt="AbaPay" className="w-12 h-8 rounded" />
              <img
                src="applepay.png"
                alt="applepay"
                className="w-12 h-8 object-contain bg-white rounded p-1"
              />
              <img
                src="cryptomus.png"
                alt="cryptomus"
                className="w-12 h-8 object-contain bg-white rounded"
              />
              <img
                src="alipay-logo.png"
                alt="Alipay"
                className="w-12 h-8 object-contain bg-white rounded"
              />
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="relative z-10 w-full px-4 lg:px-0">
          <div className="border-t border-white/30 my-8"></div>
        </div>

        {/* Centered Achievements Section */}
        <div className="relative z-10 w-full text-center mt-4">
          <h3 className="text-xl font-bold mb-8">Our Partnership</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {/* Ministry Achievement */}
            <div className="flex flex-col items-center group">
              <div className="relative w-40 h-28 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/90 rounded-xl group-hover:bg-white/20 transition-all duration-300"></div>
                <img
                  src="ministry.png"
                  alt="Ministry of Tourism"
                  className="h-28 lg:h-28 object-contain relative z-10"
                />
              </div>
              <p className="mt-4 text-sm lg:text-base font-medium">
                Ministry of Tourism
              </p>
            </div>

            {/* Environment Achievement */}
            <div className="flex flex-col items-center group">
              <div className="relative w-40 h-28 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/90 rounded-xl group-hover:bg-white/20 transition-all duration-300"></div>
                <img
                  src="Envi.png"
                  alt="Environment Achievement"
                  className="h-28 lg:h-20 object-contain p-2 relative z-10"
                />
              </div>
              <p className="mt-4 text-sm lg:text-base font-medium">
                Environment Conservation
              </p>
            </div>

            {/* Cambodia Achievement */}
            <div className="flex flex-col items-center group">
              <div className="relative w-40 h-28 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/90 rounded-xl group-hover:bg-white/20 transition-all duration-300"></div>
                <img
                  src="C:\Users\PC\Desktop\Project major 1\domner-kh24\public\cambodia.png"
                  alt="Cambodia Tourism"
                  className="h-28 lg:h-20 object-contain p-2 relative z-10"
                />
              </div>
              <p className="mt-4 text-sm lg:text-base font-medium">
                Cambodia Tourism
              </p>
            </div>
            <div className="relative z-10 w-full text-center border-t border-white/30 pt-16">
              <div className="flex flex-col items-center space-y-2 text-sm text-white/80">
                <p>
                  Copyright © 2024 Domner Travel Cambodia Pte. Ltd. All rights
                  reserved
                </p>
                <p>Site Operator: Domner Travel Cambodia Pte. Ltd.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
