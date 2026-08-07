import { useState } from 'react';
import './BookDetail.css';

function BookDetail({ book, onBack, onDonateMore }) {
  const [taken, setTaken] = useState(false);

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

          <div className="book-detail-actions">
            <button
              className="take-btn"
              onClick={() => setTaken(true)}
              disabled={taken}
            >
              {taken ? 'Reserved for You' : 'Take This Book'}
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
