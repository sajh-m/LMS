import { useState } from 'react';
import { api } from '../../../api';
import './BookDetail.css';

function BookDetail({ book, onBack, onDonateMore, requireLogin }) {
  const [reservation, setReservation] = useState(null); // {donor}
  const [taking, setTaking] = useState(false);
  const [error, setError] = useState(null);

  const handleTake = async () => {
    if (!requireLogin()) return;

    setTaking(true);
    setError(null);
    try {
      const result = await api.takeBook(book.id);
      setReservation(result);
    } catch (err) {
      setError(err.status === 409 ? 'Sorry, this book was just taken.' : err.message);
    } finally {
      setTaking(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;
    await api.cancelReservation(book.id);
    setReservation(null);
  };

  return (
    <div className="book-detail">
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

          <p className="book-detail-description">{book.description}</p>

          {error && <p className="book-detail-error">{error}</p>}

          {reservation && (
            <div className="reservation-box">
              <p className="reservation-label">Contact this donor to arrange pickup:</p>
              <p><strong>{reservation.donor.name}</strong></p>
              <p>{reservation.donor.email}</p>
              <p>{reservation.donor.phone}</p>
              <button className="cancel-reservation-btn" onClick={handleCancel}>
                Cancel Reservation
              </button>
            </div>
          )}

          {!reservation && (
            <div className="book-detail-actions">
              <button className="take-btn" onClick={handleTake} disabled={taking}>
                {taking ? 'Reserving…' : 'Take This Book'}
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