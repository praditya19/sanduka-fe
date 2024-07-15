import React from "react";
import Footer from "./_components/Footer";
import Slider from "./_components/Slider";
import Tentang from "./_components/Tentang";
import Flowchart from "./_components/Flowchart";

export default function Home() {
  return (
    <div>
      <Slider />
      <Tentang />
      <Flowchart />
      <Footer />
    </div>
  );
}
