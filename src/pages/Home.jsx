import React from 'react';
import SearchForm from '../components/SearchForm';
import '../styles/Home.css';

export default function Home() {
  return (
    <div className="home">
      <SearchForm />
      
      <div className="quick-filters">
        <button className="filter-btn">🔥 Hot Tickets</button>
        <button className="filter-btn">🌍 Anywhere</button>
        <button className="filter-btn">🔗 Multi-city</button>
      </div>

      <div className="featured-section">
        <h2>Popular Routes</h2>
        <p>Coming soon...</p>
      </div>

      <div className="bottom-nav">
        <button className="nav-btn active">✈️ Flights</button>
        <button className="nav-btn">🏨 Hotels</button>
        <button className="nav-btn">⭐ Experiences</button>
      </div>
    </div>
  );
}