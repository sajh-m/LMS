import './Header.css'
function Nav({setPage}) {

   const handleNavigation = (e, pageName) => {
    e.preventDefault()
    setPage(pageName)
    console.log(pageName)
  }

  return (
    <nav>
      <ul>
        <li><a href="/about" onClick={(e) => handleNavigation(e, 'About')}>About Us</a></li>
        <li><a href="/books" onClick={(e) => handleNavigation(e, 'Books')}>Books</a></li>
        <li><a href="/contact" onClick={(e) => handleNavigation(e, 'Contact')}>Contact</a></li>
      </ul>
    </nav>
  );
}

export default Nav;