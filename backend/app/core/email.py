import resend

from configs.settings import settings

resend.api_key = settings.resend_api_key


def send_reset_email(email: str, token: str):
    # We build the link here
    reset_link = f"{settings.frontend_url}/reset-password?token={token}"

    params = {
        "from": "JobTrackr <onboarding@resend.dev>",
        "to": [email],
        "subject": "Reset your JobTrackr password",
        "html": f"""
            <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password for JobTrackr. Click the button below to proceed:</p>
                <a href="{reset_link}" style="background-color: #0F172A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0;">
                    Reset Password
                </a>
                <p>This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">JobTrackr - Your career, organized.</p>
            </div>
        """,
    }

    try:
        resend.Emails.send(params)
    except Exception as e:
        print(f"Failed to send email: {e}")