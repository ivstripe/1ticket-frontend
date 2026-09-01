import React, { useState } from 'react';
import '../styles/SearchForm.css';

export default function SearchForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);

   const handleSearch = async () => {
    if (!from || !to || !date) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('https://1ticket-backend-production.up.railway.app/api/search-flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromSkyId: from,
          toSkyId: to,
          date,
          passengers
        })
      });

      const data = await response.json();
      console.log('Results:', data);
      
      if (data.success && data.data.length > 0) {
        alert(`Found ${data.data.length} flights!`);
      } else {
        alert('No flights found for this route');
      }
    } catch (error) {
      alert('Error searching flights: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="search-form">
      <h1>Cheap flights at your fingertips</h1>

      <div className="form-group">
        <label>From (Departure)</label>
        <input
          type="text"
          placeholder="Krakow"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Where to (Destination)</label>
        <input
          type="text"
          placeholder="Barcelona"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Passengers</label>
        <select value={passengers} onChange={(e) => setPassengers(e.target.value)}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
          <option>6</option>
        </select>
      </div>

      <button 
        className="search-btn" 
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Search Flights'}
      </button>
    </div>
  );
}