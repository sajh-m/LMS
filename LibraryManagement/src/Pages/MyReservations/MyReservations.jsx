import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import FilterBar from '../../FilterBar/FilterBar';
import './MyReservations.css';

function MyReservations() {
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

  const handleCancel = async (requestId, status) => {
    setError(null);
    try {
      if (status === 'pending') {
        await api.withdrawRequest(requestId);
      } else {
        await api.cancelReservation(requestId);
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="my-reservations-page">
      <h1 className="Page-title">My Reservations</h1>

      <FilterBar filters={filters} onChange={setFilters} />

      {error && <p className="reservations-error">{error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && reservations.length === 0 && <p>No reservations match your filters.</p>}

      <div className="reservation-list">
        {reservations.filter((r) => r.donation).map((r) => (
          <div className="reservation-row" key={r.id}>
            <div>
              <strong>{r.donation.title}</strong> by {r.donation.author}
              <span className={`donation-status ${r.status}`}>{r.status}</span>
              <p className="reservation-location">📍 {r.donation.location}</p>

              {r.status === 'pending' && (
                <p className="contact-note">Waiting for the donor to respond…</p>
              )}

              {r.status === 'accepted' && r.donation.donor && (
                <div className="donor-contact">
                  <p><strong>{r.donation.donor.name}</strong></p>
                  <p>{r.donation.donor.email} · {r.donation.donor.phone}</p>
                </div>
              )}
            </div>
            <button className="cancel-btn" onClick={() => handleCancel(r.id, r.status)}>
              {r.status === 'pending' ? 'Withdraw Request' : 'Cancel Reservation'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyReservations;