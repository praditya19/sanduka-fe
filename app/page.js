import React from "react";
import Footer from "./_components/Footer";
import Slider from "./_components/Slider";
import ServicesPage from "./_components/Services";

export default function Home() {
  return (
    <div>
      <Slider />
      <ServicesPage />
      <Footer />
    </div>
  );
}
