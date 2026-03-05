import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import './EventList.css';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events/');
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await API.delete(`/events/${id}/`);
      setEvents(events.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return <div className="spinner-wrapper"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="content-header">
        <div className="header-text">
          <h1>Training Events</h1>
          <p>Manage and track your upcoming professional sessions</p>
        </div>
        <Link to="/events/new" className="action-btn-primary">
          <i className="bi bi-plus-lg"></i> New Event
        </Link>
      </header>

      {events.length === 0 ? (
        <div className="empty-display">
          <div className="empty-icon-wrapper">
            <i className="bi bi-calendar-x"></i>
          </div>
          <h3>No events found</h3>
          <p>Ready to start? Create your first training event now.</p>
          <Link to="/events/new" className="action-btn-primary mt-3">Get Started</Link>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <article key={event.id} className="event-item-card">
              <div className="card-top">
                <h2 className="event-title">{event.title}</h2>
                <div className="event-meta">
                  <span><i className="bi bi-calendar3"></i> {event.date}</span>
                  <span><i className="bi bi-geo-alt"></i> {event.venue}</span>
                </div>
              </div>

              <div className="card-middle">
                <p className="description">
                  {event.description || 'No description provided for this event.'}
                </p>
                <div className="stats-pills">
                  <span className="pill pill-total">{event.total_nominees} Nominees</span>
                  <span className="pill pill-success">{event.accepted_count} Accepted</span>
                  <span className="pill pill-warning">{event.pending_count} Pending</span>
                </div>
              </div>

              <footer className="card-actions-row">
                <Link to={`/events/${event.id}/nominees`} className="btn-view-nominees">
                  <i className="bi bi-people-fill"></i> View Nominees
                </Link>
                <div className="action-icons">
                  <Link to={`/events/${event.id}/edit`} className="btn-edit" title="Edit Event">
                    <i className="bi bi-pencil-square"></i>
                  </Link>
                  <button className="btn-delete" onClick={() => handleDelete(event.id, event.title)} title="Delete Event">
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;