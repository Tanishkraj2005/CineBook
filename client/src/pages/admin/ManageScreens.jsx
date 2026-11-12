import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getScreens, createScreen, deleteScreen } from '../../services/adminService';
import { getCinemas } from '../../services/cinemaService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Tv, Plus, Trash2, X, Check, Building2 } from 'lucide-react';

export default function ManageScreens() {
  const [screens, setScreens] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    cinemaId: '',
    screenName: 'Screen 3',
    rowsCount: 8,
    seatsPerRow: 10,
    status: 'active',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [screensRes, cinemasRes] = await Promise.all([
        getScreens(selectedCinemaId ? { cinemaId: selectedCinemaId } : {}),
        getCinemas(),
      ]);

      if (screensRes.success && screensRes.data) {
        setScreens(screensRes.data);
      }
      if (cinemasRes.success && cinemasRes.data) {
        setCinemas(cinemasRes.data);
        if (!form.cinemaId && cinemasRes.data.length > 0) {
          setForm((f) => ({ ...f, cinemaId: cinemasRes.data[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load screens data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCinemaId]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete screen "${name}"? Existing showtimes will be impacted.`)) return;
    try {
      const res = await deleteScreen(id);
      if (res.success) {
        toast.success('Screen removed');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete screen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const rows = rowLabels.slice(0, Number(form.rowsCount)).map((label, rowIndex) => {
        let category = 'standard';
        let price = 200;
        if (rowIndex === 0) {
          category = 'recliner';
          price = 500;
        } else if (rowIndex <= 2) {
          category = 'premium';
          price = 350;
        }

        return {
          rowLabel: label,
          seats: Array.from({ length: Number(form.seatsPerRow) }, (_, i) => ({
            seatNumber: i + 1,
            category,
            price,
          })),
        };
      });

      const totalSeats = Number(form.rowsCount) * Number(form.seatsPerRow);

      const res = await createScreen({
        cinemaId: form.cinemaId,
        screenName: form.screenName,
        totalSeats,
        rows,
        status: form.status,
      });

      if (res.success) {
        toast.success(`Screen created with ${totalSeats} configured seats!`);
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create screen');
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
            <Tv className="text-cinema-accent" />
            Auditoriums & Screens
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">
            Manage theatre screen halls, seat capacities, and tiered tier pricing
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-xs !py-2 !px-4 shadow-lg shadow-cinema-accent/20"
        >
          <Plus size={16} />
          <span>Add Auditorium Screen</span>
        </button>
      </div>

      {/* Filter by cinema */}
      <div className="flex items-center gap-3 card p-3 bg-cinema-surface/70">
        <Building2 size={16} className="text-cinema-accent ml-1" />
        <span className="text-xs text-cinema-muted font-medium">Filter by Cinema:</span>
        <select
          value={selectedCinemaId}
          onChange={(e) => setSelectedCinemaId(e.target.value)}
          className="bg-cinema-surface-2 border border-cinema-border rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cinema-accent"
        >
          <option value="">All Cinema Venues</option>
          {cinemas.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.city})
            </option>
          ))}
        </select>
      </div>

      {/* Screens Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading auditoriums..." />
        </div>
      ) : (
        <div className="card overflow-hidden shadow-xl border-cinema-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cinema-surface-2 border-b border-cinema-border text-cinema-muted uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Screen Name</th>
                  <th className="py-3 px-4">Cinema Venue</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Row Layout</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/50 text-cinema-text">
                {screens.map((s) => (
                  <tr key={s._id} className="hover:bg-cinema-surface-2/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-white text-sm">
                      {s.screenName}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-200">{s.cinemaId?.name || 'N/A'}</p>
                      <p className="text-[11px] text-cinema-muted">{s.cinemaId?.city}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cinema-accent">
                      {s.totalSeats} seats
                    </td>
                    <td className="py-3 px-4 text-cinema-muted">
                      {s.rows?.length || 0} Rows (
                      {s.rows && s.rows.length > 0
                        ? `${s.rows[0].rowLabel} to ${s.rows[s.rows.length - 1].rowLabel}`
                        : ''}
                      )
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge bg-green-500/10 text-green-400 border border-green-500/30 text-[10px]">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(s._id, s.screenName)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-cinema-muted hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card max-w-lg w-full p-6 space-y-4 shadow-2xl border-cinema-border">
            <div className="flex items-center justify-between border-b border-cinema-border/60 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Tv size={18} className="text-cinema-accent" />
                Configure New Screen
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
                <label className="text-xs font-medium text-cinema-text">Select Cinema *</label>
                <select
                  required
                  value={form.cinemaId}
                  onChange={(e) => setForm({ ...form, cinemaId: e.target.value })}
                  className="input-field"
                >
                  {cinemas.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Screen Identifier *</label>
                  <input
                    type="text"
                    required
                    value={form.screenName}
                    onChange={(e) => setForm({ ...form, screenName: e.target.value })}
                    placeholder="Screen 3 / IMAX"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Under Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Number of Rows</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={form.rowsCount}
                    onChange={(e) => setForm({ ...form, rowsCount: e.target.value })}
                    className="input-field font-mono"
                  />
                  <p className="text-[10px] text-cinema-muted">e.g. 8 generates rows A through H</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-cinema-text">Seats Per Row</label>
                  <input
                    type="number"
                    min="4"
                    max="20"
                    value={form.seatsPerRow}
                    onChange={(e) => setForm({ ...form, seatsPerRow: e.target.value })}
                    className="input-field font-mono"
                  />
                  <p className="text-[10px] text-cinema-muted">Capacity: {form.rowsCount * form.seatsPerRow} seats</p>
                </div>
              </div>

              <div className="bg-cinema-surface-2 p-3 rounded-lg border border-cinema-border text-[11px] text-cinema-muted space-y-1">
                <p className="font-semibold text-white">Automated Tiered Seat Allocation:</p>
                <p>• Row A: Recliner luxury tier (₹500)</p>
                <p>• Rows B & C: Premium tier (₹350)</p>
                <p>• Rows D+: Standard tier (₹200)</p>
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
                  <span>{saving ? 'Creating Screen...' : 'Create Screen Layout'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

