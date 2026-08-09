import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import FilterBar from '../../FilterBar/FilterBar';
import DonateForm from '../Books/DonateForm/DonateForm';
import './MyDonations.css';

function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);

  const load = useCallback((f = filters) => {
    api.getMyDonations(f).then(setDonations).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const handle = setTimeout(() => load(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, load]);

  const handleRemove = async (id) => {
    await api.deleteBook(id);
    load();
  };

  const handleDonated = () => {
    setShowForm(false);
    load();
  };

  return (
    <div className="my-donations-page">
      <div className="my-donations-header">
        <h1 className="Page-title">My Donations</h1>
        {!showForm && (
          <button className="donate-toggle-btn" onClick={() => setShowForm(true)}>
            <span className="donate-toggle-icon">+</span>
            Donate a Book
          </button>
        )}
      </div>

      {showForm && (
        <DonateForm onCancel={() => setShowForm(false)} onSubmitted={handleDonated} />
      )}

      {!showForm && (
        <>
          <FilterBar filters={filters} onChange={setFilters} showDonorFilter={false} />

          {loading && <p>Loading…</p>}
          {!loading && donations.length === 0 && <p>No donations match your filters.</p>}

          <div className="donation-list">
            {donations.map((d) => (
              <div className="donation-row" key={d.id}>
                <div>
                  <strong>{d.title}</strong> by {d.author}
                  <span className={`donation-status ${d.status}`}>{d.status}</span>
                  {d.status === 'reserved' && d.borrower && (
                    <div className="borrower-contact">
                      <p>Reserved by <strong>{d.borrower.name}</strong></p>
                      <p>{d.borrower.email} · {d.borrower.phone}</p>
                    </div>
                  )}
                </div>
                <button className="complete-btn" onClick={() => handleRemove(d.id)}>
                  {d.status === 'reserved' ? 'Book Given' : 'Remove Listing'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyDonations;