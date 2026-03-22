"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, Map, Palmtree, Utensils, Landmark, Camera } from "lucide-react";

const categories = [
  { id: "nature", name: "Nature", icon: Palmtree, color: "bg-green-500", image: "https://images.unsplash.com/photo-1559592413-7cea732639f5?q=80&w=2100&auto=format&fit=crop" },
  { id: "culture", name: "Culture", icon: Landmark, color: "bg-orange-500", image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2070&auto=format&fit=crop" },
  { id: "adventure", name: "Adventure", icon: Map, color: "bg-blue-500", image: "https://images.unsplash.com/photo-1533719071182-1828d00333a5?q=80&w=2070&auto=format&fit=crop" },
  { id: "food", name: "Food", icon: Utensils, color: "bg-red-500", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" },
  { id: "photography", name: "Photography", icon: Camera, color: "bg-purple-500", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop" },
  { id: "discovery", name: "Discovery", icon: Compass, color: "bg-yellow-500", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop" },
];

const ExploreCategories = () => {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Adventure</h2>
        <p className="text-gray-600">Select a category to find the perfect experience for you.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="relative h-40 rounded-2xl overflow-hidden mb-3">
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/50">
                <category.icon className="w-10 h-10 text-white" />
              </div>
            </div>
            <p className="text-center font-semibold text-gray-800 group-hover:text-primary transition-colors">
              {category.name}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ExploreCategories;
