import { useState } from 'react';
import './Contact.css';

function Contact() {
  const [form, setForm] = useState({
    name: '',
    number: '',
    email: '',
    comment: '',
  });

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // wire up submission here
  };

  return (
    <div className="contact-page">
      <h1 className="Page-title">Leave details for any query</h1>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="contactName">Name:</label>
        <input
          type="text"
          id="contactName"
          placeholder="Name"
          value={form.name}
          onChange={handleChange('name')}
        />

        <label htmlFor="contactNumber">Number:</label>
        <input
          type="text"
          id="contactNumber"
          placeholder="Number"
          value={form.number}
          onChange={handleChange('number')}
        />

        <label htmlFor="contactMail">Email:</label>
        <input
          type="email"
          id="contactMail"
          placeholder="Email"
          value={form.email}
          onChange={handleChange('email')}
        />

        <label htmlFor="contactComment">Comment:</label>
        <textarea
          id="contactComment"
          placeholder="Your questions or queries or both"
          value={form.comment}
          onChange={handleChange('comment')}
        />

        <button type="submit" className="contact-submit-btn">Send</button>
      </form>
    </div>
  )
}

export default Contact