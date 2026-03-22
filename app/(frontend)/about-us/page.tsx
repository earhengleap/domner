import { MailIcon, MapPinnedIcon, PhoneCall } from "lucide-react";
import React from "react";

const DomnerAbout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="relative h-[400px] lg:h-[500px]">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src="knongpsa.jpg"
          alt="About Domner"
          className="w-full h-full object-cover"
        />
        {/* Top Gradient Overlay for Navbar Legibility */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-10" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4 animate-fade-in">
            About Domner
          </h1>
          <p className="text-xl lg:text-2xl text-center max-w-2xl font-light">
            Your Gateway to Authentic Cambodia
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 -mt-20 relative z-30">
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-[#A18167] mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                Domner is dedicated to revitalizing Cambodia's tourism by
                connecting passionate local guides with curious travelers. We
                believe that the best way to experience a country is through the
                eyes of its people.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                Our mission is to make these unique destinations more popular,
                drawing visitors to connect with local communities and
                experience the rich culture of each region. Through our
                platform, we aim to foster meaningful connections between
                travelers and villagers, promoting cultural exchange and
                sustainable tourism that benefits both visitors and locals
                alike.
              </p>
            </div>
            <div className="hidden lg:block">
              <img
                src="chombork.jpg"
                alt="Our Mission"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="text-center py-16 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-12">Our Members:</h2>
        <div className="flex flex-wrap justify-center gap-16 px-6">
          <div className="w-full md:w-64 text-center">
            <img
              src="kimly.jpg"
              alt="Mr. Hor kimly"
              className="w-28 h-28 mx-auto mb-4 rounded-full object-cover"
            />
            <p className="font-semibold">Mr. Hor kimly</p>
            <p className="text-gray-600">Chief Executive Officer</p>
          </div>
          <div className="w-full md:w-64 text-center">
            <img
              src="cheabunthay.jpg"
              alt="Mr. Chea bunthay"
              className="w-28 h-28 mx-auto mb-4 rounded-full object-cover"
            />
            <p className="font-semibold">Mr. Chea bunthay</p>
            <p className="text-gray-600">Human Resource Manager</p>
          </div>
          <div className="w-full md:w-64 text-center">
            <img
              src="kps.jpg"
              alt="Mr. Khiev Piseth"
              className="w-28 h-28 mx-auto mb-4 rounded-full object-cover"
            />
            <p className="font-semibold">Mr. Khiev Piseth</p>
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
                  className="text-[#A18167] hover:text-[#292929] transition-colors"
                >
                  domnerkh@gmail.com
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
  );
};

export default DomnerAbout;
