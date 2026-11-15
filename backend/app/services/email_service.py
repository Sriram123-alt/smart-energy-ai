import smtplib
import time
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


class EmailService:
    # SMTP configuration — set these in your .env file
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    FROM_NAME: str = os.getenv("FROM_NAME", "Smart Energy AI")

    @classmethod
    def _is_configured(cls) -> bool:
        """Returns True if SMTP credentials are present in environment."""
        return bool(cls.SMTP_USER and cls.SMTP_PASSWORD)

    @classmethod
    def send_alert_email(cls, email: str, subject: str, body: str) -> dict:
        """
        Sends a real email alert via SMTP (Gmail/Outlook/any SMTP provider).
        Falls back to console mock if SMTP_USER / SMTP_PASSWORD are not set.
        """
        if not cls._is_configured():
            # Graceful mock fallback — no crash when SMTP creds are absent
            print("--- MOCK EMAIL OUTBOX (SMTP not configured) ---")
            print(f"To: {email}")
            print(f"Subject: {subject}")
            print(f"Body:\n{body}")
            print("------------------------------------------------")
            time.sleep(0.1)
            return {
                "success": True,
                "mocked": True,
                "recipient": email,
                "note": "SMTP_USER / SMTP_PASSWORD not set in environment. Email was not actually sent.",
                "dispatched_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            }

        # --- Build MIME message ---
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{cls.FROM_NAME} <{cls.SMTP_USER}>"
        msg["To"] = email

        # Plain-text part
        plain_part = MIMEText(body, "plain", "utf-8")

        # HTML part — styled alert email
        html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background: #0B0F19; margin: 0; padding: 0; }}
    .wrapper {{ max-width: 560px; margin: 40px auto; background: #131929; border-radius: 16px;
                border: 1px solid #1e2d4a; overflow: hidden; }}
    .header  {{ background: linear-gradient(135deg, #10b981, #06b6d4); padding: 28px 32px; }}
    .header h1 {{ color: #fff; font-size: 20px; margin: 0; letter-spacing: -0.3px; }}
    .header p  {{ color: rgba(255,255,255,0.75); font-size: 12px; margin: 4px 0 0; }}
    .body    {{ padding: 28px 32px; color: #cbd5e1; font-size: 14px; line-height: 1.7; }}
    .body pre {{ background: #0b0f19; border: 1px solid #1e2d4a; border-radius: 8px;
                 padding: 16px; font-size: 13px; white-space: pre-wrap; color: #94a3b8; }}
    .footer  {{ padding: 16px 32px; text-align: center; color: #475569; font-size: 11px;
                border-top: 1px solid #1e2d4a; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>⚡ Smart Energy AI Alert</h1>
      <p>Autonomous Grid Intelligence · Anomaly Notification</p>
    </div>
    <div class="body">
      <p>{body.replace(chr(10), '<br/>')}</p>
    </div>
    <div class="footer">
      © 2026 Smart Energy AI Inc. · You are receiving this because email alerts are enabled.<br/>
      To unsubscribe, log in and disable alerts in the Anomaly Detection panel.
    </div>
  </div>
</body>
</html>
"""
        html_part = MIMEText(html_body, "html", "utf-8")

        # Attach both — clients that can't render HTML fall back to plain
        msg.attach(plain_part)
        msg.attach(html_part)

        try:
            with smtplib.SMTP(cls.SMTP_HOST, cls.SMTP_PORT, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(cls.SMTP_USER, cls.SMTP_PASSWORD)
                server.sendmail(cls.SMTP_USER, email, msg.as_string())

            print(f"[EmailService] ✅ Alert email sent to {email} — Subject: {subject}")
            return {
                "success": True,
                "mocked": False,
                "recipient": email,
                "dispatched_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            }

        except smtplib.SMTPAuthenticationError as exc:
            print(f"[EmailService] ❌ SMTP Auth error: {exc}")
            return {
                "success": False,
                "recipient": email,
                "error": "SMTP authentication failed. Check SMTP_USER and SMTP_PASSWORD in your .env file.",
                "dispatched_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            }
        except Exception as exc:
            print(f"[EmailService] ❌ Email send error: {exc}")
            return {
                "success": False,
                "recipient": email,
                "error": str(exc),
                "dispatched_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            }
