import React from 'react'

export default function Testimonial() {
  return (
    <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-green-800">What Farmers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <p className="text-gray-700 mb-4">"AgroBoost's AI recommendations increased my wheat yield by 35% this season. The tailored advice on irrigation timing and fertilizer application perfectly matched my soil conditions, making all the difference."</p>
              <p className="font-bold text-green-700">Ramesh Kumar</p>
              <p className="text-sm text-gray-500">Sikar, Rajasthan</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <p className="text-gray-700 mb-4">"I've finally stopped selling to middlemen thanks to AgroBoost's market connections. Now I get fair prices for my vegetables and my income has grown by 40% in just six months. My family's financial worries are finally easing."</p>
              <p className="font-bold text-green-700">Lakshmi Devi</p>
              <p className="text-sm text-gray-500">Nashik, Maharashtra</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <p className="text-gray-700 mb-4">"The 5-day weather forecasts from AgroBoost saved my entire rice crop last monsoon. I received an alert about unexpected heavy rains and managed to arrange for proper drainage just in time, preventing what would have been a devastating flood."</p>
              <p className="font-bold text-green-700">Vijay Prakash</p>
              <p className="text-sm text-gray-500">West Godavari, Andhra Pradesh</p>
            </div>
          </div>
        </div>
      </section>
  )
}
