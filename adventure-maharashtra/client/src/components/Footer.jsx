import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Mail, Phone, MapPin, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080F1D] border-t border-border-subtle pt-16 pb-12 text-content-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border-subtle">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#080F1D] rounded-[10px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-brand-cyan" />
                </div>
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                ADVENTURE <span className="text-brand-cyan">MAHARASHTRA</span>
              </span>
            </div>
            <p className="text-sm text-content-secondary leading-relaxed max-w-sm">
              Maharashtra’s centralized discovery, comparison, and booking platform for amusement parks, water worlds, thrill coasters, and outdoor adventures.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 w-fit px-3 py-1.5 rounded-lg font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Safety Standard Partner</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/parks" className="hover:text-brand-cyan transition-colors">All Parks & Resorts</Link></li>
              <li><Link to="/activities" className="hover:text-brand-cyan transition-colors">Outdoor Activities</Link></li>
              <li><Link to="/destinations" className="hover:text-brand-cyan transition-colors">Popular Destinations</Link></li>
              <li><Link to="/offers" className="hover:text-brand-cyan transition-colors">Promotions & Deals</Link></li>
            </ul>
          </div>

          {/* Destinations */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Top Hubs</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/destinations/lonavala" className="hover:text-brand-cyan transition-colors">Lonavala & Khandala</Link></li>
              <li><Link to="/destinations/pune" className="hover:text-brand-cyan transition-colors">Pune & Mulshi</Link></li>
              <li><Link to="/destinations/mumbai" className="hover:text-brand-cyan transition-colors">Mumbai & Thane</Link></li>
              <li><Link to="/destinations/nashik" className="hover:text-brand-cyan transition-colors">Nashik Wine Country</Link></li>
              <li><Link to="/destinations/kolhapur" className="hover:text-brand-cyan transition-colors">Kolhapur & Panhala</Link></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Support & Trust</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-brand-cyan transition-colors">About Us</Link></li>
              <li><Link to="/safety" className="hover:text-brand-cyan transition-colors">Safety Guidelines</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-brand-cyan transition-colors">Cancellation Policy</Link></li>
              <li><Link to="/contact" className="hover:text-brand-cyan transition-colors">Help & Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted gap-4">
          <p>© {new Date().getFullYear()} Adventure Maharashtra. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-brand-amber fill-brand-amber" /> for explorers across Maharashtra, India.
          </p>
        </div>
      </div>
    </footer>
  );
}
