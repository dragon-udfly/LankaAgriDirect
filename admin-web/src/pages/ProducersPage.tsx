import React, { useEffect, useState } from 'react';
import { getProducers, verifyProducer, blockProducer } from '../api/adminApi';

const ProducersPage = () => {
  const [producers, setProducers] = useState<any[]>([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await getProducers({ status });
      setProducers(res.data.data || res.data.content || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]);

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const handleVerify = async (id: string, name: string) => {
    try { await verifyProducer(id); flash(`✅ ${name} verified successfully.`); load(); }
    catch (err: any) { setError(err.message); }
  };

  const handleBlock = async (id: string, name: string) => {
    if (!blockReason.trim()) { setError('Please enter a reason for blocking.'); return; }
    try {
      await blockProducer(id, blockReason);
      setBlockingId(null); setBlockReason('');
      flash(`🚫 ${name} has been blocked.`); load();
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="page">
      <div className="page-header"><h3>👩‍🌾 Producer Management</h3></div>
      {error   && <div className="alert alert-error"><span>✖</span> {error}</div>}
      {success && <div className="alert alert-success"><span>✔</span> {success}</div>}

      <div className="filter-row">
        {['pending','verified','blocked'].map(s => (
          <button key={s} className={`btn ${status === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatus(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="spinner"><div className="loader" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>NIC</th><th>Phone</th><th>District</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {producers.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No producers found.</td></tr>
                )}
                {producers.map((p: any) => (
                  <React.Fragment key={p.id}>
                    <tr>
                      <td><strong>{p.firstName} {p.lastName}</strong><br /><small style={{color:'var(--text-muted)'}}>{p.storeTitle}</small></td>
                      <td>{p.nic}</td>
                      <td>{p.businessPhone}</td>
                      <td>{p.district}</td>
                      <td><span className={`badge badge-${p.verificationStatus}`}>{p.verificationStatus}</span></td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          {p.verificationStatus === 'pending' && (
                            <button className="btn btn-success btn-sm" onClick={() => handleVerify(p.id, p.firstName)}>✅ Verify</button>
                          )}
                          {p.verificationStatus !== 'blocked' && (
                            <button className="btn btn-danger btn-sm" onClick={() => setBlockingId(p.id)}>🚫 Block</button>
                          )}
                          {p.nicPhotoUrl && (
                            <a href={p.nicPhotoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">🪪 NIC</a>
                          )}
                        </div>
                      </td>
                    </tr>
                    {blockingId === p.id && (
                      <tr style={{ background: '#FFF7ED' }}>
                        <td colSpan={7} style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              value={blockReason}
                              onChange={e => setBlockReason(e.target.value)}
                              placeholder="Reason for blocking (required)..."
                              style={{ flex: 1 }}
                            />
                            <button className="btn btn-danger btn-sm" onClick={() => handleBlock(p.id, p.firstName)}>Confirm Block</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setBlockingId(null); setBlockReason(''); }}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProducersPage;
