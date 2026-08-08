import { useState, useEffect } from 'react';
import { auth, api } from '../../api';
import './Books.css';
import Card from "./Card/Card";
import DonateForm from './DonateForm/DonateForm';
import BookDetail from './BookDetail/BookDetail';

function Books({ setPage }) {
  const [view, setView] = useState('list');
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = () => {
    api.getBooks().then(setBooks).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadBooks(); }, []);

  const requireLogin = (action) => {
    if (!auth.isLoggedIn()) {
      setPage('Login');
      return false;
    }
    return action();
  };

  const openDetail = (book) => { setSelectedBook(book); setView('detail'); };
  const openForm = (prefill) => requireLogin(() => { setSelectedBook(prefill || null); setView('form'); });
  const backToList = () => { setSelectedBook(null); setView('list'); loadBooks(); };

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
              stock={book.availableCount}
              onClick={() => openDetail(book)}
            />
          ))}
        </div>
      )}

      {view === 'detail' && selectedBook && (
        <BookDetail
          book={selectedBook}
          onBack={backToList}
          onTaken={() => {}}
          onDonateMore={() => requireLogin(() =>
            openForm({ title: selectedBook.title, author: selectedBook.author })
          )}
        />
      )}

      {view === 'form' && (
        <DonateForm prefill={selectedBook} onCancel={backToList} onSubmitted={backToList} />
      )}
    </div>
  );
}

export default Books;