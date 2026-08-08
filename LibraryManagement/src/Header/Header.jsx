import './Header.css';
import Nav from './Nav';

function Header({ setPage, currentPage, user, onLogout }) {
  return (
    <header>
      <h2>Library Management System</h2>
      <Nav setPage={setPage} currentPage={currentPage} user={user} onLogout={onLogout} />
    </header>
  )
}

export default Header