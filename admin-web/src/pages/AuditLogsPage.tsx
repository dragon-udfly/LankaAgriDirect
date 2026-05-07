import { useEffect, useState } from 'react';
import { getAuditLogs } from '../api/adminApi';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAuditLogs()
      .then(res => setLogs(res.data.data || res.data.content || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const actionColor: Record<string, string> = {
    VERIFY_PRODUCER: '#15803D',
    BLOCK_PRODUCER: '#B91C1C',
    UNBLOCK_PRODUCER: '#B45309',
    DELETE_PRODUCER: '#B91C1C',
    SUSPEND_PRODUCT: '#B45309',
    ACTIVATE_PRODUCT: '#15803D',
    DELETE_PRODUCT: '#B91C1C',
    CREATE_CATEGORY: '#1D4ED8',
    UPDATE_CATEGORY: '#1D4ED8',
    DELETE_CATEGORY: '#B91C1C',
    SEND_ANNOUNCEMENT: '#6B21A8',
  };

  return (
    <div className="page">
      <div className="page-header"><h3>📋 Audit Logs</h3></div>
      {error && <div className="alert alert-error"><span>✖</span> {error}</div>}
      <div className="card">
        {loading ? <div className="spinner"><div className="loader" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Action</th><th>Description</th><th>Performed At</th></tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr><td colSpan={3} style={{textAlign:'center',padding:32,color:'var(--text-muted)'}}>No audit logs found.</td></tr>
                )}
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td>
                      <span style={{fontWeight:600, fontSize:12, color: actionColor[log.action] || 'var(--text)', background:'#F3F4F6', padding:'2px 8px', borderRadius:99}}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{color:'var(--text-muted)', maxWidth:400}}>{log.description}</td>
                    <td style={{whiteSpace:'nowrap', color:'var(--text-muted)', fontSize:13}}>
                      {new Date(log.performedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
