#!/usr/bin/env python3
"""Send a test Retell webhook with a sample transcript to localhost."""

import json
import urllib.request
import urllib.error
import os

# Read WEBHOOK_SECRET from .env
secret = ''
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
try:
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line.startswith('WEBHOOK_SECRET='):
                secret = line.split('=', 1)[1].strip()
                break
except FileNotFoundError:
    print('ERROR: .env file not found. Run from ~/transplant-command/')
    exit(1)

if not secret:
    print('ERROR: WEBHOOK_SECRET not found in .env')
    exit(1)

TRANSCRIPT = """agent: Hello.
user: Hello?
user: Hey there.
agent: Hello, may I
user: Hello. May I
agent: speak with Manpreet?
user: speak with This is her.
agent: Thanks. For privacy, can you please confirm your full name?
user: Yeah. Manfreet Kaur.
agent: Got it. And can you confirm your date of birth?
user: Yes. That's September seventh twenty twenty one.
agent: I want to make sure I document this correctly. Did you mean September 7, 2001, or a different year?
user: Two thousand twenty one.
user: twenty one.
agent: Okay. I'm calling regarding your referral for a kidney transplant evaluation.

Before we go further, I'm not able to complete this screening with a date of birth in 2021. This may be a documentation error in the referral.

What is your correct date of birth (month, day, and year)?
user: September seventh nineteen twenty one.
agent: Thank you. And just to confirm, that's September 7, 1921, correct?
user: Yes.
agent: Okay. Before we begin, is this a good time for a brief call? It should take about 15 minutes.
user: Yeah.
agent: Okay. Who is your kidney doctor, your nephrologist?
user: Doctor Srinivasan.
agent: Got it. What caused your kidney disease?
user: Glomerulonephritis.
agent: Okay. Have you ever had a kidney biopsy?
user: Yes. I did.
agent: What month and year was the kidney biopsy done?
user: It was done three years ago.
agent: Okay. About what month was it, and what year would that be—was it around 2023?
user: Yeah.
agent: Got it. Are you currently on dialysis?
user: I am.
agent: Is it hemodialysis or peritoneal dialysis?
user: Peritoneal dialysis,
agent: When did you start peritoneal dialysis?
user: Three years ago.
agent: What month did you start, and was that in 2023 as well?
user: February.
agent: Okay, February 2023. Do you use a cycler at night?
user: Yes.
agent: Do you also do manual exchanges during the day?
user: I do one for like twelve hours.
agent: How many manual exchanges do you do during the day?
user: Annual exchanges. Just one.
agent: Okay. How many liters do you put in for that manual exchange?
user: I think I put in 2 l.
agent: Okay. And for that manual exchange, how long is the dwell time—about 12 hours, correct?
user: Yeah.
agent: Got it. On the cycler at night, how many cycles or exchanges do you do?
user: Four.
agent: And how many liters per fill on the cycler—also 2 liters?
user: Yes.
agent: Okay. What color bags do you use on the cycler at night?
user: Um, mostly green. Every once in a while, a yellow.
agent: Okay. Any complications with peritoneal dialysis, like peritonitis or catheter infections?
user: No.
agent: Are you still making urine?
user: A little bit. Yeah. Like, half a liter.
agent: Okay, about half a liter per day. Do you have diabetes?
user: No. I don't have diabetes.
agent: Got it—no diabetes. Do you have high blood pressure (hypertension)?
user: I do have high blood pressure. Yeah.
agent: What month and year were you diagnosed with high blood pressure?
user: Ten years ago.
agent: About what year would it be—around 2016?
user: Yeah.
agent: Okay. Do you take any blood thinners?
user: No. I take aspirin.
agent: Okay, aspirin. Have you ever had a heart attack?
user: No.
agent: Any heart stents placed?
user: No.
agent: Any bypass surgery? Any history of heart failure?
user: No.
agent: Any irregular heartbeat or atrial fibrillation?
user: No.
agent: Any stroke or TIA?
user: No.
agent: Have you ever had a transplant before? Have you ever received a blood transfusion?
user: No to transplant. I did have a blood transfusion about three years ago.
agent: Okay, around 2023. Have you had any major surgeries?
user: Oh, I have the PD catheter put in. And I had a bunion removed on my toe.
agent: Okay. What month and year was the PD catheter placed—was that February 2023?
user: yeah.
agent: Got it. What month and year was the bunion surgery on your toe?
user: Like, seven years ago. Winter 2019.
agent: Got it—winter 2019. Have you ever had cancer?
user: I did have, like, an abnormal Pap smear once. And then I had to go back and get a repeat and get some biopsies, and everything turned out to be okay.
agent: Okay. Are you currently seeing a gynecologist for any ongoing abnormal Pap follow-up?
user: Yeah. I get them done every year.
agent: Got it. Do you currently smoke cigarettes or use tobacco?
user: No.
agent: Do you drink alcohol?
user: No.
agent: Have you used any recreational drugs?
user: No. Never.
agent: Okay. Who will help you after transplant surgery?
user: My cousin.
agent: Got it. Do you live alone?
user: Yes. I do.
agent: Do you currently work?
user: I don't work. I'm retired.
agent: Are you independent with dressing and bathing?
user: Yeah.
agent: Are you able to cook and clean for yourself?
user: Yeah.
agent: Do you manage your medications yourself? And do you drive?
user: Yeah.
agent: Can you list your current medications?
user: I take Lasix, nifedipine, and carvedilol. And I take phosphate binders and vitamins and other things but I don't have the names in front of me.
agent: Okay. I'm going to send this information to our transplant team for review. We'll contact you once they've reviewed everything.
user: Okay. How long is it gonna take for me to get a kidney transplant?
agent: I can't give a specific timeline. It depends on the transplant team's review, your evaluation results, and donor availability. Our next step is the team review, and then we'll contact you to schedule the evaluation visit.
user: Is there anything I can do to increase my chances?
agent: One major factor that can shorten wait time is having a living donor. Otherwise, complete all required evaluation appointments quickly once we schedule them.
user: K. Thank you.
agent: You're welcome. We'll be in touch after the transplant team reviews your screening information."""

payload = {
    "event": "call_ended",
    "call": {
        "call_id": "test-manual-001",
        "metadata": {
            "patientId": "p-manpreet-retell",
            "patientName": "Manpreet Retell"
        },
        "transcript": TRANSCRIPT,
        "call_analysis": {
            "call_summary": "Pre-transplant screening call completed with Manpreet Kaur."
        },
        "start_timestamp": 1740143000000,
        "end_timestamp": 1740144800000,
        "to_number": "+1234567890",
        "from_number": "+1234567890"
    }
}

body = json.dumps(payload).encode('utf-8')
url = f'http://localhost:3001/api/webhooks/retell?secret={secret}'

print(f'Sending {len(body)} bytes to {url[:60]}...')

req = urllib.request.Request(
    url,
    data=body,
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as resp:
        result = resp.read().decode()
        print(f'Status: {resp.status}')
        print(f'Response: {result}')
except urllib.error.HTTPError as e:
    print(f'HTTP Error {e.code}: {e.read().decode()}')
except Exception as e:
    print(f'Error: {e}')
