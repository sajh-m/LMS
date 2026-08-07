import { useState } from 'react';
import './DonateForm.css';

function DonateForm({ onCancel, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
  });

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <form className="donate-form" onSubmit={handleSubmit}>
      <h2>Donate a Book</h2>

      <label htmlFor="title">Title:</label>
      <input
        id="title"
        type="text"
        placeholder="Book Title"
        value={form.title}
        onChange={handleChange('title')}
      />

      <label htmlFor="author">Author:</label>
      <input
        id="author"
        type="text"
        placeholder="Book Author"
        value={form.author}
        onChange={handleChange('author')}
      />

      <label htmlFor="genre">Genre:</label>
      <select
        id="genre"
        value={form.genre}
        onChange={handleChange('genre')}
      >
        <option value="">Select a genre</option>
        <option value="fiction">Fiction</option>
        <option value="non-fiction">Non-Fiction</option>
        <option value="mystery">Mystery</option>
        <option value="sci-fi">Science Fiction</option>
        <option value="fantasy">Fantasy</option>
        <option value="biography">Biography</option>
        <option value="history">History</option>
        <option value="other">Other</option>
      </select>

      <label htmlFor="description">Description:</label>
      <textarea
        id="description"
        placeholder="Book Description"
        value={form.description}
        onChange={handleChange('description')}
      />

      <div className="donate-form-actions">
        <button type="submit" className="donate-submit-btn">Add Book</button>
        <button type="button" className="donate-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default DonateForm;