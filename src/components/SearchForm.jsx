import React, { useState, useRef } from 'react';
import '../styles/SearchForm.css';

const DEBOUNCE_MS = 300;

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

  // Guards against stale, out-of-order responses overwriting a newer selection
  const requestIdRef = useRef({ from: 0, to: 0 });
  const debounceRef = useRef({ from: null, to: null });

  const runAirportSearch = async (query, type) => {
    const requestId = ++requestIdRef.current[type];
    console.log(`[searchAirport] called: type=${type} query="${query}" requestId=${requestId}`);

    const url = `${BACKEND_URL}/api/search-airport`;
    console.log(`[searchAirport] fetching ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      console.log(`[searchAirport] response status=${response.status} requestId=${requestId}`, data);

      if (requestId !== requestIdRef.current[type]) {
        console.log(`[searchAirport] discarding stale response for "${type}" (requestId=${requestId}, latest=${requestIdRef.current[type]})`);
        return;
      }

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

  const searchAirport = (query, type) => {
    clearTimeout(debounceRef.current[type]);

    if (query.length < 2) {
      console.log(`[searchAirport] query too short, skipping fetch: type=${type} query="${query}"`);
      requestIdRef.current[type]++;
      if (type === 'from') setFromSuggestions([]);
      if (type === 'to') setToSuggestions([]);
      return;
    }

    debounceRef.current[type] = setTimeout(() => runAirportSearch(query, type), DEBOUNCE_MS);
  };

  const selectAirport = (airport, type) => {
    const { code, name } = airport;
    console.log(`[selectAirport] type=${type} name="${name}" code=${code}`);

    clearTimeout(debounceRef.current[type]);
    requestIdRef.current[type]++;

    if (type === 'from') {
      setFromInput(name);
      setFromAirport({ code });
      setFromSuggestions([]);
    } else {
      setToInput(name);
      setToAirport({ code });
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
          fromCode: fromAirport.code,
          toCode: toAirport.code,
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
                {airport.name}
                <span>{airport.code}</span>
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
                {airport.name}
                <span>{airport.code}</span>
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