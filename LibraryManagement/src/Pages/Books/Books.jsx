import { useState, useEffect } from 'react';
import './Books.css';
import Card from "./Card/Card";
import DonateForm from './DonateForm/DonateForm';
import BookDetail from './BookDetail/BookDetail';

const API_URL = 'http://localhost:3001/api/books';

function Books() {
  const [view, setView] = useState('list'); // 'list' | 'form' | 'detail'
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true); // starts true - no need to set it inside loadBooks

  const loadBooks = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error('Failed to load books:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const openDetail = (book) => {
    setSelectedBook(book);
    setView('detail');
  };

  const openForm = (prefill) => {
    setSelectedBook(prefill || null);
    setView('form');
  };

  const backToList = () => {
    setSelectedBook(null);
    setView('list');
    loadBooks();
  };

  const handleTaken = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="books-page">
      <div className="books-header">
        <h2 className="Page-title">Books</h2>
        {view === 'list' && (
          <button className="donate-toggle-btn" onClick={() => openForm()}>
            <span className="donate-toggle-icon">+</span>
            Donate a Book
          </button>
        )}
      </div>

      {view === 'list' && loading && <p>Loading books…</p>}

      {view === 'list' && !loading && (
        <div className="card-grid">
          {books.map((book) => (
            <Card
              key={book.id}
              title={book.title}
              author={book.author}
              description={book.description}
              image={book.image}
              onClick={() => openDetail(book)}
            />
          ))}
        </div>
      )}

      {view === 'detail' && selectedBook && (
        <BookDetail
          book={selectedBook}
          onBack={backToList}
          onTaken={handleTaken}
          onDonateMore={() =>
            openForm({ title: selectedBook.title, author: selectedBook.author })
          }
        />
      )}

      {view === 'form' && (
        <DonateForm prefill={selectedBook} onCancel={backToList} onSubmitted={backToList} />
      )}
    </div>
  );
}

export default Books;