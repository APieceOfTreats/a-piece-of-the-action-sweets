A PIECE OF THE ACTION SWEETS — V3 CLEAN START

This package intentionally restores the warm branded look from the earlier website while keeping all current ordering information and Square checkout support.

START FROM ZERO
1. Create a NEW GitHub repository, for example:
   a-piece-of-the-action-sweets-v3

2. Unzip this package.

3. Upload the CONTENTS of this package to the repository root.
   Do not upload the ZIP itself.

Your repository must look exactly like:

index.html
styles.css
script.js
README-V3.txt
assets/
  logo.png
functions/
  api/
    checkout.js

There should NOT be:
- a root-level checkout.js
- a root-level api folder
- duplicate logo files
- another nested project folder around these files

CLOUDFLARE
Create a NEW Cloudflare PAGES project from the NEW GitHub repository.
Do not deploy this as a Worker.

Cloudflare path:
Workers & Pages > Create > Pages > Connect to Git

Production branch:
main

Framework preset:
None

Build command:
Leave blank

Build output directory:
Use the repository root / leave blank if Cloudflare allows it.

After the first deployment, test:
https://YOUR-PROJECT.pages.dev/api/checkout

Expected result:
{"ok":true,"message":"A Piece of the Action Square checkout endpoint is online.","environment":"sandbox"}

SQUARE SANDBOX VARIABLES
In the NEW Pages project add:

SQUARE_ACCESS_TOKEN
- Your Square SANDBOX access token
- Save as an encrypted secret

SQUARE_LOCATION_ID
- Your Square SANDBOX location ID

SQUARE_ENVIRONMENT
- sandbox

Redeploy after adding these.

Then test checkout from the site.

IMPORTANT SECURITY
Never put the Square access token into GitHub, index.html, script.js, or checkout.js.
The browser sends only SKUs and quantities. The server validates all product prices.

CURRENT MENU
The Original Cinnamon Piece: $7 / box 4 $24.99
Cookies: $5 / box 4 $16.99
Cakesicles: $4 / box 4 $13.99
Classic Caramel Apple Crunch: $7 / box 4 $24.99
Cookie Surprise Mix: $16.99
Cakesicle Surprise Mix: $13.99

ORDERING
Serving Santa Clarita
Fresh baking every Friday
Order cutoff Wednesday 6:00 PM PT
Phone: 661-237-3507
Email: orders@apiecetreats.com
Website: www.apiecetreats.com
