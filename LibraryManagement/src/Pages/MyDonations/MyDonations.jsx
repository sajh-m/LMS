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

function MyDonations({ focusBookId, onClearFocus }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback((f = filters) => {
    setLoading(true);
    api.getMyDonations(f).then(setDonations).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const handle = setTimeout(() => load(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, load]);

  const visibleDonations = focusBookId
    ? donations.filter((d) => d.id === focusBookId)
    : donations;

  const handleDonated = () => {
    setShowForm(false);
    load();
  };

  const handleAcceptConfirm = async () => {
    const id = acceptTarget;
    setAcceptTarget(null);
    setError(null);
    try {
      await api.acceptRequest(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecline = async (id) => {
    setError(null);
    try {
      await api.declineRequest(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (id) => {
    setError(null);
    try {
      await api.deleteBook(id);
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
          {focusBookId && (
            <div className="focus-banner">
              <span>Showing this book only</span>
              <button className="focus-clear-btn" onClick={onClearFocus}>Show All</button>
            </div>
          )}

          {!focusBookId && <FilterBar filters={filters} onChange={setFilters} showDonorFilter={false} />}

          {error && <p className="donations-error">{error}</p>}
          {loading && <p>Loading…</p>}
          {!loading && visibleDonations.length === 0 && <p>Nothing to show.</p>}

          <div className="donation-list">
            {visibleDonations.map((d) => (
              <div className="donation-row" key={d.id}>
                <div className="donation-row-top">
                  <div className="donation-row-info">
                    <strong>{d.title}</strong>
                    <span>by {d.author}</span>
                    <span className={`donation-status ${d.status}`}>{d.status}</span>
                  </div>
                  {d.status === 'available' && (
                    <button className="complete-btn" onClick={() => handleRemove(d.id)}>
                      Remove Listing
                    </button>
                  )}
                </div>

                {d.status === 'pending' && d.borrower && (
                  <div className="request-list">
                    <p className="request-list-label">Pending request:</p>
                    <div className="request-item">
                      <span className="request-item-name">{d.borrower.name}</span>
                      <div className="request-item-actions">
                        <button className="accept-btn" onClick={() => setAcceptTarget(d.id)}>Accept</button>
                        <button className="decline-btn" onClick={() => handleDecline(d.id)}>Decline</button>
                      </div>
                    </div>
                  </div>
                )}

                {d.status === 'reserved' && d.borrower && (
                  <div className="request-list">
                    <p className="request-list-label">Reserved by {d.borrower.name}</p>
                    <p className="contact-note">{d.borrower.email} · {d.borrower.phone}</p>
                    <p className="contact-note">Waiting for them to confirm receipt…</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyDonations;