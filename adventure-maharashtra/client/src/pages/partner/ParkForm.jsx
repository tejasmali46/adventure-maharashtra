import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Building2, ArrowLeft, Save, MapPin, Image as ImageIcon, 
  Clock, Shield, Phone, Sparkles, CheckCircle2, AlertCircle, Plus, Trash2
} from 'lucide-react';
import { getAdminParkById, createPark, updatePark } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MAHARASHTRA_PRESETS = [
  { name: 'Lonavala (Khandala)', lat: 18.7523, lng: 73.3155, city: 'Lonavala', district: 'Raigad' },
  { name: 'Pune (Sus / Baner)', lat: 18.5529, lng: 73.7483, city: 'Pune', district: 'Pune' },
  { name: 'Thane / Mumbai', lat: 19.2393, lng: 72.9736, city: 'Mumbai', district: 'Thane' },
  { name: 'Nashik (Gangapur)', lat: 19.9882, lng: 73.7058, city: 'Nashik', district: 'Nashik' },
  { name: 'Mahabaleshwar (Alpine)', lat: 17.9237, lng: 73.6586, city: 'Mahabaleshwar', district: 'Satara' },
  { name: 'Kolhapur (Sayaji)', lat: 16.6780, lng: 74.2546, city: 'Kolhapur', district: 'Kolhapur' }
];

const COMMON_FACILITIES = [
  'Secure Electronic Lockers',
  'Multi-Cuisine Food Courts',
  'Ample Vehicle Parking',
  'First Aid & Paramedic Centre',
  'Life Jackets Provided Free',
  'Wheelchair Accessibility',
  'AC Rest & Nursing Areas',
  'Costume & Swimwear Rentals',
  'EV Vehicle Charging Station',
  'Souvenir Gift Shop'
];

export default function ParkForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('basics');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'Theme Park',
    listingType: 'AUTHORIZED_THIRD_PARTY',
    isDirectManaged: false,
    city: 'Lonavala',
    district: 'Pune',
    state: 'Maharashtra',
    address: '',
    latitude: 18.7523,
    longitude: 73.3155,
    heroImage: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    operatingHours: {
      open: '10:00 AM',
      close: '07:00 PM',
      days: 'Monday to Sunday',
      ridesClosing: '06:30 PM'
    },
    facilities: ['Secure Electronic Lockers', 'Multi-Cuisine Food Courts', 'Ample Vehicle Parking'],
    activityNames: 'Rollercoasters, Water Rides & Wave Pools',
    safetyGuidelines: 'Proper athletic footwear required.\nFollow lifeguard instructions at all times.\nChildren under 12 must be accompanied by an adult.',
    cancellationPolicy: 'Free cancellation with full refund up to 48 hours prior to booking date.',
    contact: {
      phone: '+91 22 4000 5000',
      email: 'support@adventurepark.in',
      website: 'https://adventurepark.in'
    },
    approvalStatus: 'PENDING',
    isActive: true,
    isFeatured: false
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchParkDetails = async () => {
        try {
          setLoading(true);
          const res = await getAdminParkById(id);
          if (res.success && res.data) {
            const p = res.data;
            setFormData({
              name: p.name || '',
              tagline: p.tagline || '',
              description: p.description || '',
              category: p.category || 'Theme Park',
              listingType: p.listingType || 'AUTHORIZED_THIRD_PARTY',
              isDirectManaged: Boolean(p.isDirectManaged),
              city: p.city || '',
              district: p.district || '',
              state: p.state || 'Maharashtra',
              address: p.address || '',
              latitude: p.location?.coordinates?.[1] || 18.7523,
              longitude: p.location?.coordinates?.[0] || 73.3155,
              heroImage: p.heroImage || '',
              gallery: Array.isArray(p.gallery) ? p.gallery : [],
              operatingHours: {
                open: p.operatingHours?.open || '10:00 AM',
                close: p.operatingHours?.close || '07:00 PM',
                days: p.operatingHours?.days || 'Monday to Sunday',
                ridesClosing: p.operatingHours?.ridesClosing || '06:30 PM'
              },
              facilities: Array.isArray(p.facilities) ? p.facilities : [],
              activityNames: Array.isArray(p.activityNames) ? p.activityNames.join(', ') : '',
              safetyGuidelines: Array.isArray(p.safetyGuidelines) ? p.safetyGuidelines.join('\n') : '',
              cancellationPolicy: p.cancellationPolicy || '',
              contact: {
                phone: p.contact?.phone || '',
                email: p.contact?.email || '',
                website: p.contact?.website || ''
              },
              approvalStatus: p.approvalStatus || 'PENDING',
              isActive: p.isActive !== undefined ? p.isActive : true,
              isFeatured: Boolean(p.isFeatured)
            });
          }
        } catch (err) {
          setError(err.message || 'Failed to load park details.');
        } finally {
          setLoading(false);
        }
      };
      fetchParkDetails();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists 
          ? prev.facilities.filter((f) => f !== facility) 
          : [...prev.facilities, facility]
      };
    });
  };

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, newGalleryUrl.trim()]
      }));
      setNewGalleryUrl('');
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const applyPresetLocation = (preset) => {
    setFormData((prev) => ({
      ...prev,
      city: preset.city,
      district: preset.district,
      latitude: preset.lat,
      longitude: preset.lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        activityNames: formData.activityNames.split(',').map((s) => s.trim()).filter(Boolean),
        safetyGuidelines: formData.safetyGuidelines.split('\n').map((s) => s.trim()).filter(Boolean)
      };

      if (isEditing) {
        const res = await updatePark(id, payload);
        if (res.success) {
          setSuccessMsg('Park listing updated successfully!');
          setTimeout(() => navigate('/partner/dashboard'), 1500);
        }
      } else {
        const res = await createPark(payload);
        if (res.success) {
          setSuccessMsg(res.message || 'Park listing registered successfully!');
          setTimeout(() => navigate('/partner/dashboard'), 1500);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving the park listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-content-secondary">Loading destination details...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/partner/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">
            {isEditing ? `Edit Park: ${formData.name}` : 'Register New Adventure Destination'}
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Provide comprehensive destination specifications, geographic coordinates, and operational guidelines.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border-subtle mb-6">
        {[
          { key: 'basics', label: '1. Basic Info', icon: Building2 },
          { key: 'location', label: '2. Location & Coordinates', icon: MapPin },
          { key: 'media', label: '3. Media & Description', icon: ImageIcon },
          { key: 'schedule', label: '4. Schedule & Facilities', icon: Clock },
          { key: 'safety', label: '5. Activities & Policies', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 shadow'
                  : 'text-content-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basics' && (
          <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-cyan" />
              <span>Destination Identity & Classification</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Park Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Imagicaa Theme & Water Park"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080F1D] border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                >
                  <option value="Theme Park">Theme Park</option>
                  <option value="Water Park">Water Park</option>
                  <option value="Adventure Park">Adventure Park</option>
                  <option value="Amusement Park">Amusement Park</option>
                  <option value="Snow Park">Snow Park</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Catchy Tagline / Pitch
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g. India's premier international-standard entertainment resort"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Listing Type
                </label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080F1D] border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                >
                  <option value="AUTHORIZED_THIRD_PARTY">Authorized Partner Park</option>
                  <option value="DIRECT_MANAGED">Direct Managed (Official Portal)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isDirectManaged"
                  name="isDirectManaged"
                  checked={formData.isDirectManaged}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-brand-cyan bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isDirectManaged" className="text-xs font-semibold text-white cursor-pointer">
                  Direct Integration (Instant Ticket Generation Enabled)
                </label>
              </div>
            </div>

            {user?.role === 'SUPER_ADMIN' && (
              <div className="pt-4 border-t border-brand-amber/30 space-y-3 bg-brand-amber/5 p-4 rounded-xl">
                <span className="text-[11px] font-bold text-brand-amber uppercase tracking-wider block">
                  Super Administrator Direct Overrides
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-content-secondary mb-1">Approval Status</label>
                    <select
                      name="approvalStatus"
                      value={formData.approvalStatus}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#080F1D] border border-brand-amber/40 text-xs text-white"
                    >
                      <option value="APPROVED">APPROVED (Live)</option>
                      <option value="PENDING">PENDING (Review)</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-brand-cyan bg-white/10"
                    />
                    <label htmlFor="isActive" className="text-xs text-white">Active Listing</label>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-brand-cyan bg-white/10"
                    />
                    <label htmlFor="isFeatured" className="text-xs text-white">Homepage Featured</label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOCATION & COORDINATES */}
        {activeTab === 'location' && (
          <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-cyan" />
                <span>Geographic & Navigation Details</span>
              </h2>
            </div>

            <div>
              <span className="block text-xs font-semibold text-content-secondary mb-2">
                Quick Regional Pin Presets (Maharashtra Hubs):
              </span>
              <div className="flex flex-wrap gap-2">
                {MAHARASHTRA_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPresetLocation(preset)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-brand-cyan border border-brand-cyan/20 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  City <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Lonavala"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Pune"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  disabled
                  value={formData.state}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-content-muted"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Physical Street Address <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="address"
                required
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address, landmarks, postal code..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Latitude (Decimal Degrees) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  required
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 18.7523"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white font-mono placeholder-content-muted focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Longitude (Decimal Degrees) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  required
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 73.3155"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white font-mono placeholder-content-muted focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>
          </div>
        )}
        {/* TAB 3: MEDIA & OVERVIEW */}
        {activeTab === 'media' && (
          <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-cyan" />
              <span>Media Showcase & Overview</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Hero Cover Image URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                name="heroImage"
                required
                value={formData.heroImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
              />
              {formData.heroImage && (
                <div className="mt-2.5 h-36 w-full rounded-xl overflow-hidden border border-border-subtle bg-slate-900">
                  <img
                    src={formData.heroImage}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Gallery Image URLs
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  placeholder="Paste additional high-resolution image URL..."
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Image</span>
                </button>
              </div>

              {formData.gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.gallery.map((imgUrl, idx) => (
                    <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-border-subtle group">
                      <img
                        src={imgUrl}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Detailed Destination Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Highlight attractions, themed zones, international rides, food courts, and unique experiences..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
              />
            </div>
          </div>
        )}

        {/* TAB 4: SCHEDULE & FACILITIES */}
        {activeTab === 'schedule' && (
          <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-cyan" />
              <span>Operating Hours & Park Amenities</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Gates Open
                </label>
                <input
                  type="text"
                  value={formData.operatingHours.open}
                  onChange={(e) => handleNestedChange('operatingHours', 'open', e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Park Closes
                </label>
                <input
                  type="text"
                  value={formData.operatingHours.close}
                  onChange={(e) => handleNestedChange('operatingHours', 'close', e.target.value)}
                  placeholder="07:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Rides Close At
                </label>
                <input
                  type="text"
                  value={formData.operatingHours.ridesClosing}
                  onChange={(e) => handleNestedChange('operatingHours', 'ridesClosing', e.target.value)}
                  placeholder="06:30 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Operating Days
                </label>
                <input
                  type="text"
                  value={formData.operatingHours.days}
                  onChange={(e) => handleNestedChange('operatingHours', 'days', e.target.value)}
                  placeholder="Monday to Sunday"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="block text-xs font-semibold text-content-secondary mb-3">
                Key Facilities & Guest Amenities:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COMMON_FACILITIES.map((facility) => {
                  const isChecked = formData.facilities.includes(facility);
                  return (
                    <label
                      key={facility}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked 
                          ? 'bg-brand-cyan/10 border-brand-cyan/30 text-white' 
                          : 'bg-white/5 border-border-subtle text-content-secondary hover:text-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFacilityToggle(facility)}
                        className="w-4 h-4 rounded text-brand-cyan bg-white/10"
                      />
                      <span>{facility}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACTIVITIES, SAFETY & POLICIES */}
        {activeTab === 'safety' && (
          <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-cyan" />
              <span>Activities, Safety Standards & Contact</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Included Activities (comma separated)
              </label>
              <input
                type="text"
                name="activityNames"
                value={formData.activityNames}
                onChange={handleChange}
                placeholder="Rollercoasters, Wave Pools, Go-Karting, High Ziplines..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Safety Guidelines & Dress Code (One guideline per line)
              </label>
              <textarea
                name="safetyGuidelines"
                rows={3}
                value={formData.safetyGuidelines}
                onChange={handleChange}
                placeholder="Proper swimwear required for water rides.&#10;Follow operator instructions.&#10;Children must be supervised."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Cancellation & Rescheduling Policy
              </label>
              <textarea
                name="cancellationPolicy"
                rows={2}
                value={formData.cancellationPolicy}
                onChange={handleChange}
                placeholder="Free cancellation up to 48 hours prior to booking date..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white placeholder-content-muted focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Guest Support Phone
                </label>
                <input
                  type="text"
                  value={formData.contact.phone}
                  onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)}
                  placeholder="+91 22 4000 5000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                  placeholder="contact@park.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  Official Website
                </label>
                <input
                  type="url"
                  value={formData.contact.website}
                  onChange={(e) => handleNestedChange('contact', 'website', e.target.value)}
                  placeholder="https://parkwebsite.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <Link
            to="/partner/dashboard"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-content-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3">
            {activeTab !== 'safety' ? (
              <button
                type="button"
                onClick={() => {
                  const tabs = ['basics', 'location', 'media', 'schedule', 'safety'];
                  const nextIdx = (tabs.indexOf(activeTab) + 1) % tabs.length;
                  setActiveTab(tabs[nextIdx]);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Next Section &rarr;
              </button>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-cyan to-brand-blue text-slate-950 hover:text-white shadow-glow-cyan disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Submit Park Listing')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}