import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import FilterBar from '../../FilterBar/FilterBar';
import './AdminBooks.css';

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const load = useCallback((f = filters) => {
    api.adminGetBooks(f).then(setBooks).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const handle = setTimeout(() => load(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, load]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing? This cannot be undone.')) return;
    await api.adminDeleteBook(id);
    load();
  };

  const handleCancel = async (id) => {
    await api.adminCancelReservation(id);
    load();
  };

  return (
    <div className="admin-books-page">
      <h1 className="Page-title">Admin: All Listings</h1>

      <FilterBar filters={filters} onChange={setFilters} showDonorFilter={false} />

      {loading && <p>Loading…</p>}
      {!loading && books.length === 0 && <p>No listings match.</p>}

      <div className="admin-list">
        {books.map((b) => (
          <div className="admin-row" key={b.id}>
            <div className="admin-row-info">
              <strong>{b.title}</strong> by {b.author}
              <span className={`donation-status ${b.status}`}>{b.status}</span>
              <p className="admin-party">Donor: {b.donor?.name} · {b.donor?.email} · {b.donor?.phone}</p>
              {b.borrower && (
                <p className="admin-party">Borrower: {b.borrower.name} · {b.borrower.email} · {b.borrower.phone}</p>
              )}
            </div>
            <div className="admin-row-actions">
              {b.status === 'reserved' && (
                <button className="cancel-btn" onClick={() => handleCancel(b.id)}>
                  Cancel Reservation
                </button>
              )}
              <button className="remove-btn" onClick={() => handleDelete(b.id)}>
                Remove Listing
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminBooks;