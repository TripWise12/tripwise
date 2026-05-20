# Logo Setup Instructions

## Where to put your logo

1. Take your logo PNG file (`ChatGPT_Image_May_19__2026__09_42_00_AM.png`)
2. Rename it to `logo.png`
3. Place it here:

```
tripiq/
└── frontend/
    └── public/
        └── logo.png   ← PUT IT HERE
```

That's it. The app automatically uses it for:
- Browser tab favicon
- Apple touch icon (when saved to home screen)
- Nav bar logo (replace the Plane icon with Image tag if you want)

## To show the logo image in the nav bar instead of the icon

In `frontend/src/app/page.tsx`, find this in the nav section:

```tsx
<div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center relative"
  style={{background:'linear-gradient(135deg,#1c2642,#0f1628)',border:'1px solid rgba(201,168,76,0.35)'}}>
  <Plane className="w-5 h-5" style={{color:'var(--gold)'}} />
</div>
```

Replace with:

```tsx
<div className="w-10 h-10 rounded-xl overflow-hidden">
  <img src="/logo.png" alt="TripWise" className="w-full h-full object-cover" />
</div>
```

Do the same in `plan/page.tsx` and `trip/[id]/page.tsx` for the nav logo mark.
