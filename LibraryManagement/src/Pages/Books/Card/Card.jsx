import './Card.css';

function Card({ title, author, description, image, stock, onClick }) {
  const outOfStock = stock <= 0;

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
        {outOfStock && <span className="card-stock-badge">Out of Stock</span>}
      </div>
      <h3>{title}</h3>
      <p><strong>Author:</strong> {author}</p>
      <p>{description}</p>
    </div>
  );
}

export default Card;