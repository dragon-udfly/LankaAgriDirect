import React, { useEffect, useState } from 'react';
import { adminGetProducts, suspendProduct, activateProduct, adminDeleteProduct } from '../api/adminApi';

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await adminGetProducts(status ? { status } : {});
      setProducts(res.data.data || res.data.content || []);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]);
  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const handleSuspend = async (id: string) => {
    if (!suspendReason.trim()) { setError('Enter a reason for suspension.'); return; }
    try { await suspendProduct(id, suspendReason); setSuspendId(null); setSuspendReason(''); flash('Product suspended.'); load(); }
    catch (err: any) { setError(err.message); }
  };

  const handleActivate = async (id: string) => {
    try { await activateProduct(id); flash('Product activated.'); load(); }
    catch (err: any) { setError(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    try { await adminDeleteProduct(id); flash('Product deleted.'); load(); }
    catch (err: any) { setError(err.message); }
  };

  return (
    <div className="page">
      <div className="page-header"><h3>📦 Content Moderation</h3></div>
      {error   && <div className="alert alert-error"><span>✖</span> {error}</div>}
      {success && <div className="alert alert-success"><span>✔</span> {success}</div>}

      <div className="filter-row">
        {[{label:'All', val:''},{label:'Active', val:'active'},{label:'Suspended', val:'suspended'}].map(s => (
          <button key={s.val} className={`btn ${status === s.val ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatus(s.val)}>{s.label}</button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="spinner"><div className="loader" /></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Category</th><th>Producer</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {products.length === 0 && (
                  <tr><td colSpan={6} style={{textAlign:'center',padding:32,color:'var(--text-muted)'}}>No products found.</td></tr>
                )}
                {products.map((p: any) => (
                  <React.Fragment key={p.id}>
                    <tr>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category}</td>
                      <td>{p.producerStoreTitle || p.producerId}</td>
                      <td>Rs. {p.unitPrice}/{p.unitType}</td>
                      <td><span className={`badge badge-${p.productStatus}`}>{p.productStatus}</span></td>
                      <td>
                        <div className="btn-group">
                          {p.productStatus === 'active'
                            ? <button className="btn btn-warning btn-sm" onClick={() => setSuspendId(p.id)}>⛔ Suspend</button>
                            : <button className="btn btn-success btn-sm" onClick={() => handleActivate(p.id)}>✅ Activate</button>}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                    {suspendId === p.id && (
                      <tr style={{background:'#FFFBEB'}}>
                        <td colSpan={6} style={{padding:'12px 16px'}}>
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <input value={suspendReason} onChange={e => setSuspendReason(e.target.value)} placeholder="Reason for suspension..." style={{flex:1}} />
                            <button className="btn btn-warning btn-sm" onClick={() => handleSuspend(p.id)}>Confirm</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => {setSuspendId(null); setSuspendReason('');}}>Cancel</button>
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

export default ProductsPage;
