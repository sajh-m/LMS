import './Header.css'

function Nav({ setPage, currentPage, user, onLogout }) {
  const handleNavigation = (e, pageName) => {
    e.preventDefault()
    setPage(pageName)
  }

  const linkClass = (pageName) => (currentPage === pageName ? 'active' : '');

  return (
    <nav>
      <ul>
        <li><a href="/books" className={linkClass('Books')} onClick={(e) => handleNavigation(e, 'Books')}>Books</a></li>
        <li><a href="/about" className={linkClass('About')} onClick={(e) => handleNavigation(e, 'About')}>About</a></li>

        {user && (
          <li><a href="/my-donations" className={linkClass('MyDonations')} onClick={(e) => handleNavigation(e, 'MyDonations')}>My Donations</a></li>
        )}

        {!user && (
          <li><a href="/login" className={linkClass('Login')} onClick={(e) => handleNavigation(e, 'Login')}>Login</a></li>
        )}
        {!user && (
          <li><a href="/register" className={linkClass('Register')} onClick={(e) => handleNavigation(e, 'Register')}>Register</a></li>
        )}

        {user && (
          <li>
            <a href="/logout" onClick={(e) => { e.preventDefault(); onLogout(); }}>
              Logout ({user.name})
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Nav;