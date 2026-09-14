import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import FilterBar from '../../FilterBar/FilterBar';
import './MyReservations.css';

function MyReservations({ focusBookId, onClearFocus }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);

  const load = useCallback((f = filters) => {
    setLoading(true);
    api.getMyReservation(f).then(setReservations).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const handle = setTimeout(() => load(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, load]);

  const visibleReservations = focusBookId
    ? reservations.filter((r) => r.id === focusBookId)
    : reservations;

  const handleWithdraw = async (id) => {
    setError(null);
    try {
      await api.withdrawRequest(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async (id) => {
    setError(null);
    try {
      await api.cancelReservation(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReceive = async (id) => {
    if (!confirm('Confirm you physically received this book? This permanently removes the listing.')) return;
    setError(null);
    try {
      await api.receiveBook(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="my-reservations-page">
      <h1 className="Page-title">My Reservations</h1>

      {focusBookId && (
        <div className="focus-banner">
          <span>Showing this book only</span>
          <button className="focus-clear-btn" onClick={onClearFocus}>Show All</button>
        </div>
      )}

      {!focusBookId && <FilterBar filters={filters} onChange={setFilters} />}

      {error && <p className="reservations-error">{error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && visibleReservations.length === 0 && <p>No reservations to show.</p>}

      <div className="reservation-list">
        {visibleReservations.map((r) => (
          <div className="reservation-row" key={r.id}>
            <div>
              <strong>{r.title}</strong> by {r.author}
              <span className={`donation-status ${r.status}`}>{r.status}</span>
              <p className="reservation-location">📍 {r.location}</p>

              {r.status === 'pending' && (
                <p className="contact-note">Waiting for the donor to respond…</p>
              )}

              {r.status === 'reserved' && r.donor && (
                <div className="donor-contact">
                  <p><strong>{r.donor.name}</strong></p>
                  <p>{r.donor.email} · {r.donor.phone}</p>
                </div>
              )}
            </div>

            <div className="reservation-actions">
              {r.status === 'pending' && (
                <button className="cancel-btn" onClick={() => handleWithdraw(r.id)}>
                  Withdraw Request
                </button>
              )}
              {r.status === 'reserved' && (
                <>
                  <button className="received-btn" onClick={() => handleReceive(r.id)}>
                    Book Received
                  </button>
                  <button className="cancel-btn" onClick={() => handleCancel(r.id)}>
                    Cancel Reservation
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyReservations;