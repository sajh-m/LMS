import './Header.css';
import Nav from './Nav';

function Header({ setPage, currentPage }) {
  return (
    <header>
      <h2>Library Management System</h2>
      <Nav setPage={setPage} currentPage={currentPage} />
    </header>
  )
}

export default Header