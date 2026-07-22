import './Card.css'

function Card({ title, author, description }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p><strong>Author:</strong> {author}</p>
      <p>{description}</p>
    </div>
  );
}

export default Card;