import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import './EventForm.css';

function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchEvent = async () => {
        try {
          const res = await API.get(`/events/${id}/`);
          setForm(res.data);
        } catch (err) {
          setError('Failed to load event data.');
        }
      };
      fetchEvent();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await API.put(`/events/${id}/`, form);
      } else {
        await API.post('/events/', form);
      }
      navigate('/events'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="event-form-wrapper">
        <div className="form-header">
          <h2>{isEdit ? 'Update Royal Event' : 'Create New Event'}</h2>
          <p>{isEdit ? 'Modify the details of your scheduled event.' : 'Fill in the details below to schedule your royal event.'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Annual Gala 2026"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Event Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Event Time</label>
            <input
              id="time"
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="venue">Venue</label>
            <input
              id="venue"
              name="venue"
              type="text"
              value={form.venue}
              onChange={handleChange}
              placeholder="Main Ballroom"
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Event Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the purpose and details of the event..."
            ></textarea>
          </div>

          <div className="form-actions full-width">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate('/events')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary-action" 
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;