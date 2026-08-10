import { useState, useEffect, useCallback } from 'react';
import { auth, api } from '../../api';
import FilterBar from '../../FilterBar/FilterBar';
import './Books.css';
import Card from "./Card/Card";
import DonateForm from './DonateForm/DonateForm';
import BookDetail from './BookDetail/BookDetail';

function Books({ setPage, showToast, isAdmin }) {
  const [view, setView] = useState('list');
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const loadBooks = useCallback((f = filters) => {
    api.getBooks(f).then(setBooks).catch(console.error).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const handle = setTimeout(() => loadBooks(filters), 300);
    return () => clearTimeout(handle);
  }, [filters, loadBooks]);

  const requireLogin = () => {
    if (!auth.isLoggedIn()) {
      showToast('Please log in to donate or take a book.');
      setPage('Login');
      return false;
    }
    return true;
  };

  const openDetail = (book) => { setSelectedBook(book); setView('detail'); };
  const openForm = (prefill) => {
    if (!requireLogin()) return;
    setSelectedBook(prefill || null);
    setView('form');
  };
  const backToList = () => { setSelectedBook(null); setView('list'); loadBooks(); };

  return (
    <div className="books-page">
      <div className="page-header-row">
        <h2 className="Page-title">Books</h2>
        {view === 'list' && !isAdmin && (
          <button className="donate-toggle-btn" onClick={() => openForm()}>
            <span className="donate-toggle-icon">+</span>
            Donate a Book
          </button>
        )}
      </div>

      {view === 'list' && <FilterBar filters={filters} onChange={setFilters} />}

      {view === 'list' && loading && <p>Loading books…</p>}

      {view === 'list' && !loading && books.length === 0 && (
        <p>No books match your filters.</p>
      )}

      {view === 'list' && !loading && (
        <div className="card-grid">
          {books.map((book) => (
            <Card
              key={book.id}
              title={book.title}
              author={book.author}
              description={book.description}
              image={book.image}
              location={book.location}
              onClick={() => openDetail(book)}
            />
          ))}
        </div>
      )}

      {view === 'detail' && selectedBook && (
        <BookDetail
          book={selectedBook}
          onBack={backToList}
          requireLogin={requireLogin}
          onDonateMore={() => openForm({ title: selectedBook.title, author: selectedBook.author })}
        />
      )}

      {view === 'form' && (
        <DonateForm prefill={selectedBook} onCancel={backToList} onSubmitted={backToList} />
      )}
    </div>
  );
}

export default Books;