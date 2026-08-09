import { useState } from 'react';
import './Header.css'

function Nav({ setPage, currentPage, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigation = (e, pageName) => {
    e.preventDefault()
    setPage(pageName)
    setMenuOpen(false)
  }

  const linkClass = (pageName) => (currentPage === pageName ? 'active' : '');

  return (
    <nav>
      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span><span></span><span></span>
      </button>

      <ul className={menuOpen ? 'nav-open' : ''}>
        <li><a href="/books" className={linkClass('Books')} onClick={(e) => handleNavigation(e, 'Books')}>Books</a></li>
        <li><a href="/about" className={linkClass('About')} onClick={(e) => handleNavigation(e, 'About')}>About Us</a></li>

        {user?.role === 'admin' ? (
          <li><a href="/admin" className={linkClass('AdminBooks')} onClick={(e) => handleNavigation(e, 'AdminBooks')}>Manage Listings</a></li>
        ) : (
          <>
            {user && <li><a href="/my-donations" className={linkClass('MyDonations')} onClick={(e) => handleNavigation(e, 'MyDonations')}>My Donations</a></li>}
            {user && <li><a href="/my-reservations" className={linkClass('MyReservations')} onClick={(e) => handleNavigation(e, 'MyReservations')}>My Reservations</a></li>}
          </>
        )}

        {!user && <li><a href="/login" className={linkClass('Login')} onClick={(e) => handleNavigation(e, 'Login')}>Login</a></li>}
        {!user && <li><a href="/register" className={linkClass('Register')} onClick={(e) => handleNavigation(e, 'Register')}>Register</a></li>}

        {user && (
          <li><a href="/logout" onClick={(e) => { e.preventDefault(); onLogout(); setMenuOpen(false); }}>Logout ({user.name})</a></li>
        )}
      </ul>
    </nav>
  );
}

export default Nav;