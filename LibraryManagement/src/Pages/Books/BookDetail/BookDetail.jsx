import { useState } from 'react';
import { api, auth } from '../../../api';
import './BookDetail.css';

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

function BookDetail({ book, onBack, onDonateMore, requireLogin, setPage, setFocusBookId }) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAdminCancelModal, setShowAdminCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = auth.getUser();
  const isOwnBook = currentUser && book.donorId === currentUser.id;
  const isAdmin = currentUser?.role === 'admin';
  const isMyRequest = currentUser && !isOwnBook && book.borrowerId === currentUser.id;

  const handleRequestConfirm = async () => {
    setShowRequestModal(false);
    setLoading(true);
    setError(null);
    try {
      await api.sendRequest(book.id);
      onBack(); // book disappears from the list now that it's pending
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    setError(null);
    try {
      await api.deleteBook(book.id);
      onBack();
    } catch (err) {
      setError(err.message);
      setRemoving(false);
    }
  };

  const handleAdminRemove = async () => {
    setRemoving(true);
    setError(null);
    try {
      await api.adminDeleteBook(book.id);
      onBack();
    } catch (err) {
      setError(err.message);
      setRemoving(false);
    }
  };

  const handleAdminCancelConfirm = async () => {
    setShowAdminCancelModal(false);
    setLoading(true);
    setError(null);
    try {
      await api.adminCancelReservation(book.id);
      onBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestButtonClick = () => {
    if (!requireLogin()) return;
    setShowRequestModal(true);
  };

  const viewInMyDonations = () => {
    setFocusBookId(book.id);
    setPage('MyDonations');
  };

  const viewInMyReservations = () => {
    setFocusBookId(book.id);
    setPage('MyReservations');
  };

  return (
    <div className="book-detail">
      {showRequestModal && (
        <ConfirmModal
          message="Sending this request will share your name, email, and phone number with the donor if they accept. Do you want to proceed?"
          onConfirm={handleRequestConfirm}
          onCancel={() => setShowRequestModal(false)}
        />
      )}
      {showAdminCancelModal && (
        <ConfirmModal
          message={
            book.status === 'reserved'
              ? "This will cancel the accepted reservation and make the book available again. Continue?"
              : "This will deny the pending request and make the book available again. Continue?"
          }
          onConfirm={handleAdminCancelConfirm}
          onCancel={() => setShowAdminCancelModal(false)}
        />
      )}

      <button className="back-link" onClick={onBack}>← Back to Books</button>

      <div className="book-detail-body">
        <img
          className="book-detail-cover"
          src={book.image ? `http://localhost:3001${book.image}` : 'https://placehold.co/300x400?text=No+Cover'}
          alt={`Cover of ${book.title}`}
        />

        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <p className="book-detail-author"><strong>Author:</strong> {book.author}</p>
          {book.genre && <span className="book-detail-genre">{book.genre}</span>}
          <p className="book-detail-location">📍 {book.location}</p>
          {book.donor && !isAdmin && (
            <p className="book-detail-donor-name">Listed by {book.donor.name}</p>
          )}
          <p className="book-detail-description">{book.description}</p>

          {error && <p className="book-detail-error">{error}</p>}

          {/* ADMIN: full moderation, works regardless of who's involved */}
          {isAdmin && (
            <div className="admin-donor-info">
              <p className="admin-donor-label">Donor</p>
              <p><strong>{book.donor?.name}</strong></p>
              {book.donor?.email && <p>{book.donor.email}</p>}
              {book.donor?.phone && <p>{book.donor.phone}</p>}

              {book.borrower && (
                <>
                  <p className="admin-donor-label" style={{ marginTop: '0.75rem' }}>
                    {book.status === 'reserved' ? 'Borrower' : 'Requester'}
                  </p>
                  <p><strong>{book.borrower.name}</strong></p>
                  {book.borrower.email && <p>{book.borrower.email}</p>}
                  {book.borrower.phone && <p>{book.borrower.phone}</p>}
                </>
              )}

              <div className="admin-actions-row">
                {(book.status === 'pending' || book.status === 'reserved') && (
                  <button className="cancel-btn" onClick={() => setShowAdminCancelModal(true)} disabled={loading}>
                    {book.status === 'reserved' ? 'Cancel Reservation' : 'Deny Request'}
                  </button>
                )}
                <button className="remove-btn" onClick={handleAdminRemove} disabled={removing}>
                  {removing ? 'Removing…' : 'Remove Listing'}
                </button>
              </div>
            </div>
          )}

          {/* DONOR: redirect to My Donations, where accept/decline actually happens */}
          {isOwnBook && !isAdmin && (
            <div className="book-detail-actions">
              {book.status === 'available' && (
                <>
                  <p className="own-book-note">No requests yet.</p>
                  <button className="remove-btn" onClick={handleRemove} disabled={removing}>
                    {removing ? 'Removing…' : 'Remove Book'}
                  </button>
                </>
              )}
              {book.status !== 'available' && (
                <button className="view-requests-btn" onClick={viewInMyDonations}>
                  {book.status === 'pending' ? 'View request in My Donations →' : 'Manage in My Donations →'}
                </button>
              )}
            </div>
          )}

          {/* BORROWER with an active stake in this book: redirect to My Reservations */}
          {isMyRequest && !isAdmin && (
            <div className="reservation-box">
              <p className="reservation-label">
                {book.status === 'pending' ? 'Your request is pending.' : 'Your request was accepted!'}
              </p>
              <button className="view-requests-btn" onClick={viewInMyReservations}>
                Manage in My Reservations →
              </button>
            </div>
          )}

          {/* Anyone else: browse + request, only when actually available */}
          {!isOwnBook && !isAdmin && !isMyRequest && (
            <div className="book-detail-actions">
              <button
                className="take-btn"
                onClick={requestButtonClick}
                disabled={loading || book.status !== 'available'}
              >
                {book.status !== 'available'
                  ? 'Currently Unavailable'
                  : loading ? 'Sending…' : 'Request to Borrow'}
              </button>
              <button className="donate-more-btn" onClick={onDonateMore}>
                Donate Another Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;