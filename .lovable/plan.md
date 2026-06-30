Change the Navbar rounded pill container to an olive-green background with off-white text.

### What will change
- `src/components/tekillah/Navbar.tsx`
  - Pill background: switch from translucent `background` to solid olive green (`bg-primary` or `bg-primary-deep`) in both default and scrolled states.
  - Text color: switch nav links, logo wordmark, and icon buttons to off-white (`text-primary-foreground`).
  - Borders: replace gold-tinted borders with a subtle off-white/olive outline.
  - Hover / focus states: ensure links remain readable (e.g. slightly brighter off-white on hover).

### What stays the same
- Layout, spacing, rounded-full shape, blur backdrop, and animation transitions.
- Mobile sheet menu styling.
- All routing and auth logic.

### Technical notes
- Olive green token: `hsl(var(--primary))` or `hsl(var(--primary-deep))` (deep olive brand color).
- Off-white token: `hsl(var(--primary-foreground))` (warm cream, already the primary contrast color).
- No new dependencies or files needed.