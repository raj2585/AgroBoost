import React from 'react'
import { motion } from "framer-motion";
const Features = () => {
  return (
    <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-green-800">Features</h2>
          <div className="flex flex-col space-y-6">
            <FeatureCard
              title="AI-Powered Crop Suggestions"
              description="Get real-time recommendations on the best crops to grow based on your soil type, weather, and market trends."
              icon="🌱"
            />
            <FeatureCard
              title="Live Weather Updates & Alerts"
              description="Stay informed with accurate weather forecasts, rainfall predictions, and instant alerts to protect your crops."
              icon="☁️"
            />
            <FeatureCard
              title="Market Prices & Trends"
              description="Access live updates on crop prices across various markets to make informed selling decisions."
              icon="📈"
            />
            <FeatureCard
              title="Farmer Community Forum"
              description="Connect with fellow farmers and agricultural experts to share experiences, ask questions, and get valuable insights."
              icon="👥"
            />
          </div>
        </div>
      </section>
  )
};

const FeatureCard = ({ title, description, icon }) => (
    <motion.div 
      whileHover={{ scale: 1.02 }} 
      className="p-6 bg-green-50 rounded-lg shadow-md flex items-center"
    >
      <div className="text-5xl mr-6 text-green-600 flex-shrink-0">{icon}</div>
      <div className="text-left">
        <h3 className="text-xl font-bold mb-2 text-green-800">{title}</h3>
        <p className="text-green-700">{description}</p>
      </div>
    </motion.div>
  );

  export default Features;