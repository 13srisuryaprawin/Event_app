import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./NomineeList.css";

function NomineeList() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, nomineesRes] = await Promise.all([
        API.get(`/events/${eventId}/`), 
        API.get(`/events/${eventId}/nominees/`)
      ]);
      setEvent(eventRes.data);
      setNominees(nomineesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (nomineeId) => {
    setActionLoading({ ...actionLoading, [nomineeId]: true });
    try {
      const res = await API.put(`/nominee/${nomineeId}/attend/`);
      setNominees(nominees.map((n) => (n.id === nomineeId ? res.data : n)));
      showMessage("success", "Attendance marked successfully.");
    } catch (err) {
      showMessage("danger", "Failed to mark attendance.");
    } finally {
      setActionLoading({ ...actionLoading, [nomineeId]: false });
    }
  };

  const deleteNominee = async (nomineeId) => {
    if (!window.confirm("Delete this nominee?")) return;
    setActionLoading({ ...actionLoading, [nomineeId]: true });
    try {
      await API.delete(`/nominees/${nomineeId}/`);
      setNominees(nominees.filter((n) => n.id !== nomineeId));
      fetchData();
      showMessage("success", "Nominee removed.");
    } catch (err) {
      showMessage("danger", "Failed to delete.");
    } finally {
      setActionLoading({ ...actionLoading, [nomineeId]: false });
    }
  };

  const sendFeedbackEmails = async () => {
    setActionLoading({ ...actionLoading, feedback: true });
    try {
      const res = await API.post(`/events/${eventId}/send-feedback/`);
      showMessage("success", res.data.message);
    } catch (err) {
      showMessage("danger", "Failed to send emails.");
    } finally {
      setActionLoading({ ...actionLoading, feedback: false });
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await API.get(`/event/${eventId}/feedback/download/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feedback_${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showMessage('success', 'Report downloaded.');
    } catch (err) {
      showMessage('danger', 'Download failed.');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  if (loading) return <div className="loader-container"><div className="spinner-royal"></div></div>;

  const attendedCount = nominees.filter(n => n.status === "Attended").length;

  return (
    <div className="nominee-page-wrapper">
      <nav className="breadcrumb-nav">
        <button onClick={() => navigate("/events")} className="btn-back-link">
          <i className="bi bi-arrow-left"></i> Back to Events
        </button>
      </nav>

      <header className="nominee-header">
        <div className="header-info">
          <h1>Event Nominees</h1>
          <div className="event-badge-title">
            <i className="bi bi-award"></i> {event?.title}
          </div>
        </div>

        <div className="header-actions-group">
          {attendedCount > 0 && (
            <div className="utility-buttons">
              <button className="btn-utility" onClick={downloadCSV} title="Download CSV Report">
                <i className="bi bi-file-earmark-spreadsheet"></i> Download Report
              </button>
              <button className="btn-utility" onClick={sendFeedbackEmails} disabled={actionLoading.feedback}>
                <i className={`bi ${actionLoading.feedback ? 'spinner-border spinner-border-sm' : 'bi-envelope-paper'}`}></i> Send
                {actionLoading.feedback ? ' Sending...' : ' Feedback'} 
              </button>
            </div>
          )}
          <Link to={`/events/${eventId}/nominees/add`} className="btn-add-nominee">
            <i className="bi bi-person-plus-fill"></i> Add Nominees
          </Link>
        </div>
      </header>

      {message.text && (
        <div className={`toast-notification status-${message.type}`}>
          <i className="bi bi-info-circle-fill"></i> {message.text}
        </div>
      )}

      <div className="table-card-container">
        {nominees.length === 0 ? (
          <div className="empty-table-state">
            <i className="bi bi-people"></i>
            <p>No nominees listed yet.</p>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="royal-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nominee Details</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Feedback Rating</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {nominees.map((n, i) => (
                  <tr key={n.id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="user-cell">
                        <span className="user-name">{n.name}</span>
                        <span className="user-sub">{n.email} • {n.employee_id}</span>
                      </div>
                    </td>
                    <td><span className="dept-tag">{n.department}</span></td>
                    <td>
                      <span className={`status-pill pill-${n.status.toLowerCase()}`}>
                        {n.status}
                      </span>
                    </td>
                    <td>
                      {n.feedback ? (
                        <div className="rating-stars">
                          {"★".repeat(n.feedback.rating)}{"☆".repeat(5 - n.feedback.rating)}
                          <span className="rating-num">({n.feedback.rating})</span>
                        </div>
                      ) : <span className="no-data">N/A</span>}
                    </td>
                    <td className="text-right">
                      <div className="row-actions">
                        
                        {n.status === "Accepted" && (
                          <button 
                            className="action-btn-check" 
                            onClick={() => markAttendance(n.id)}
                            disabled={actionLoading[n.id]}
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                        )}
                        <button 
                          className="action-btn-del" 
                          onClick={() => deleteNominee(n.id)}
                          disabled={actionLoading[n.id]}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default NomineeList;