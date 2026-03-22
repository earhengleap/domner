"use client";

import React from "react";
import { motion } from "framer-motion";

const ExploreHero = () => {
  return (
    <div className="relative h-[400px] lg:h-[500px] w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] hover:scale-110"
        style={{ backgroundImage: "url('/mondolkiri.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* Top Gradient Overlay for Navbar Legibility */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl"
        >
          Explore the Wonders of Cambodia
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto drop-shadow-lg"
        >
          Your Gateway to Adventure and Discovery in the Kingdom of Wonder.
        </motion.p>
      </div>
    </div>
  );
};

export default ExploreHero;
