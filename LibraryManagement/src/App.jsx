import Header from './Header/Header'
import About from './About/About'
import {useState} from 'react'
import Card from './Card/Card'
import Contact from './Contact/Contact'

function App() {
const [page, setPage] = useState('About')

  return (
    <>
      <Header setPage={setPage}/>
      {page === 'About' && <About />}
      {page === 'Books' && <Card title="Glory" author='Me' description='The best book in town'/>}
      {page === 'Contact' && <Contact />}
      
    </>
  )
}

export default App