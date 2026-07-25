import './Header.css';
import Nav from './Nav';

function Header({setPage}) {
  return (
    <header>
      <h2>Library Management System</h2>
        <Nav setPage={setPage}/>
    </header>
  )
}


export default Header
