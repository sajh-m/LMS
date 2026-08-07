import './index.css'
import Header from './Header/Header'
import About from './Pages/About/About'
import {useState} from 'react'
import Books from './Pages/Books/Books'
import Contact from './Contact/Contact'

function App() {
const [page, setPage] = useState('About')

  return (
    <>
      <Header setPage={setPage}/>
      {page === 'About' && <About />}
      {page === 'Books' && <Books />}
      {page === 'Contact' && <Contact />}
      
    </>
  )
}

export default App