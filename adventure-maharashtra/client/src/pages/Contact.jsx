import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider flex items-center justify-center gap-1.5">
          <MessageSquare className="w-4 h-4" />
          <span>Support & Partnerships</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Get In Touch
        </h1>
        <p className="text-sm sm:text-base text-content-secondary max-w-xl mx-auto">
          Have questions about a booking, want to partner your park with us, or need technical assistance? Our Mumbai & Pune teams are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Guest Helpline</h4>
            <p className="text-xs text-content-secondary">+91 22 4900 8800</p>
            <p className="text-[11px] text-content-muted">Mon - Sun: 09:00 AM - 08:00 PM</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Email Support</h4>
            <p className="text-xs text-content-secondary">support@adventuremaharashtra.in</p>
            <p className="text-xs text-content-secondary">partners@adventuremaharashtra.in</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border-subtle space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Headquarters</h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Tower 4, World Trade Centre, Cuffe Parade, Mumbai, Maharashtra 400005
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 glass-card p-8 rounded-3xl border border-border-subtle">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">Message Received!</h3>
              <p className="text-sm text-content-secondary max-w-md mx-auto">
                Thank you for reaching out, {formData.name}. Our Maharashtra operations team has logged your query and will respond to {formData.email} within 4 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-2">Send Us a Message</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Patil"
                    className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Ticket Booking Help">Ticket Booking Help</option>
                    <option value="Park Partner Onboarding">Park Partner Onboarding</option>
                    <option value="Corporate / Group Booking">Corporate / Group Booking</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message or inquiry here..."
                  className="w-full bg-[#080F1D] text-white border border-border-subtle rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-cyan resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
