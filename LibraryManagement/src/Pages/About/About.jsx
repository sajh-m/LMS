import './About.css';

function About() {
  return (
    <div className="about-page">
      <h1 className="Page-title">About</h1>

      <section className="about-section">
        <h2 className="about-heading">About This Website</h2>
        <p className="about-lead">
          This is a community library — a place for people who love reading to pass
          books on to each other instead of letting them sit on a shelf. Donate a book
          you've finished, take one someone else is ready to part with, and along the
          way, maybe meet a few people in your area who read the same things you do.
          It's less about managing a catalog and more about making it easy for a book
          to keep finding new readers.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-heading">About Me</h2>
        <p className="about-lead">A typical undergrad trying to learn web development.</p>
      </section>

      <div className="about-record">
        <span className="about-record-label">Contact</span>
        <a className="about-record-value" href="mailto:np03cy4a250041@heraldcollege.edu.np">
          np03cy4a250041@heraldcollege.edu.np
        </a>
      </div>
    </div>
  )
}

export default About