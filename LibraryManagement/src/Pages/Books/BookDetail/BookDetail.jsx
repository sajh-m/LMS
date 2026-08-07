import { useState } from 'react';
import './BookDetail.css';

const API_URL = 'http://localhost:3001/api/books';

function BookDetail({ book, onBack, onDonateMore, onTaken }) {
  const [stock, setStock] = useState(book.stock);
  const [taking, setTaking] = useState(false);
  const [error, setError] = useState(null);

  const outOfStock = stock <= 0;

  const handleTake = async () => {
    setTaking(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${book.id}/take`, { method: 'POST' });

      if (res.status === 409) {
        setStock(0);
        setError('Sorry, the last copy was just taken.');
        return;
      }
      if (!res.ok) throw new Error('Failed to take book');

      const updated = await res.json();
      setStock(updated.stock);
      if (onTaken) onTaken(updated);
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

          <p className={`book-detail-stock ${outOfStock ? 'out-of-stock' : ''}`}>
            {outOfStock ? 'Out of Stock' : `${stock} ${stock === 1 ? 'copy' : 'copies'} available`}
          </p>

          <p className="book-detail-description">{book.description}</p>

          {error && <p className="book-detail-error">{error}</p>}

          <div className="book-detail-actions">
            <button
              className="take-btn"
              onClick={handleTake}
              disabled={taking || outOfStock}
            >
              {outOfStock ? 'Out of Stock' : taking ? 'Reserving…' : 'Take This Book'}
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