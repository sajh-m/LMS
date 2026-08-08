import { useState } from 'react';
import { api} from '../../../api';
import './DonateForm.css';

function DonateForm({ onCancel, onSubmitted, prefill }) {
  const [form, setForm] = useState(() => ({
    title: prefill?.title || '',
    author: prefill?.author || '',
    genre: '',
    description: '',
  }));
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('author', form.author);
      fd.append('genre', form.genre);
      fd.append('description', form.description);
      if (imageFile) fd.append('image', imageFile);

      await api.donateBook(fd);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setErrors(err.data?.details || [{ message: err.message }]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="donate-form" onSubmit={handleSubmit}>
      <h2>Donate a Book</h2>

      {errors.length > 0 && (
        <ul className="donate-form-errors">
          {errors.map((err, i) => (
            <li key={i}>{err.field ? `${err.field}: ${err.message}` : err.message}</li>
          ))}
        </ul>
      )}

      <label htmlFor="title">Title:</label>
      <input id="title" type="text" placeholder="Book Title" value={form.title} onChange={handleChange('title')} />

      <label htmlFor="author">Author:</label>
      <input id="author" type="text" placeholder="Book Author" value={form.author} onChange={handleChange('author')} />

      <label htmlFor="genre">Genre:</label>
      <select id="genre" value={form.genre} onChange={handleChange('genre')}>
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
      <textarea id="description" placeholder="Book Description" value={form.description} onChange={handleChange('description')} />

      <label htmlFor="image">Photo of the book:</label>
      <input
        id="image"
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0] || null)}
      />

      <div className="donate-form-actions">
        <button type="submit" className="donate-submit-btn" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Book'}
        </button>
        <button type="button" className="donate-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default DonateForm;