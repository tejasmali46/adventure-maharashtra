import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Ticket, ArrowLeft, Plus, Edit3, Trash2, CheckCircle2, 
  AlertCircle, Zap, Users, Sparkles, X, ShieldCheck
} from 'lucide-react';
import { getAdminParkById, getPackagesByPark, createPackage, updatePackage, deletePackage } from '../../services/api';

export default function PackageManagement() {
  const { id: parkId } = useParams();
  const [park, setPark] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [saving, setSaving] = useState(false);

  // Package Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceRupees: 999,
    includesExpress: false,
    visitorCategories: [
      { type: 'Adult (Above 4.5ft)', priceRupees: 999 },
      { type: 'Child (3.3ft - 4.5ft)', priceRupees: 799 }
    ],
    featuresText: 'Full day access to attractions\nFree locker rental\nLive stage shows',
    maxDailyPasses: 500,
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [parkRes, pkgRes] = await Promise.all([
        getAdminParkById(parkId),
        getPackagesByPark(parkId)
      ]);
      if (parkRes.success) setPark(parkRes.data);
      if (pkgRes.success) setPackages(pkgRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load passes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [parkId]);

  const openCreateModal = () => {
    setEditingPkg(null);
    setFormData({
      name: '',
      description: '',
      priceRupees: 999,
      includesExpress: false,
      visitorCategories: [
        { type: 'Adult (Above 4.5ft)', priceRupees: 999 },
        { type: 'Child (3.3ft - 4.5ft)', priceRupees: 799 }
      ],
      featuresText: 'Full day unlimited access\nComplimentary safety gear\nFood court dining discount',
      maxDailyPasses: 500,
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      priceRupees: Math.round(pkg.pricePaise / 100),
      includesExpress: Boolean(pkg.includesExpress),
      visitorCategories: pkg.visitorCategories?.map((vc) => ({
        type: vc.type,
        priceRupees: Math.round(vc.pricePaise / 100)
      })) || [{ type: 'Standard Entry', priceRupees: Math.round(pkg.pricePaise / 100) }],
      featuresText: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
      maxDailyPasses: pkg.availabilityRules?.maxDailyPasses || 500,
      status: pkg.status || 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleCategoryChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.visitorCategories];
      updated[index][field] = field === 'priceRupees' ? Number(value) : value;
      return { ...prev, visitorCategories: updated };
    });
  };

  const addCategoryRow = () => {
    setFormData((prev) => ({
      ...prev,
      visitorCategories: [
        ...prev.visitorCategories,
        { type: 'Senior Citizen (60+)', priceRupees: Math.round(prev.priceRupees * 0.8) }
      ]
    }));
  };

  const removeCategoryRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      visitorCategories: prev.visitorCategories.filter((_, i) => i !== index)
    }));
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionSuccess(null);

    try {
      const pricePaise = Math.round(Number(formData.priceRupees) * 100);
      const payload = {
        park: parkId,
        name: formData.name,
        description: formData.description,
        pricePaise,
        includesExpress: formData.includesExpress,
        visitorCategories: formData.visitorCategories.map((vc) => ({
          type: vc.type,
          pricePaise: Math.round(Number(vc.priceRupees) * 100)
        })),
        features: formData.featuresText.split('\n').map((s) => s.trim()).filter(Boolean),
        availabilityRules: { maxDailyPasses: Number(formData.maxDailyPasses) || 500 },
        status: formData.status
      };

      if (editingPkg) {
        await updatePackage(editingPkg._id, payload);
        setActionSuccess(`Package '${formData.name}' updated successfully!`);
      } else {
        await createPackage(payload);
        setActionSuccess(`Package '${formData.name}' created successfully!`);
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (pkgId, pkgName) => {
    if (!window.confirm(`Deactivate package '${pkgName}'?`)) return;
    try {
      await deletePackage(pkgId);
      setActionSuccess(`Package '${pkgName}' deactivated.`);
      fetchData();
    } catch (err) {
      alert(`Failed to deactivate: ${err.message}`);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center">
        <div className="w-10 h-10 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-content-secondary">Loading park passes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <Link
            to="/partner/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Partner Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white">Entry Passes & Packages</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
              {packages.length} Pass Tier(s)
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-1">
            Managing passes for <strong className="text-white">{park?.name}</strong> ({park?.city}, {park?.state})
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Pass</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-border-subtle p-12 text-center mt-8">
          <Ticket className="w-12 h-12 text-content-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Pass Packages Configured</h3>
          <p className="text-xs text-content-secondary mt-1 max-w-sm mx-auto">
            Visitors cannot book tickets until at least one pass package (such as General Entry or VIP Express) is created.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Pass</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {packages.map((pkg) => {
            const baseRupees = Math.round(pkg.pricePaise / 100);
            const isActive = pkg.status === 'ACTIVE';

            return (
              <div
                key={pkg._id}
                className={`glass-panel rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive ? 'border-border-subtle hover:border-purple-500/40' : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>

                    {pkg.includesExpress && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-brand-amber/20 text-brand-amber">
                        <Zap className="w-3 h-3" /> Skip The Line
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">{pkg.name}</h3>
                  <p className="text-xs text-content-secondary mt-1 line-clamp-2">{pkg.description}</p>

                  <div className="mt-4 pt-3 border-t border-border-subtle">
                    <span className="block text-[10px] uppercase font-semibold text-content-muted">Base Price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-white">₹{baseRupees.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-content-muted">({pkg.pricePaise} paise)</span>
                    </div>
                  </div>

                  {/* Visitor Category Breakdown */}
                  {pkg.visitorCategories && pkg.visitorCategories.length > 0 && (
                    <div className="mt-4 space-y-1 bg-white/5 p-3 rounded-xl border border-border-subtle">
                      <span className="block text-[10px] uppercase font-bold text-content-muted mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3 text-purple-400" /> Category Breakdown
                      </span>
                      {pkg.visitorCategories.map((vc, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-content-secondary">{vc.type}:</span>
                          <span className="font-semibold text-white">
                            ₹{Math.round(vc.pricePaise / 100).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Features List */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="mt-4 space-y-1">
                      <span className="block text-[10px] uppercase font-bold text-content-muted mb-1">
                        What's Included:
                      </span>
                      {pkg.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-content-secondary">
                          <Sparkles className="w-3 h-3 text-brand-cyan flex-shrink-0" />
                          <span className="line-clamp-1">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-border-subtle mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-content-muted">
                    Cap: {pkg.availabilityRules?.maxDailyPasses || 500}/day
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-border-subtle transition-colors"
                      title="Edit Pass"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {isActive && (
                      <button
                        onClick={() => handleDeactivate(pkg._id, pkg.name)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Deactivate Pass"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT PASS MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl rounded-2xl border border-border-subtle p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                <span>{editingPkg ? 'Edit Pass Package' : 'Create New Pass Package'}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-content-secondary hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Pass Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Regular Theme Park Pass, VIP Fast-Track Pass"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Unlimited access to regular rides and themed entertainment..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Base Pass Price (₹ in Rupees) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.priceRupees}
                    onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                  <span className="text-[10px] text-content-muted mt-1 block">
                    Saved in DB as {Math.round(Number(formData.priceRupees || 0) * 100)} integer paise
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    Daily Booking Quota
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxDailyPasses}
                    onChange={(e) => setFormData({ ...formData, maxDailyPasses: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="includesExpress"
                  checked={formData.includesExpress}
                  onChange={(e) => setFormData({ ...formData, includesExpress: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-500 bg-white/10"
                />
                <label htmlFor="includesExpress" className="text-xs font-semibold text-white cursor-pointer">
                  Includes Express Fast-Track (Skip the line access)
                </label>
              </div>

              {/* Visitor Category Breakdown */}
              <div className="pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-content-secondary">
                    Category Pricing Tiers:
                  </label>
                  <button
                    type="button"
                    onClick={addCategoryRow}
                    className="text-[11px] font-bold text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Category
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.visitorCategories.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Category (e.g. Adult, Child)"
                        value={cat.type}
                        onChange={(e) => handleCategoryChange(idx, 'type', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-content-muted">₹</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={cat.priceRupees}
                          onChange={(e) => handleCategoryChange(idx, 'priceRupees', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      {formData.visitorCategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCategoryRow(idx)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Features List */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Features Included (One feature per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="All regular rides&#10;Complimentary wave pool entry&#10;10% food voucher"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-border-subtle text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  Pass Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#080F1D] border border-border-subtle text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="ACTIVE">ACTIVE (Available for booking)</option>
                  <option value="INACTIVE">INACTIVE (Hidden)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-content-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 transition-colors shadow-md shadow-purple-500/20"
                >
                  {saving ? 'Saving Pass...' : (editingPkg ? 'Update Pass' : 'Create Pass')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}