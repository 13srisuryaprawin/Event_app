import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, CheckCircle, Clock, Award, Calendar, MapPin } from 'lucide-react';
import API from '../api/axios';
import './Dashboard.css';

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nomineesLoading, setNomineesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events/');
      setEvents(res.data);
      if (res.data.length > 0) {
        selectEvent(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectEvent = async (event) => {
    setSelectedEvent(event);
    setNomineesLoading(true);
    try {
      const res = await API.get(`/events/${event.id}/nominees/`);
      setNominees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setNomineesLoading(false);
    }
  };

  const filteredNominees = nominees.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loader-container"><div className="spinner-royal"></div></div>;

  return (
    <div className="dashboard-royal-container">
      <header className="dashboard-header">
        <div className="header-main">
          <h1>Analytics Dashboard</h1>
          <p>Real-time overview of your training programs</p>
        </div>
        <Link to="/events/new" className="btn-royal-primary">
          <Plus size={18} /> New Event
        </Link>
      </header>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Attended">Attended</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {events.length === 0 ? (
        <div className="empty-dashboard">
          <Calendar size={48} />
          <h3>No events found</h3>
          <p>Create your first event to start tracking performance.</p>
          <Link to="/events/new" className="btn-royal-primary mt-3">Get Started</Link>
        </div>
      ) : (
        <>
          <nav className="event-selector-tabs">
            {events.map((event) => (
              <button
                key={event.id}
                className={`event-tab ${selectedEvent?.id === event.id ? 'active' : ''}`}
                onClick={() => selectEvent(event)}
              >
                {event.title}
              </button>
            ))}
          </nav>

          {selectedEvent && (
            <div className="dashboard-content-grid">
              <div className="stats-row">
                <div className="stat-card-royal">
                  <div className="stat-icon-box blue"><Users size={20} /></div>
                  <div className="stat-data">
                    <span className="stat-val">{selectedEvent.total_nominees}</span>
                    <span className="stat-lbl">Total Nominees</span>
                  </div>
                </div>
                <div className="stat-card-royal">
                  <div className="stat-icon-box green"><CheckCircle size={20} /></div>
                  <div className="stat-data">
                    <span className="stat-val">{selectedEvent.accepted_count}</span>
                    <span className="stat-lbl">Accepted</span>
                  </div>
                </div>
                <div className="stat-card-royal">
                  <div className="stat-icon-box orange"><Clock size={20} /></div>
                  <div className="stat-data">
                    <span className="stat-val">{selectedEvent.pending_count}</span>
                    <span className="stat-lbl">Pending</span>
                  </div>
                </div>
                <div className="stat-card-royal">
                  <div className="stat-icon-box purple"><Award size={20} /></div>
                  <div className="stat-data">
                    <span className="stat-val">{selectedEvent.attended_count}</span>
                    <span className="stat-lbl">Attended</span>
                  </div>
                </div>
              </div>

              <div className="details-panel">
                <div className="panel-card info-panel">
                  <div className="panel-header"><h3>Event Intelligence</h3></div>
                  <div className="info-grid">
                    <div className="info-item">
                      <Calendar size={16} />
                      <div><small>Scheduled Date</small><strong>{selectedEvent.date}</strong></div>
                    </div>
                    <div className="info-item">
                      <MapPin size={16} />
                      <div><small>Venue Location</small><strong>{selectedEvent.venue}</strong></div>
                    </div>
                  </div>
                  {selectedEvent.description && (
                    <div className="info-desc">
                      <small>Program Summary</small>
                      <p>{selectedEvent.description}</p>
                    </div>
                  )}
                </div>

                <div className="panel-card table-panel">
                  <div className="panel-header">
                    <h3>Nominee Roll ({nominees.length})</h3>
                    {nomineesLoading && <div className="mini-loader"></div>}
                  </div>
                  <div className="table-responsive-wrapper">
                    <table className="royal-data-table">
                      <thead>
                        <tr>
                          <th>Nominee</th>
                          <th>Department</th>
                          <th>Status</th>
                          <th>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredNominees.length > 0 ? (
                          filteredNominees.map((n) => (
                            <tr key={n.id}>
                              <td>
                                <div className="td-name">{n.name}</div>
                                <div className="td-sub">{n.email}</div>
                              </td>
                              <td><span className="dept-tag">{n.department}</span></td>
                              <td>
                                <span className={`status-pill pill-${n.status.toLowerCase()}`}>
                                  {n.status}
                                </span>
                              </td>
                              <td className="rating-cell">
                                {n.feedback ? "★".repeat(n.feedback.rating) : <span className="no-data">—</span>}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="no-user-found">No users found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;