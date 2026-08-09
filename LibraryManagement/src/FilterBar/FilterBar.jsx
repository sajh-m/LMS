import './FilterBar.css';

const GENRES = ['fiction', 'non-fiction', 'mystery', 'sci-fi', 'fantasy', 'biography', 'history', 'other'];

function FilterBar({ filters, onChange, showDonorFilter = true }) {
  const update = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <div className="filter-bar">
      <input type="text" placeholder="Title" value={filters.title || ''} onChange={update('title')} />
      <input type="text" placeholder="Author" value={filters.author || ''} onChange={update('author')} />
      <input type="text" placeholder="Location" value={filters.location || ''} onChange={update('location')} />
      {showDonorFilter && (
        <input type="text" placeholder="Donor name" value={filters.donorName || ''} onChange={update('donorName')} />
      )}
      <select value={filters.genre || ''} onChange={update('genre')}>
        <option value="">All genres</option>
        {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
      </select>
    </div>
  );
}

export default FilterBar;