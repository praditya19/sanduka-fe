"use client";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { FaXTwitter, FaThreads, FaTiktok } from "react-icons/fa6";
import { motion } from "framer-motion";

const SocialMediaSection = () => {
  const socials = [
    {
      icon: <Instagram size={22} />,
      bg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
      link: "#",
      label: "Instagram"
    },
    {
      icon: <Facebook size={22} />,
      bg: "bg-gradient-to-br from-blue-600 to-blue-800",
      link: "#",
      label: "Facebook"
    },
   
    {
      icon: <Youtube size={22} />,
      bg: "bg-gradient-to-br from-red-600 to-red-700",
      link: "#",
      label: "Youtube"
    },
    {
      icon: <FaTiktok size={20} />,
      bg: "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
      link: "#",
      label: "TikTok"
    },
    
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="w-full py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
            #PGRIJepara
          </span>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Official Media Sosial
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PGRI Jepara
            </span>
          </h2>
          
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            Ikuti kami di berbagai platform media sosial untuk mendapatkan informasi terbaru dan update kegiatan PGRI Jepara
          </p>
        </motion.div>

        <motion.div 
          className="flex justify-center items-center gap-6 flex-wrap"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {socials.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <a
                href={item.link}
                className={`w-16 h-16 flex items-center justify-center rounded-full text-white ${item.bg} shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
                aria-label={item.label}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                
                {/* Pulse ring */}
                <div className={`absolute inset-0 rounded-full ${item.bg} opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-500`}></div>
                
                {/* Icon */}
                <span className="relative z-10 group-hover:rotate-12 transition-transform duration-300">
                  {item.icon}
                </span>
              </a>
              
              {/* Tooltip */}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

       
      </div>
    </div>
  );
};

export default SocialMediaSection;