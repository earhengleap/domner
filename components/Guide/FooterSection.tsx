"use client";
import React from "react";
import { FaFacebook } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaSquareXTwitter } from "react-icons/fa6";
import { AiFillTikTok } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { IoLocationSharp } from "react-icons/io5";
import { FaSquarePhone } from "react-icons/fa6";
import Logo from '@/public/DomnerDesktop.png'
import Ministry from '@/public/ministry.png'
import Ngo from '@/public/NGO.png'
import BackgroundImage from '@/public/footer.jpg'

const Footer: React.FC = () => {
  return (
    <div
      className="relative flex flex-col lg:flex-row justify-between items-center p-6 lg:p-12 xl:p-20 bg-cover bg-center text-white h-auto min-h-[200px] lg:h-[400px]"
      style={{
        backgroundImage: `url(${BackgroundImage.src})`,
      }}
    >
      {/* Green Overlay */}
      <div className="absolute inset-0 bg-[#A18167] opacity-50 lg:opacity-80"></div>

      {/* Content */}
      <div className="relative flex flex-col items-center lg:items-start mb-6 lg:mb-0 z-10 text-center lg:text-left text-xl">
        <img
          src={Logo.src}
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
      <div className="relative flex flex-col items-center lg:items-start mb-6 lg:mb-0 z-10 text-center lg:text-left">
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
              domnerkh@gmail.com
            </a>
          </p>
          <p className="flex items-center justify-center lg:justify-start">
            <FaSquarePhone className="mr-2" />
            Phone: +855-99 168 168
          </p>
        </div>
      </div>
      <div className="relative flex flex-col items-center lg:items-start z-10 text-center lg:text-left">
        <h3 className="mb-4 lg:mb-6 text-lg lg:text-xl font-bold">
          Partnership and Collaboration
        </h3>
        <div className="flex flex-wrap justify-center lg:justify-start space-x-4">
          <img
            src={Ministry.src}
            alt="Ministry Logo"
            className="w-24 lg:w-32 mb-2"
          />
          <img src={Ngo.src} alt="NGO Logo" className="w-20 lg:w-28 mb-2" />
        </div>
      </div>
    </div>
  );
};

export default Footer;
