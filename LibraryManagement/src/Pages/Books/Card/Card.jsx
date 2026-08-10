import './Card.css';

function Card({ title, author, description, image, location, onClick }) {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="card-cover">
        <img
          src={image ? `http://localhost:3001${image}` : 'https://placehold.co/300x400?text=No+Cover'}
          alt={`Cover of ${title}`}
        />
      </div>
      <h3>{title}</h3>
      <p><strong>Author:</strong> {author}</p>
      <p className="card-location">📍 {location}</p>
      <p>{description}</p>
    </div>
  );
}

export default Card;