import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getCinemas, createCinema, updateCinema, deleteCinema } from '../../services/cinemaService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Building2, Plus, Edit, Trash2, X, Check, MapPin } from 'lucide-react';
import { CITIES } from '../../utils/constants';

export default function ManageCinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    city: 'Delhi',
    address: '',
    facilities: 'IMAX, Dolby Atmos, Parking, Food Court',
    status: 'active',
  });

  const fetchCinemasList = async () => {
    try {
      setLoading(true);
      const res = await getCinemas();
      if (res.success && res.data) {
        setCinemas(res.data);
      }
    } catch (err) {
      toast.error('Failed to load cinema locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemasList();
  }, []);

  const handleOpenAdd = () => {
    setEditingCinema(null);
    setForm({
      name: '',
      city: 'Delhi',
      address: '',
      facilities: 'IMAX, Dolby Atmos, Parking, Food Court',
      status: 'active',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cinema) => {
    setEditingCinema(cinema);
    setForm({
      name: cinema.name || '',
      city: cinema.city || 'Delhi',
      address: cinema.address || '',
      facilities: Array.isArray(cinema.facilities)
        ? cinema.facilities.join(', ')
        : cinema.facilities || '',
      status: cinema.status || 'active',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete cinema "${name}"?`)) return;
    try {
      const res = await deleteCinema(id);
      if (res.success) {
        toast.success(`"${name}" deleted successfully`);
        fetchCinemasList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete cinema');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        facilities: form.facilities.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editingCinema) {
        const res = await updateCinema(editingCinema._id, payload);
        if (res.success) {
          toast.success('Cinema updated');
          setModalOpen(false);
          fetchCinemasList();
        }
      } else {
        const res = await createCinema(payload);
        if (res.success) {
          toast.success('Cinema added');
          setModalOpen(false);
          fetchCinemasList();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save cinema');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cinema-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="text-cinema-accent" />
            Manage Cinema Locations
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">
            Configure multiplex venues, metro cities, and auditorium amenities
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2 text-xs !py-2 !px-4 shadow-lg shadow-cinema-accent/20"
        >
          <Plus size={16} />
          <span>Add Cinema Location</span>
        </button>
      </div>

      {/* Cinemas Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading cinemas..." />
        </div>
      ) : (
        <div className="card overflow-hidden shadow-xl border-cinema-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cinema-surface-2 border-b border-cinema-border text-cinema-muted uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Cinema Name</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Facilities</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/50 text-cinema-text">
                {cinemas.map((c) => (
                  <tr key={c._id} className="hover:bg-cinema-surface-2/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white text-sm">{c.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge bg-cinema-accent/10 text-cinema-accent font-semibold">
                        {c.city}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-cinema-muted max-w-xs truncate">
                      {c.address}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.facilities?.map((f) => (
                          <span key={f} className="text-[10px] bg-cinema-surface-2 text-zinc-300 px-1.5 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge text-[10px] ${
                          c.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded hover:bg-cinema-surface text-cinema-muted hover:text-white"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.name)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-cinema-muted hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card max-w-lg w-full p-6 space-y-4 shadow-2xl border-cinema-border">
            <div className="flex items-center justify-between border-b border-cinema-border/60 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-cinema-accent" />
                {editingCinema ? 'Edit Cinema Venue' : 'Register New Cinema'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-cinema-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-cinema-text">Cinema Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. PVR Select City Walk"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">City *</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input-field"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-cinema-text">Full Street Address *</label>
                <textarea
                  required
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Mall, Street, Sector, Pin Code..."
                  className="input-field resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-cinema-text">
                  Facilities (comma separated)
                </label>
                <input
                  type="text"
                  value={form.facilities}
                  onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                  placeholder="4DX, IMAX, Parking, Food Court, Dolby Atmos"
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-cinema-border/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs !py-1.5 !px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs !py-1.5 !px-4 flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{saving ? 'Saving...' : editingCinema ? 'Update Cinema' : 'Save Cinema'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

