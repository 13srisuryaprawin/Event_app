import { useSearchParams } from 'react-router-dom';
import './NomineeResponse.css';

function NomineeResponse() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const name = searchParams.get('name');
  const event = searchParams.get('event');

  const getContent = () => {
    switch (status) {
      case 'accepted':
        return {
          icon: '✅',
          iconClass: 'accepted',
          title: 'Invitation Accepted!',
          message: `Thank you, ${name}! You have accepted the invitation for "${event}". We look forward to seeing you there!`,
        };
      case 'rejected':
        return {
          icon: '❌',
          iconClass: 'rejected',
          title: 'Invitation Declined',
          message: `${name}, your response has been recorded. Thank you for letting us know about "${event}".`,
        };
      case 'already':
        return {
          icon: '⚠️',
          iconClass: 'already',
          title: 'Already Responded',
          message: `${name}, you have already responded to this invitation. No further action is needed.`,
        };
      default:
        return {
          icon: '❓',
          iconClass: 'already',
          title: 'Invalid Link',
          message: 'This link appears to be invalid or has expired.',
        };
    }
  };

  const content = getContent();

  return (
    <div className="response-wrapper">
      <div className="response-card">
        <div className={`response-icon ${content.iconClass}`}>
          <span className="icon-text">{content.icon}</span>
        </div>
        <h4 className="fw-bold mb-3">{content.title}</h4>
        <p className="text-muted">{content.message}</p>
      </div>
    </div>
  );
}

export default NomineeResponse;