
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-6 px-4 mt-auto border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-500">
            © {currentYear} Insights & Workflows. All rights reserved.
          </p>
        </div>
        
        <div className="flex space-x-6">
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            Terms of Service
          </a>
          <a 
            href="#" 
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
