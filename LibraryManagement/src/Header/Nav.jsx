import './Header.css'

function Nav({ setPage, currentPage }) {
  const handleNavigation = (e, pageName) => {
    e.preventDefault()
    setPage(pageName)
  }

  const linkClass = (pageName) => (currentPage === pageName ? 'active' : '');

  return (
    <nav>
      <ul>
        <li><a href="/books" className={linkClass('Books')} onClick={(e) => handleNavigation(e, 'Books')}>Books</a></li>
        <li><a href="/about" className={linkClass('About')} onClick={(e) => handleNavigation(e, 'About')}>About Us</a></li>
        <li><a href="/contact" className={linkClass('Contact')} onClick={(e) => handleNavigation(e, 'Contact')}>Contact</a></li>
      </ul>
    </nav>
  );
}

export default Nav;