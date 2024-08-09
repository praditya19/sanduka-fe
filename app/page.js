import React from "react";
import Slider from "./_components/Slider";
import LayananKami from "./_components/LayananKami";
import Flowchart from "./_components/Flowchart";
import GaleriKegiatan from "./_components/GaleriKegiatan";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import Tentang from "./_components/Tentang";

export default function Home() {
  return (
    <div>
      <Header />
      <Slider />
      <Tentang />
      <LayananKami />
      <GaleriKegiatan />
      <Flowchart />
      <Footer />
    </div>
  );
}
