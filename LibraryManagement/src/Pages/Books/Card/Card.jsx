import "./Card.css";

function Card({
  title,
  author,
  description,
  image,
  location,
  pendingRequestCount,
  onClick,
}) {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="card"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="card-cover">
        <img
          // In Card.jsx and BookDetail.jsx
          src={
            image
              ? image.startsWith("http")
                ? image
                : `${import.meta.env.VITE_API_URL}${image}`
              : "https://placehold.co/300x400?text=No+Cover"
          }
          alt={`Cover of ${title}`}
        />
        {pendingRequestCount > 0 && (
          <span className="card-request-badge">
            {pendingRequestCount} request{pendingRequestCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <h3>{title}</h3>
      <p>
        <strong>Author:</strong> {author}
      </p>
      <p className="card-location">📍 {location}</p>
      <p>{description}</p>
    </div>
  );
}

export default Card;
