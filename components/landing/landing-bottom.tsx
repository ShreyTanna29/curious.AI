"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaXTwitter,
  FaLinkedin,
  FaInstagram,
  FaGithub,
} from "react-icons/fa6";
import { Sparkles } from "lucide-react";

const LandingFooter: React.FC = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="w-full bg-white dark:bg-black relative overflow-hidden pt-16 pb-8">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={fadeInUp}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Curious.AI Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl text-black/90 dark:text-white/90">
                Curious.AI
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Unleash your creativity with our AI-powered platform. We&apos;re
              here to empower your imagination and help you build amazing
              things.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary/20 hover:text-primary transition-all duration-300"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary/20 hover:text-primary transition-all duration-300"
              >
                <FaXTwitter size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary/20 hover:text-primary transition-all duration-300"
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary/20 hover:text-primary transition-all duration-300"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://github.com/ShreyTanna29/curious.AI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary/20 hover:text-primary transition-all duration-300"
              >
                <FaGithub size={18} />
              </a>
            </div>
          </motion.div>

          {/* Services column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            variants={fadeInUp}
            className="space-y-6"
          >
            <h3 className="font-semibold text-lg text-black/90 dark:text-white/90 flex items-center">
              <span>Services</span>
              <div className="h-px flex-grow bg-gradient-to-r from-primary/20 to-transparent ml-3"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/chat"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-primary mr-2 transition-colors duration-300"></span>
                  Chat With AI
                </Link>
              </li>
              <li>
                <Link
                  href="/image"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-primary mr-2 transition-colors duration-300"></span>
                  Generate Images
                </Link>
              </li>
              <li>
                <Link
                  href="/code"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-primary mr-2 transition-colors duration-300"></span>
                  Code Generation
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-primary mr-2 transition-colors duration-300"></span>
                  Marketplace
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Company column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            variants={fadeInUp}
            className="space-y-6"
          >
            <h3 className="font-semibold text-lg text-black/90 dark:text-white/90 flex items-center">
              <span>Company</span>
              <div className="h-px flex-grow bg-gradient-to-r from-primary/20 to-transparent ml-3"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-primary mr-2 transition-colors duration-300"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-primary mr-2 transition-colors duration-300"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-primary mr-2 transition-colors duration-300"></span>
                  Join Community
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-primary mr-2 transition-colors duration-300"></span>
                  Blog Place
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            variants={fadeInUp}
            className="space-y-6"
          >
            <h3 className="font-semibold text-lg text-black/90 dark:text-white/90 flex items-center">
              <span>Stay Updated</span>
              <div className="h-px flex-grow bg-gradient-to-r from-primary/20 to-transparent ml-3"></div>
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Subscribe to our newsletter for the latest updates and AI
              innovations.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-grow px-4 py-2 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-l-md text-black dark:text-white outline-none"
              />
              <button className="bg-primary hover:bg-primary/90 text-white dark:text-black px-4 py-2 rounded-r-md transition-colors duration-300 flex items-center">
                <Sparkles size={16} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Curious.AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy-policy"
                className="text-gray-500 dark:text-gray-400 text-sm hover:text-primary dark:hover:text-primary transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-500 dark:text-gray-400 text-sm hover:text-primary dark:hover:text-primary transition-colors duration-300"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/cookies"
                className="text-gray-500 dark:text-gray-400 text-sm hover:text-primary dark:hover:text-primary transition-colors duration-300"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
