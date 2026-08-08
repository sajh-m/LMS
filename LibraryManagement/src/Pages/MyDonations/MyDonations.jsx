import { useState, useEffect } from 'react';
import { api } from '../../api';
import './MyDonations.css';

function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true); // starts true - no need to set it inside load()

  const load = () => {
    api.getMyDonations().then(setDonations).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleComplete = async (donationId) => {
    await api.completeDonation(donationId);
    load();
  };

  return (
    <div className="my-donations-page">
      <h1 className="Page-title">My Donations</h1>

      {loading && <p>Loading…</p>}

      {!loading && donations.length === 0 && (
        <p>You haven't donated any books yet.</p>
      )}

      <div className="donation-list">
        {donations.map((d) => (
          <div className="donation-row" key={d.id}>
            <div>
              <strong>{d.book.title}</strong> by {d.book.author}
              <span className={`donation-status ${d.status}`}>{d.status}</span>
            </div>
            {d.status === 'reserved' && (
              <button className="complete-btn" onClick={() => handleComplete(d.id)}>
                Mark as Given
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyDonations;