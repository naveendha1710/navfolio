# backend/main.py
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from openpyxl import load_workbook, Workbook
from email.message import EmailMessage
import smtplib
import os

app = FastAPI(title="Portfolio Lead Collector & Resume Sender")

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://192.168.1.7:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTLOOK_EMAIL = "nav.cs@outlook.com"
# Put your 16-character Microsoft App Password in the environment variable OUTLOOK_APP_PASSWORD
# or replace "YOUR_16_CHAR_MICROSOFT_APP_PASSWORD" below with your generated app password.
OUTLOOK_APP_PASSWORD = os.getenv("OUTLOOK_APP_PASSWORD", "YOUR_16_CHAR_MICROSOFT_APP_PASSWORD")

EXCEL_FILE = os.path.join(os.path.dirname(__file__), "portfolio_leads.xlsx")
RESUME_PATH = os.path.join(os.path.dirname(__file__), "Resume.pdf")

def append_to_excel(user_email: str):
    if not os.path.exists(EXCEL_FILE):
        wb = Workbook()
        ws = wb.active
        ws.title = "Leads"
        ws.append(["Timestamp", "Email"])
        wb.save(EXCEL_FILE)

    wb = load_workbook(EXCEL_FILE)
    ws = wb.active
    ws.append([datetime.now().strftime("%Y-%m-%d %H:%M:%S"), user_email])
    wb.save(EXCEL_FILE)

def send_resume_email(recipient_email: str):
    """Sends resume email to ANY recipient using nav.cs@outlook.com SMTP."""
    msg = EmailMessage()
    msg['Subject'] = "Thanks for connecting! | My Portfolio & Resume"
    msg['From'] = f"Nav <{OUTLOOK_EMAIL}>"
    msg['To'] = recipient_email
    
    body = """Hi there,

Thanks for checking out my portfolio! As requested, I have attached my resume to this email. 

Let me know if you have any questions or would like to schedule a quick chat regarding any development opportunities.

Best regards,
Nav"""
    msg.set_content(body)

    # Attach PDF resume if available in backend directory
    if os.path.exists(RESUME_PATH):
        with open(RESUME_PATH, "rb") as f:
            msg.add_attachment(
                f.read(),
                maintype='application',
                subtype='pdf',
                filename="Nav_Resume.pdf"
            )

    with smtplib.SMTP("smtp-mail.outlook.com", 587) as server:
        server.starttls()
        server.login(OUTLOOK_EMAIL, OUTLOOK_APP_PASSWORD)
        server.send_message(msg)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Portfolio Lead API is running."}

@app.post("/api/contact")
async def handle_contact(email: str = Form(...)):
    try:
        append_to_excel(email)
        try:
            send_resume_email(email)
            email_sent = True
        except Exception as mail_err:
            print(f"[Warning] Excel logged, but email sending failed: {mail_err}")
            email_sent = False

        return {
            "status": "success",
            "message": "Email logged and resume sent." if email_sent else "Email logged successfully.",
            "email_sent": email_sent
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
