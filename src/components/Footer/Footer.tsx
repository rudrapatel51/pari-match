import React from 'react';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone } from 'react-icons/fi';

const Footer: React.FC = () => {
  const footerLinks = {
    information: [
      'iOS Mobile App',
      'Android App',
      'Mobile version',
      'Licence App',
      'About us',
      'Terms and Conditions',
      'Affiliate Program',
      'Cookie Policy',
      'Contacts',
    ],
    betting: ['In-Line', 'Multi-Live', 'Live', 'Toto'],
    games: ['Casino', 'T&Games', 'Live Games'],
    statistics: ['Statistics', 'Results'],
    useful: ['Payment methods', 'Mobile version', 'Registration'],
    apps: ['iOS', 'Android', '1xbet apk', 'Windows'],
  };

  return (
    <footer className="bg-brand-primary text-neutral-gray-800 w-full py-6 px-3 sm:px-4 lg:px-6 border-t border-stroke-light">
      <div className="w-full max-w-[1920px] mx-auto">
        {/* Popular Events */}
        <div className="bg-brand-primary py-2.5 border-b border-white/10 rounded-xl">
          <div className="w-full px-2 sm:px-4">
            <button className="w-full flex items-center justify-between text-left font-bold text-sm sm:text-base uppercase tracking-wide text-white py-1">
              <span className="truncate">POPULAR EVENTS AND SPORTS NEWS</span>
              <span className="text-lg shrink-0">+</span>
            </button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="w-full py-4 sm:py-6">
          {/* Footer Links Grid — 2 cols mobile, 3 tablet, 6 desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-8 sm:mb-10 border border-stroke-light p-3 sm:p-4 rounded-xl">
            {/* Information */}
            <div>
              {/* text-neutral-gray-800 → #212529 (light) / #e2e8f0 (dark) — always readable */}
              <h3 className="font-bold text-lg mb-3 text-neutral-gray-800 uppercase tracking-wide">INFORMATION</h3>
              <ul className="space-y-1.5">
                {footerLinks.information.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-md text-neutral-gray-600 hover:text-brand-text transition-colors block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Betting */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-neutral-gray-800 uppercase tracking-wide">BETTING</h3>
              <ul className="space-y-1.5">
                {footerLinks.betting.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-md text-neutral-gray-600 hover:text-brand-text transition-colors block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Games */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-neutral-gray-800 uppercase tracking-wide">GAMES</h3>
              <ul className="space-y-1.5">
                {footerLinks.games.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-md text-neutral-gray-600 hover:text-brand-text transition-colors block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-neutral-gray-800 uppercase tracking-wide">STATISTICS</h3>
              <ul className="space-y-1.5">
                {footerLinks.statistics.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-md text-neutral-gray-600 hover:text-brand-text transition-colors block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Useful Links */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-neutral-gray-800 uppercase tracking-wide">USEFUL LINKS</h3>
              <ul className="space-y-1.5">
                {footerLinks.useful.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-md text-neutral-gray-600 hover:text-brand-text transition-colors block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Apps */}
            <div>
              <h3 className="font-bold text-lg mb-3 text-neutral-gray-800 uppercase tracking-wide">APPS</h3>
              <ul className="space-y-1.5">
                {footerLinks.apps.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-md text-neutral-gray-600 hover:text-brand-text transition-colors block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Customer Support & Social */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div>
              <h3 className="font-bold text-lg mb-3 text-neutral-gray-800 uppercase tracking-wide">CUSTOMER SUPPORT</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FiPhone className="w-4 h-4 text-brand-text flex-shrink-0" />
                  <span className="text-sm text-neutral-gray-600">000800820051</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone className="w-4 h-4 text-brand-text flex-shrink-0" />
                  <span className="text-sm text-neutral-gray-600">0008000503276</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone className="w-4 h-4 text-brand-text flex-shrink-0" />
                  <span className="text-sm text-neutral-gray-600">+44 127 325-69-87</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-neutral-gray-800 uppercase tracking-wide">FOLLOW US</h3>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="bg-brand-primary p-2.5 rounded-full hover:bg-brand-primary-dark transition-colors" aria-label="Facebook">
                  <FiFacebook className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="bg-brand-primary p-2.5 rounded-full hover:bg-brand-primary-dark transition-colors" aria-label="Twitter">
                  <FiTwitter className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="bg-brand-primary p-2.5 rounded-full hover:bg-brand-primary-dark transition-colors" aria-label="Instagram">
                  <FiInstagram className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="bg-brand-primary p-2.5 rounded-full hover:bg-brand-primary-dark transition-colors" aria-label="YouTube">
                  <FiYoutube className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="bg-brand-primary p-2.5 rounded-full hover:bg-brand-primary-dark transition-colors" aria-label="Email">
                  <FiMail className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Payment Methods — wrap on small, flex center */}
          <div className="mb-6 sm:mb-8">
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-neutral-gray-800 uppercase tracking-wide text-center md:text-left">
              PAYMENT METHODS
            </h3>

            <div className="flex justify-center items-center flex-wrap gap-3 sm:gap-4 md:gap-6">
              <div className="p-2 rounded-lg hover:bg-brand-primary/10 transition-colors shadow-sm">
                <img src="/googlepay.svg" alt="Google Pay" className="h-10 w-auto object-contain" />
              </div>
              <div className="p-2 rounded-lg hover:bg-brand-primary/10 transition-colors shadow-sm">
                <img src="/phonepe.svg" alt="PhonePe" className="h-10 w-auto object-contain" />
              </div>
              <div className="p-2 rounded-lg hover:bg-brand-primary/10 transition-colors shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-10 w-auto object-contain" />
              </div>
              <div className="p-2 rounded-lg hover:bg-brand-primary/10 transition-colors shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-10 w-auto object-contain" />
              </div>
              <div className="p-2 rounded-lg hover:bg-brand-primary/10 transition-colors shadow-sm">
                <img src="https://img.icons8.com/color/96/000000/bank-building.png" alt="NetBanking" className="h-10 w-auto object-contain" />
              </div>
              <div className="p-2 rounded-lg hover:bg-brand-primary/10 transition-colors shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="Bitcoin" className="h-10 w-auto object-contain" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
