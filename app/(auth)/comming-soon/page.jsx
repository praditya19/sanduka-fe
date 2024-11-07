"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const ComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date("2024-12-01T00:00:00Z"); 
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-400 to-blue-500 text-white overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="bg-cover bg-center h-full"
          style={{
            backgroundImage: 'url("/path-to-your-background-image.jpg")',
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>
      <div className="relative z-10 text-center p-8 md:p-16 bg-white bg-opacity-20 rounded-lg shadow-xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-pulse">
          Segera hadir!!!
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Kami bekerja keras untuk menghadirkan sesuatu yang luar biasa. Pantau
          terus!
        </p>
        <div className="flex flex-col md:flex-row justify-center mb-8">
          <div className="text-2xl md:text-4xl font-mono mb-4 md:mb-0">
            <span className="block">{timeLeft.days} Days</span>
            <span className="block">{timeLeft.hours} Hours</span>
            <span className="block">{timeLeft.minutes} Minutes</span>
            <span className="block">{timeLeft.seconds} Seconds</span>
          </div>
        </div>
        <div className="mb-8">
          <p className="text-lg mb-4">
            Ingin diberitahu? Berlangganan untuk pembaruan:
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
             
              alert("Subscribed!");
            }}
            className="flex flex-col sm:flex-row items-center justify-center"
          >
            <input
              type="email"
              placeholder="Alamat email Anda"
              required
              className="form-input block w-full sm:w-64 py-2 px-3 mb-2 sm:mb-0 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-800 text-white py-2 px-6 rounded-lg ml-0 sm:ml-4"
            >
              Berlangganan
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
