import React, { useState } from 'react';
import '../styles/SearchForm.css';

export default function SearchForm() {
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://1ticket-backend-production.up.railway.app';

  const searchAirport = async (query, type) => {
    console.log(`[searchAirport] called: type=${type} query="${query}"`);

    if (query.length < 2) {
      console.log('[searchAirport] query too short, skipping fetch');
      return;
    }

    const url = `${BACKEND_URL}/api/search-airport`;
    console.log(`[searchAirport] fetching ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      console.log(`[searchAirport] response status=${response.status}`, data);

      if (!response.ok || !data.success) {
        console.error('[searchAirport] backend returned an error:', data.error || data.message || 'unknown error');
        if (type === 'from') setFromSuggestions([]);
        if (type === 'to') setToSuggestions([]);
        return;
      }

      console.log(`[searchAirport] storing ${data.data.length} suggestions for "${type}"`);
      if (type === 'from') setFromSuggestions(data.data);
      if (type === 'to') setToSuggestions(data.data);
    } catch (error) {
      console.error('[searchAirport] fetch failed:', error);
    }
  };

  const selectAirport = (airport, type) => {
    const skyId = airport.navigation.relevantFlightParams.skyId;
    const entityId = airport.navigation.relevantFlightParams.entityId;
    const name = airport.presentation.suggestionTitle;
    console.log(`[selectAirport] type=${type} name="${name}" skyId=${skyId} entityId=${entityId}`);

    if (type === 'from') {
      setFromInput(name);
      setFromAirport({ skyId, entityId });
      setFromSuggestions([]);
    } else {
      setToInput(name);
      setToAirport({ skyId, entityId });
      setToSuggestions([]);
    }
  };

  const handleSearch = async () => {
    if (!fromAirport || !toAirport || !date) {
      alert('Please select departure and destination airports');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/search-flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromSkyId: fromAirport.skyId,
          fromEntityId: fromAirport.entityId,
          toSkyId: toAirport.skyId,
          toEntityId: toAirport.entityId,
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
      alert('Error: ' + error.message);
    }

    setLoading(false);
  };

  console.log(`[render] fromSuggestions=${fromSuggestions.length} toSuggestions=${toSuggestions.length}`);

  return (
    <div className="search-form">
      <h1>Cheap flights at your fingertips</h1>

      {/* FROM FIELD */}
      <div className="form-group">
        <label>From (Departure)</label>
        <input
          type="text"
          placeholder="Type city or airport..."
          value={fromInput}
          onChange={(e) => {
            setFromInput(e.target.value);
            setFromAirport(null);
            searchAirport(e.target.value, 'from');
          }}
        />
        {fromSuggestions.length > 0 && (
          <div className="suggestions">
            {fromSuggestions.map((airport, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => selectAirport(airport, 'from')}
              >
                {airport.presentation.suggestionTitle}
                <span>{airport.presentation.subtitle}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TO FIELD */}
      <div className="form-group">
        <label>Where to (Destination)</label>
        <input
          type="text"
          placeholder="Type city or airport..."
          value={toInput}
          onChange={(e) => {
            setToInput(e.target.value);
            setToAirport(null);
            searchAirport(e.target.value, 'to');
          }}
        />
        {toSuggestions.length > 0 && (
          <div className="suggestions">
            {toSuggestions.map((airport, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => selectAirport(airport, 'to')}
              >
                {airport.presentation.suggestionTitle}
                <span>{airport.presentation.subtitle}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DATE */}
      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* PASSENGERS */}
      <div className="form-group">
        <label>Passengers</label>
        <select
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
        >
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