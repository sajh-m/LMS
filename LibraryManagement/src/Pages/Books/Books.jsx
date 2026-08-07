import { useState } from 'react';
import './Books.css';
import Card from "./Card/Card";
import DonateForm from './DonateForm/DonateForm';
import BookDetail from './BookDetail/BookDetail';

function Books() {
  const [view, setView] = useState('list'); // 'list' | 'form' | 'detail'
  const [selectedBook, setSelectedBook] = useState(null);

  const books = [
    {
      title: "Glory",
      author: "Me",
      genre: "Fiction",
      description: "The best book in town",
      image: "https://placehold.co/300x400?text=Glory",
    },
    {
      title: "Another Book",
      author: "Someone Else",
      genre: "Mystery",
      description: "Another great read",
      image: "https://placehold.co/300x400?text=Another+Book",
    },
  ];

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

      {view === 'list' && (
        <div className="card-grid">
          {books.map((book, i) => (
            <Card
              key={i}
              title={book.title}
              author={book.author}
              description={book.description}
              image={book.image}
              onClick={() => { console.log('card clicked', book.title); openDetail(book); }}
            />
          ))}
        </div>
      )}

      {view === 'detail' && selectedBook && (
        <BookDetail
          book={selectedBook}
          onBack={backToList}
          onDonateMore={() =>
            openForm({ title: selectedBook.title, author: selectedBook.author })
          }
        />
      )}

      {view === 'form' && (
        <DonateForm prefill={selectedBook} onCancel={backToList} />
      )}
    </div>
  );
}

export default Books;