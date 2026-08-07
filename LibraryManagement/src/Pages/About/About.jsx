import './About.css';

function About() {
  return (
    <div className="about-page">
      <h1 className="Page-title">About</h1>

      <p className="about-lead">
        This is a library management system built using React.
        <br />
        It is a college project as an assessment, designed solely for self-education purposes.
      </p>

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