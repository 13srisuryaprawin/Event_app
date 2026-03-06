import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)

# Reusable Email Styles
STYLES = {
    'container': "font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;",
    'header': "background-color: #1a73e8; color: white; padding: 25px; text-align: center;",
    'body': "padding: 30px; line-height: 1.6; color: #3c4043;",
    'card': "background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; border-left: 4px solid #1a73e8;",
    'btn_accept': "display: inline-block; background-color: #1e8e3e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-right: 10px;",
    'btn_reject': "display: inline-block; background-color: #d93025; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;",
    'btn_feedback': "display: inline-block; background-color: #1a73e8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;",
    'footer': "padding: 20px; text-align: center; font-size: 12px; color: #70757a; background-color: #f1f3f4;"
}

def send_invitation_email(nominee):
    event = nominee.event
    accept_url = f"{settings.BACKEND_URL}/api/nominee/{nominee.id}/accept/"
    reject_url = f"{settings.BACKEND_URL}/api/nominee/{nominee.id}/reject/"

    subject = f"Action Required: Your Invitation for {event.title}"
    
    text_message = f"""
Greetings {nominee.name},

You have been selected to participate in an upcoming session: {event.title}.

Details:
- Schedule: {event.date.strftime('%B %d, %Y')} at {event.time.strftime('%I:%M %p')}
- Location: {event.venue}

Description: {event.description}

Please confirm your attendance:
Accept: {accept_url}
Decline: {reject_url}
"""

    html_message = f"""
<div style="{STYLES['container']}">
    <div style="{STYLES['header']}">
        <h2 style="margin:0;">Training Invitation</h2>
    </div>
    <div style="{STYLES['body']}">
        <p>Hello <strong>{nominee.name}</strong>,</p>
        <p>We are pleased to invite you to the following professional development session:</p>
        
        <div style="{STYLES['card']}">
            <h3 style="margin-top:0; color:#1a73e8;">{event.title}</h3>
            <p style="margin: 5px 0;"><strong>When:</strong> {event.date.strftime('%B %d, %Y')} | {event.time.strftime('%I:%M %p')}</p>
            <p style="margin: 5px 0;"><strong>Where:</strong> {event.venue}</p>
            <p style="margin: 15px 0 0 0; font-style: italic; color: #5f6368;">{event.description}</p>
        </div>

        <p>Will you be attending? Please let us know by selecting an option below:</p>
        <div style="margin-top: 25px;">
            <a href="{accept_url}" style="{STYLES['btn_accept']}">Confirm Attendance</a>
            <a href="{reject_url}" style="{STYLES['btn_reject']}">Decline</a>
        </div>
    </div>
    <div style="{STYLES['footer']}">
        Sent by Training Management Portal
    </div>
</div>
"""
    try:
        email = EmailMultiAlternatives(subject, text_message, settings.DEFAULT_FROM_EMAIL, [nominee.email])
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)
        logger.info(f"✓ Invitation email sent to {nominee.email}")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to send invitation: {e}")
        return False


def send_status_notification_to_admin(nominee, status):
    event = nominee.event
    subject = f"Update: {nominee.name} {status}ed — {event.title}"
    
    text_message = f"Admin Alert: {nominee.name} has marked their status as '{status}' for {event.title}."

    html_message = f"""
<div style="{STYLES['container']}">
    <div style="padding: 20px; border-bottom: 1px solid #eee;">
        <h3 style="margin:0; color: #3c4043;">RSVP Update</h3>
    </div>
    <div style="padding: 20px;">
        <p>A nominee has updated their participation status:</p>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #70757a;">Event:</td><td><strong>{event.title}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #70757a;">Nominee:</td><td>{nominee.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #70757a;">Response:</td><td><span style="color: {'#1e8e3e' if status.lower() == 'accept' else '#d93025'}; font-weight: bold;">{status.upper()}</span></td></tr>
            <tr><td style="padding: 8px 0; color: #70757a;">Department:</td><td>{nominee.department}</td></tr>
        </table>
    </div>
</div>
"""
    try:
        email = EmailMultiAlternatives(subject, text_message, settings.DEFAULT_FROM_EMAIL, [settings.ADMIN_EMAIL])
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"✗ Admin notification failed: {e}")
        return False


def send_feedback_email(nominee):
    event = nominee.event
    feedback_url = f"{settings.FRONTEND_URL}/feedback/{nominee.id}"

    subject = f"Your thoughts? Feedback for {event.title}"
    text_message = f"Thank you for attending {event.title}. Please provide your feedback here: {feedback_url}"

    html_message = f"""
<div style="{STYLES['container']}">
    <div style="{STYLES['header']}; background-color: #5f6368;">
        <h2 style="margin:0;">Workshop Feedback</h2>
    </div>
    <div style="{STYLES['body']}; text-align: center;">
        <p>Hello {nominee.name},</p>
        <p>We hope you found the <strong>{event.title}</strong> session insightful.</p>
        <p>To help us enhance our future programs, could you please share your experience?</p>
        
        <div style="margin: 30px 0;">
            <a href="{feedback_url}" style="{STYLES['btn_feedback']}">Complete Feedback Form</a>
        </div>
        
        <p style="font-size: 13px; color: #70757a;">It will only take 2 minutes of your time.</p>
    </div>
</div>
"""
    try:
        email = EmailMultiAlternatives(subject, text_message, settings.DEFAULT_FROM_EMAIL, [nominee.email])
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"✗ Feedback email failed: {e}")
        return False