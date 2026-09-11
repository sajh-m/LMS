import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import FilterBar from '../../FilterBar/FilterBar';
import DonateForm from '../Books/DonateForm/DonateForm';
import './MyDonations.css';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="modal-confirm-btn" onClick={onConfirm}>I Understand, Proceed</button>
          <button className="modal-cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [contactInfo, setContactInfo] = useState({});
  const [error, setError] = useState(null);

  const load = useCallback((f = filters) => {
    setLoading(true);
    api.getMyDonations(f).then((data) => {
      console.log('MyDonations API response:', data); // temporary - check console
      setDonations(data);
    }).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const handle = setTimeout(() => load(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, load]);

  const handleDonated = () => {
    setShowForm(false);
    load();
  };

  const handleAcceptConfirm = async () => {
    const requestId = acceptTarget;
    setAcceptTarget(null);
    setError(null);
    try {
      const result = await api.acceptRequest(requestId);
      setContactInfo((prev) => ({ ...prev, [requestId]: result }));
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecline = async (requestId) => {
    setError(null);
    try {
      await api.declineRequest(requestId);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (donationId) => {
    setError(null);
    try {
      await api.deleteBook(donationId);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="my-donations-page">
      {acceptTarget && (
        <ConfirmModal
          message="Accepting this request will share your name, email, and phone number with the borrower. Do you want to proceed?"
          onConfirm={handleAcceptConfirm}
          onCancel={() => setAcceptTarget(null)}
        />
      )}

      <div className="page-header-row">
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

          {error && <p className="donations-error">{error}</p>}
          {loading && <p>Loading…</p>}
          {!loading && donations.length === 0 && <p>No donations match your filters.</p>}

          <div className="donation-list">
            {donations.map((d) => (
              <div className="donation-row" key={d.id}>
                <div className="donation-row-info">
                  <strong>{d.title}</strong> by {d.author}
                  <span className={`donation-status ${d.status}`}>{d.status}</span>

                  {d.requests && d.requests.length > 0 && (
                    <div className="request-list">
                      <p className="request-list-label">
                        {d.status === 'reserved'
                          ? 'Reserved by:'
                          : `${d.requests.length} pending request(s):`}
                      </p>
                      {d.requests.map((req) => (
                        <div className="request-item" key={req.id}>
                          <span className="request-item-name">{req.borrower.name}</span>

                          {req.status === 'pending' && (
                            <div className="request-item-actions">
                              <button className="accept-btn" onClick={() => setAcceptTarget(req.id)}>
                                Accept
                              </button>
                              <button className="decline-btn" onClick={() => handleDecline(req.id)}>
                                Decline
                              </button>
                            </div>
                          )}

                          {req.status === 'accepted' && contactInfo[req.id] && (
                            <div className="borrower-contact">
                              <p>{contactInfo[req.id].borrower.email} · {contactInfo[req.id].borrower.phone}</p>
                            </div>
                          )}
                        </div>
                      ))}
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