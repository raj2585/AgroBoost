import React from "react";
import Howitworks from "../components/howitworks";
import Hero from "../components/hero";
import Features from "../components/features";
import Testimonials from "../components/testimonial";
import Footer from "../components/footer";
const Home = () => {

  return (
    <div className="font-sans overflow-x-hidden">
      {/* Hero Section */}
      <Hero/>

      {/* Features Section */}
      <Features/>

      {/* How It Works Section */}
      <Howitworks/>
      {/* Testimonials Section */}
      <Testimonials/> 
      {/* Footer */}
      <Footer/>
    </div>
  );
};

export default Home;
