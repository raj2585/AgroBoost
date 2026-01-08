import React from 'react'
import { motion } from "framer-motion";
export default function Howitworks() {
  return (
    <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-green-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard
              step="1"
              title="Register & Set Up Your Profile"
              description="Sign up with your Aadhaar ID or phone number to personalize your farming experience."
            />
            <StepCard
              step="2"
              title="Get AI-Driven Insights"
              description="Receive tailored crop recommendations and weather alerts based on your location and soil conditions."
            />
            <StepCard
              step="3"
              title="Monitor Market Trends"
              description="Stay updated with real-time price trends and maximize your earnings."
            />
            <StepCard
              step="4"
              title="Engage with the Community"
              description="Join discussions with other farmers and agricultural experts for tips and best practices."
            />
          </div>
        </div>
      </section>

  )
}

const StepCard = ({ step, title, description }) => (
    <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-green-50 rounded-lg shadow-md">
      <div className="text-4xl font-bold text-green-600 mb-4">{step}</div>
      <h3 className="text-xl font-bold mb-2 text-green-800">{title}</h3>
      <p className="text-green-700">{description}</p>
    </motion.div>
  );