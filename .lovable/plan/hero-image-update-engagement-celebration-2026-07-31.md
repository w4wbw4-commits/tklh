# Hero Image Update — Engagement Celebration

## Goal
Replace the current Hero background poster with a new photorealistic image that keeps the same luxury camera angle and composition (olive-green velvet chair with gold trim), but re-dresses the scene as an elegant engagement celebration with blush pink and white roses among greenery, extra lit candles, romantic warm golden lighting, and marble columns. Then make it visible on the homepage so the user can review it live.

## Scope
- Generate one new 1920×1080 static image matching the requested mood.
- Replace `src/assets/hero-poster.jpg`.
- Keep the existing Hero component logic unchanged; it already imports `heroPoster`.
- Optional: copy the same image to `public/og-image.jpg` so the social preview stays consistent with the homepage.

## Steps
1. Generate the new cinematic hero image using the exact composition reference.
2. Save it to `src/assets/hero-poster.jpg`.
3. (Optional) Copy it to `public/og-image.jpg`.
4. Verify the homepage preview renders the new image behind the Hero content.

## Acceptance
- Homepage shows the new engagement-themed hero background.
- No layout/text overlap issues caused by the image swap.
- User can decide if further adjustments are needed.
