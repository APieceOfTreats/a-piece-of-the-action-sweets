A PIECE OF THE ACTION SWEETS — SQUARE CHECKOUT BUILD

UPLOAD TO GITHUB
Keep this exact structure in the repository root:

index.html
styles.css
script.js
assets/
  logo.png
functions/
  api/
    checkout.js

IMPORTANT
Do not put a Square token in index.html, script.js, checkout.js, README, or GitHub.

CLOUDFLARE PAGES SETTINGS
In Cloudflare:
Workers & Pages > your Pages project > Settings > Variables and Secrets

Add:
1. SQUARE_ACCESS_TOKEN
   - Paste your SANDBOX Access Token first
   - Encrypt as a secret

2. SQUARE_LOCATION_ID
   - Paste your SANDBOX Location ID
   - This can be a normal variable

3. SQUARE_ENVIRONMENT
   - Value: sandbox
   - Normal variable

Save, then trigger a new deployment.

TEST
Visit:
https://YOUR-SITE.pages.dev/api/checkout

You should see:
{"ok":true,"message":"Square checkout endpoint is online."}

Then add an item to the website cart and click:
Checkout securely with Square

GO LIVE
After testing:
- Change SQUARE_ACCESS_TOKEN to the PRODUCTION access token.
- Change SQUARE_LOCATION_ID to the PRODUCTION Location ID.
- Change SQUARE_ENVIRONMENT to production.
- Redeploy.

SECURITY
The server file contains the approved prices. The browser sends only product IDs and quantities, preventing a customer from changing a price in the browser and paying the altered value.
