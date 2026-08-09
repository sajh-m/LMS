import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import FilterBar from '../../FilterBar/FilterBar';
import './MyReservations.css';

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const load = useCallback((f = filters) => {
    api.getMyReservation(f).then(setReservations).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const handle = setTimeout(() => load(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, load]);

  const handleCancel = async (id) => {
    await api.cancelReservation(id);
    load();
  };

  return (
    <div className="my-reservations-page">
      <h1 className="Page-title">My Reservations</h1>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <p>Loading…</p>}
      {!loading && reservations.length === 0 && <p>No reservations match your filters.</p>}

      <div className="reservation-list">
        {reservations.map((r) => (
          <div className="reservation-row" key={r.id}>
            <div>
              <strong>{r.title}</strong> by {r.author}
              <p className="reservation-location">📍 {r.location}</p>
              {r.donor && (
                <div className="donor-contact">
                  <p><strong>{r.donor.name}</strong></p>
                  <p>{r.donor.email} · {r.donor.phone}</p>
                </div>
              )}
            </div>
            <button className="cancel-btn" onClick={() => handleCancel(r.id)}>
              Cancel Reservation
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyReservations;