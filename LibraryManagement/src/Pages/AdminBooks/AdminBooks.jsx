import { useState, useEffect, useCallback } from "react";
import { api } from "../../api";
import FilterBar from "../../FilterBar/FilterBar";
import "./AdminBooks.css";

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const load = useCallback(
    (f = filters) => {
      api
        .adminGetBooks(f)
        .then(setBooks)
        .finally(() => setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    const handle = setTimeout(() => load(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, load]);

  const handleDelete = async (id) => {
    if (!confirm("Remove this listing? This cannot be undone.")) return;
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

      <FilterBar
        filters={filters}
        onChange={setFilters}
        showDonorFilter={false}
      />

      {loading && <p>Loading…</p>}
      {!loading && books.length === 0 && <p>No listings match.</p>}

      <div className="admin-list">
        {books.map((b) => (
          <div className="admin-row" key={b.id}>
            <div className="admin-row-info">
              <strong>{b.title}</strong> by {b.author}
              <span className={`donation-status ${b.status}`}>{b.status}</span>
              <p className="admin-request-count">
                {b.requests ? b.requests.length : 0} reservation request
                {(b.requests?.length ?? 0) !== 1 ? "s" : ""}
              </p>
              <div className="admin-party">
                <span className="admin-party-label">Donor</span>
                <span>{b.donor?.name}</span>
                <span className="admin-party-email">{b.donor?.email}</span>
                <span className="admin-party-email">{b.donor?.phone}</span>
              </div>
              {b.requests && b.requests.length > 0 && (
                <div className="admin-party">
                  <span className="admin-party-label">Requests</span>
                  {b.requests.map((r) => (
                    <span key={r.id}>
                      {r.borrower.name} — {r.status}
                      {r.status === "accepted" &&
                        ` (${r.borrower.email}, ${r.borrower.phone})`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-row-actions">
              {b.status === "reserved" && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(b.id)}
                >
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
