import { MailIcon, MapPinnedIcon, PhoneCall } from "lucide-react";
import React from "react";

const DomnerAbout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Full-screen Header Section */}
      <div
        className="relative h-screen w-full bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url("destinations-4.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <h1 className="text-6xl font-bold text-white relative z-10">
          About BorPort
        </h1>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce">
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-grow">
        {/* Goals Section */}
        <div className="text-justify py-28 px-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Our Goals:</h2>
          <p className="text-lg text-gray-700">
            Domner is dedicated to revitalizing Cambodia's tourism by
            spotlighting its hidden gems—minor tourist attractions often
            overlooked by mainstream travelers. Our mission is to make these
            unique destinations more popular, drawing visitors to connect with
            local communities and experience the rich culture of each region.
            Through our platform, we aim to foster meaningful connections
            between travelers and villagers, promoting cultural exchange and
            sustainable tourism that benefits both visitors and locals alike.
          </p>
        </div>

        {/* Members Section */}
        <div className="text-center py-16 bg-gray-100">
          <h2 className="text-2xl font-semibold mb-12">Our Members:</h2>
          <div className="flex flex-wrap justify-center gap-16 px-6">
            <div className="w-full md:w-64 text-center">
              <img
                src="pitou.jpg"
                alt="Mr. Pitou"
                className="w-28 h-28 mx-auto mb-4 rounded-full object-cover"
              />
              <p className="font-semibold">Mr. Pitou</p>
              <p className="text-gray-600">Chief Executive Officer</p>
            </div>
            <div className="w-full md:w-64 text-center">
              <img
                src="monireach.jpg"
                alt="Mr. Monireach"
                className="w-28 h-28 mx-auto mb-4 rounded-full object-cover"
              />
              <p className="font-semibold">Mr. Monireach</p>
              <p className="text-gray-600">Human Resource Manager</p>
            </div>
            <div className="w-full md:w-64 text-center">
              <img
                src="senghong.jpg"
                alt="Mr. Por Senghong"
                className="w-28 h-28 mx-auto mb-4 rounded-full object-cover"
              />
              <p className="font-semibold">Mr. Por senghong</p>
              <p className="text-gray-600">Chief Executive Officer</p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="flex flex-col lg:flex-row justify-center items-center py-16 px-6 bg-white">
          {/* Left section for the map */}
          <div className="w-full lg:w-2/5 mb-8 lg:mb-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2781.595515047346!2d104.90020959892567!3d11.628532670884995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310953c2bec5b6f7%3A0xc3afca2e4e44f1e6!2sKilo%206!5e0!3m2!1sen!2skh!4v1730194882584!5m2!1sen!2skh"
              width="600"
              height="450"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          {/* Right section for the contact info */}
          <div className="w-full lg:w-1/2 lg:pl-16 text-center lg:text-left">
            <h2 className="text-2xl font-semibold mb-8">Where to find us?</h2>
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                <span className="inline-flex items-center">
                  <MapPinnedIcon className="mr-4" />
                  79 Kampuchea Krom Blvd (128), Phnom Penh 12251
                </span>
              </p>
              <p className="text-lg text-gray-700">
                <span className="inline-flex items-center">
                  <MailIcon className="mr-4" />
                  <a
                    href="mailto:domnerkh@gmail.com"
                    className="text-green-500 hover:text-green-600 transition-colors"
                  >
                    domner168@gmail.com
                  </a>
                </span>
              </p>
              <p className="text-lg text-gray-700">
                <span className="inline-flex items-center">
                  <PhoneCall className="mr-4" />
                  +855 10 878 487
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomnerAbout;
