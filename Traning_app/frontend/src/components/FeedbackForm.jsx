import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import "./FeedbackForm.css";

function FeedbackForm() {
  const { nomineeId } = useParams();
  const [nomineeInfo, setNomineeInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNomineeInfo();
  }, [nomineeId]);

  const fetchNomineeInfo = async () => {
    try {
      const res = await API.get(`/feedback/${nomineeId}/info/`);
      setNomineeInfo(res.data);
      if (res.data.has_feedback) {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.response?.status === 400 
        ? (err.response.data.error || "Feedback is not available.") 
        : "Unable to load feedback form.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setSubmitting(true);
    try {
      await API.post(`/feedback/${nomineeId}/`, { rating, comments, suggestions });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="feedback-wrapper">
      <div className="loader"></div>
    </div>
  );

  if (submitted) return (
    <div className="feedback-wrapper">
      <div className="feedback-card success-view">
        <div className="status-emoji">🎉</div>
        <h2>Thank You!</h2>
        <p>Your feedback has been submitted successfully. We appreciate your time!</p>
      </div>
    </div>
  );

  return (
    <div className="feedback-wrapper">
      <div className="feedback-card">
        <header className="feedback-header">
          <div className="header-emoji">📝</div>
          <h1>Training Feedback</h1>
          {nomineeInfo && (
            <div className="nominee-details">
              <p className="event-name">{nomineeInfo.event_title}</p>
              <p className="welcome-text">Hi {nomineeInfo.nominee_name}, please share your experience.</p>
            </div>
          )}
        </header>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="rating-section">
            <label>Overall Rating *</label>
            <div className="star-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-button ${star <= (hoverRating || rating) ? "active" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="rating-label">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating || hoverRating]}
            </p>
          </div>

          <div className="form-group">
            <label>Comments</label>
            <textarea 
              placeholder="Share your thoughts about the training..." 
              value={comments} 
              onChange={(e) => setComments(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Suggestions</label>
            <textarea 
              placeholder="Any suggestions for improvement..." 
              value={suggestions} 
              onChange={(e) => setSuggestions(e.target.value)} 
            />
          </div>

          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;