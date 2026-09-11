import { useState, useEffect } from "react";
import { api, auth } from "../../../api";
import "./BookDetail.css";

function ConfirmModal({ message, onConfirm, onCancel, pendingRequestCount }) {
  return (
    <div className="modal-overlay">
      {pendingRequestCount !== undefined && (
        <p className="book-detail-request-count">
          {pendingRequestCount} pending request
          {pendingRequestCount !== 1 ? "s" : ""}
        </p>
      )}
      <div className="modal-box">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="modal-confirm-btn" onClick={onConfirm}>
            I Understand, Proceed
          </button>
          <button className="modal-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function BookDetail({ book, onBack, onDonateMore, requireLogin }) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = auth.getUser();
  const isOwnBook = currentUser && book.donorId === currentUser.id;
  const isAdmin = currentUser?.role === "admin";

  // On mount, check whether the current user already has an active
  // request on this book - so refreshing the page doesn't lose that state.
  useEffect(() => {
    let cancelled = false;

    async function checkExistingRequest() {
      if (!currentUser || isOwnBook || isAdmin) {
        if (!cancelled) setCheckingStatus(false);
        return;
      }

      try {
        const reservations = await api.getMyReservation();
        const existing = reservations.find(
          (r) =>
            r.donation?.id === book.id &&
            ["pending", "accepted"].includes(r.status),
        );
        if (!cancelled && existing) setRequestSent(true);
      } catch {
        // ignore - just means we couldn't confirm existing status
      } finally {
        if (!cancelled) setCheckingStatus(false);
      }
    }

    checkExistingRequest();

    return () => {
      cancelled = true;
    };
  }, [book.id, currentUser, isOwnBook, isAdmin]);

  const handleRequestConfirm = async () => {
    setShowRequestModal(false);
    setLoading(true);
    setError(null);
    try {
      await api.sendRequest(book.id);
      setRequestSent(true);
    } catch (err) {
      if (err.status === 409) {
        setRequestSent(true);
      } else {
        setError(err.message);
      }
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

  const requestButtonClick = () => {
    if (!requireLogin()) return;
    setShowRequestModal(true);
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

      <button className="back-link" onClick={onBack}>
        ← Back to Books
      </button>

      <div className="book-detail-body">
        <img
          className="book-detail-cover"
          src={
            book.image
              ? book.image.startsWith("http")
                ? book.image
                : `${import.meta.env.VITE_API_URL}${book.image}`
              : "https://placehold.co/300x400?text=No+Cover"
          }
          alt={`Cover of ${book.title}`}
        />

        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <p className="book-detail-author">
            <strong>Author:</strong> {book.author}
          </p>
          {book.genre && (
            <span className="book-detail-genre">{book.genre}</span>
          )}
          <p className="book-detail-location">📍 {book.location}</p>
          {book.donor && (
            <p className="book-detail-donor-name">
              Listed by {book.donor.name}
            </p>
          )}
          <p className="book-detail-description">{book.description}</p>

          {error && <p className="book-detail-error">{error}</p>}

          {isOwnBook && (
            <div className="book-detail-actions">
              <p className="own-book-note">
                This is your own donation. Manage requests from My Donations.
              </p>
              <button
                className="remove-btn"
                onClick={handleRemove}
                disabled={removing}
              >
                {removing ? "Removing…" : "Remove Book"}
              </button>
            </div>
          )}

          {isAdmin && !isOwnBook && (
            <p className="own-book-note">
              Admins can't request books — use Manage Listings to moderate this
              entry.
            </p>
          )}

          {!isOwnBook && !isAdmin && !checkingStatus && !requestSent && (
            <div className="book-detail-actions">
              <button
                className="take-btn"
                onClick={requestButtonClick}
                disabled={loading || book.status === "reserved"}
              >
                {book.status === "reserved"
                  ? "Already Reserved"
                  : loading
                    ? "Sending…"
                    : "Request to Borrow"}
              </button>
              <button className="donate-more-btn" onClick={onDonateMore}>
                Donate Another Copy
              </button>
            </div>
          )}

          {!isOwnBook && !isAdmin && requestSent && (
            <div className="reservation-box">
              <p className="reservation-label">Request sent!</p>
              <p>
                Waiting for the donor to respond. Manage or withdraw this
                request from My Reservations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
