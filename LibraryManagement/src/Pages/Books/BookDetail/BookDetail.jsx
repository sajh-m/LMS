import { useState } from 'react';
import './BookDetail.css';

const API_URL = 'http://localhost:3001/api/books';

function BookDetail({ book, onBack, onDonateMore, onTaken }) {
  const [taking, setTaking] = useState(false);
  const [taken, setTaken] = useState(false);
  const [error, setError] = useState(null);

  const handleTake = async () => {
    setTaking(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${book.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to take book');
      setTaken(true);
      if (onTaken) onTaken(book.id);
    } catch (err) {
      console.error(err);
      setError('Could not reserve this book. Please try again.');
    } finally {
      setTaking(false);
    }
  };

  return (
    <div className="book-detail">
      <button className="back-link" onClick={onBack}>← Back to Books</button>

      <div className="book-detail-body">
        <img
          className="book-detail-cover"
          src={book.image || 'https://placehold.co/300x400?text=No+Cover'}
          alt={`Cover of ${book.title}`}
        />

        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <p className="book-detail-author"><strong>Author:</strong> {book.author}</p>
          {book.genre && <span className="book-detail-genre">{book.genre}</span>}
          <p className="book-detail-description">{book.description}</p>

          {error && <p className="book-detail-error">{error}</p>}

          <div className="book-detail-actions">
            <button
              className="take-btn"
              onClick={handleTake}
              disabled={taking || taken}
            >
              {taken ? 'Reserved for You' : taking ? 'Reserving…' : 'Take This Book'}
            </button>
            <button className="donate-more-btn" onClick={onDonateMore}>
              Donate Another Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;