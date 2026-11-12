import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllCustomers, toggleBlockCustomer } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { Users, Search, Ban, CheckCircle, Shield } from 'lucide-react';

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomersList = async () => {
    try {
      setLoading(true);
      const res = await getAllCustomers({ search, limit: 100 });
      if (res.success && res.data) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      toast.error('Failed to load customers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomersList();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleBlock = async (id, name, isBlocked) => {
    const action = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} user "${name}"?`)) return;

    try {
      const res = await toggleBlockCustomer(id);
      if (res.success) {
        toast.success(res.message);
        fetchCustomersList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} customer`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cinema-border pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="text-cinema-accent" />
          Manage Registered Customers
        </h1>
        <p className="text-xs text-cinema-muted mt-0.5">
          Review customer accounts, monitor ticket volumes, and enforce account access controls
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="card p-4 flex items-center justify-between gap-3 bg-cinema-surface/80">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-muted" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-9 !py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading customer accounts..." />
        </div>
      ) : (
        <div className="card overflow-hidden shadow-xl border-cinema-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cinema-surface-2 border-b border-cinema-border text-cinema-muted uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4">Bookings</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border/50 text-cinema-text">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-cinema-surface-2/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-cinema-surface-2 border border-cinema-border flex items-center justify-center text-xs font-bold text-cinema-accent uppercase">
                          {c.name ? c.name.slice(0, 2) : 'CU'}
                        </div>
                        <span className="font-bold text-white text-sm">{c.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-cinema-muted">{c.email}</td>

                    <td className="py-3 px-4 font-mono text-zinc-300">
                      {c.phone || 'Not provided'}
                    </td>

                    <td className="py-3 px-4 text-cinema-muted">
                      {formatDate(c.createdAt)}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-cinema-accent">
                      {c.bookingCount || 0} orders
                    </td>

                    <td className="py-3 px-4">
                      {c.isBlocked ? (
                        <span className="badge bg-red-500/10 text-red-400 border border-red-500/30 text-[10px]">
                          Blocked
                        </span>
                      ) : (
                        <span className="badge bg-green-500/10 text-green-400 border border-green-500/30 text-[10px]">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(c._id, c.name, c.isBlocked)}
                        className={`text-xs px-2.5 py-1 rounded border transition-colors inline-flex items-center gap-1.5 ${
                          c.isBlocked
                            ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                            : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        }`}
                      >
                        {c.isBlocked ? (
                          <>
                            <CheckCircle size={12} />
                            <span>Unblock</span>
                          </>
                        ) : (
                          <>
                            <Ban size={12} />
                            <span>Block Account</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

