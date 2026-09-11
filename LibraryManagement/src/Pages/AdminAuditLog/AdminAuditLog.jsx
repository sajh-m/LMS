import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import './AdminAuditLog.css';

const EVENT_LABELS = {
  donation_created: 'Book Donated',
  donation_removed_by_donor: 'Donor Removed',
  donation_removed_by_admin: 'Admin Removed',
  donation_completed: 'Book Given',
  reservation_created: 'Book Reserved',
  reservation_cancelled_by_borrower: 'Borrower Cancelled',
  reservation_cancelled_by_admin: 'Admin Cancelled',
};

const EVENT_COLORS = {
  donation_created: 'green',
  donation_completed: 'green',
  reservation_created: 'blue',
  donation_removed_by_donor: 'gray',
  donation_removed_by_admin: 'red',
  reservation_cancelled_by_borrower: 'gray',
  reservation_cancelled_by_admin: 'red',
};

function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ event: '', bookTitle: '', donorName: '', borrowerName: '' });

  const load = useCallback((f = filters) => {
    setLoading(true);
    api.getAuditLog(f).then(setLogs).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const handle = setTimeout(() => load(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, load]);

  const update = (field) => (e) => setFilters({ ...filters, [field]: e.target.value });

  return (
    <div className="audit-page">
      <h1 className="Page-title">Audit Log</h1>

      <div className="audit-filters">
        <select value={filters.event} onChange={update('event')}>
          <option value="">All events</option>
          {Object.entries(EVENT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <input placeholder="Book title" value={filters.bookTitle} onChange={update('bookTitle')} />
        <input placeholder="Donor name" value={filters.donorName} onChange={update('donorName')} />
        <input placeholder="Borrower name" value={filters.borrowerName} onChange={update('borrowerName')} />
      </div>

      {loading && <p>Loading…</p>}
      {!loading && logs.length === 0 && <p>No audit entries match.</p>}

      <div className="audit-list">
        {logs.map((log) => (
          <div className={`audit-row audit-row--${EVENT_COLORS[log.event] || 'gray'}`} key={log.id}>
            <div className="audit-row-left">
              <span className="audit-event">{EVENT_LABELS[log.event] || log.event}</span>
              <span className="audit-book">"{log.bookTitle}" by {log.bookAuthor}</span>
              {log.bookLocation && <span className="audit-location">📍 {log.bookLocation}</span>}
            </div>

            <div className="audit-row-parties">
              <div className="audit-party">
                <span className="audit-party-label">Donor</span>
                <span>{log.donorName || '—'}</span>
                {log.donorEmail && <span className="audit-party-email">{log.donorEmail}</span>}
              </div>
              {log.borrowerName && (
                <div className="audit-party">
                  <span className="audit-party-label">Borrower</span>
                  <span>{log.borrowerName}</span>
                  {log.borrowerEmail && <span className="audit-party-email">{log.borrowerEmail}</span>}
                </div>
              )}
            </div>

            <div className="audit-row-right">
              <span className="audit-time">
                {new Date(log.createdAt).toLocaleString()}
              </span>
              {log.notes && <span className="audit-notes">{log.notes}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAuditLog;