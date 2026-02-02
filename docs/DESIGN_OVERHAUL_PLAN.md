# Visual Design Overhaul Plan
## Inspiration-Based Redesign for IIIF Field Archive Studio

### Overview
This document outlines the changes needed to transform the current UI to match the aesthetic of the provided cards:

```html
<div class="card m-auto text-gray-300 w-[clamp(260px,80%,300px)] hover:brightness-90 
     transition-all cursor-pointer group bg-gradient-to-tl from-gray-900 to-gray-950 
     hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 m-4 
     rounded-lg overflow-hidden relative">
```

```html

```

**Key Design Elements from Inspiration:**
- Dark gradient backgrounds (gray-900 to gray-950)
- Orange accent colors (orange-500)
- Yellow/gold gradient accents
- Asymmetric rounded corners (`rounded-tl-none` pattern)
- Glow/blur effects on hover
- Uppercase typography with wide tracking
- Subtle border accents (right and top borders)
- Smooth transitions with group-hover effects

---

## 1. Color System Overhaul

### 1.1 New Primary Palette

Update `designSystem.ts` and `index.html` Tailwind config:

```typescript
// NEW: Premium Dark Theme Colors
export const COLORS = {
  // Background Gradients (main surfaces)
  background: {
    primary: '#0f0f11',      // Deepest background
    secondary: '#18181b',    // Card/panel backgrounds
    tertiary: '#27272a',     // Elevated surfaces
    gradient: {
      start: '#18181b',      // from-gray-900 equivalent
      end: '#09090b',        // to-gray-950 equivalent
      hoverStart: '#27272a', // hover:from-gray-800
      hoverEnd: '#09090b',   // hover:to-gray-950
    }
  },

  // Accent Colors (warm palette)
  accent: {
    primary: '#f97316',      // orange-500
    primaryHover: '#ea580c', // orange-600
    glow: '#f59e0b',         // amber-500 for glows
    gradient: {
      yellow: '#eab308',     // yellow-500
      orange: '#f97316',     // orange-500
    }
  },

  // Text Hierarchy
  text: {
    primary: '#f4f4f5',      // zinc-100 (headings)
    secondary: '#a1a1aa',    // zinc-400 (body)
    tertiary: '#71717a',     // zinc-500 (metadata)
    muted: '#52525b',        // zinc-600 (disabled)
  },

  // Borders
  border: {
    subtle: '#27272a',       // zinc-800
    default: '#3f3f46',      // zinc-700
    accent: '#f97316',       // orange-500
  },

  // Semantic (keep but adjust for dark theme)
  semantic: {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
  }
};
```

### 1.2 Tailwind Config Updates

Update `index.html` Tailwind config:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        // Keep existing IIIF colors for compatibility
        'iiif-blue': '#005596',
        'iiif-red': '#E31C24',
        // NEW: Premium dark theme
        'premium': {
          bg: '#0f0f11',
          card: '#18181b',
          elevated: '#27272a',
        },
        'accent': {
          orange: '#f97316',
          amber: '#f59e0b',
          yellow: '#eab308',
        }
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(to top left, #18181b, #09090b)',
        'gradient-card-hover': 'linear-gradient(to top left, #27272a, #09090b)',
        'gradient-accent': 'linear-gradient(to left, #f97316, #f59e0b)',
        'gradient-glow': 'linear-gradient(to left, transparent, #eab308, transparent)',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-amber': '0 0 30px rgba(245, 158, 11, 0.2)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      }
    }
  }
}
```

---

## 2. Typography System

### 2.1 Font Updates

Add to `index.html`:
```html
<!-- Replace or supplement Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
```

Update typography constants:
```typescript
export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    display: 'Space Grotesk, Inter, sans-serif', // For headings
    mono: 'ui-monospace, SFMono-Regular, monospace',
  },

  // Style variants matching inspiration
  styles: {
    cardTitle: 'uppercase font-bold text-xl tracking-tight font-display',
    cardSubtitle: 'uppercase tracking-widest text-sm text-zinc-500',
    metadata: 'text-zinc-400 text-sm',
    price: 'font-bold text-zinc-300', // For emphasized numbers
  }
};
```

---

## 3. Component-Level Changes

### 3.1 Card Component Pattern (NEW)

Create new reusable card component in `components/Card.tsx`:

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: 'orange' | 'amber' | 'none';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  accent = 'orange' 
}) => (
  <div 
    onClick={onClick}
    className={`
      relative overflow-hidden rounded-lg
      bg-gradient-to-tl from-zinc-900 to-zinc-950
      hover:from-zinc-800 hover:to-zinc-950
      border-r-2 border-t-2 border-zinc-800
      hover:brightness-95
      transition-all duration-300 ease-out
      cursor-pointer group
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
  >
    {children}
    
    {/* Bottom glow effect */}
    <div className={`
      absolute bottom-0 left-0 right-0 h-0.5 
      bg-gradient-to-l from-transparent via-${accent === 'orange' ? 'orange-500' : accent === 'amber' ? 'amber-500' : 'zinc-600'} to-transparent
      w-[70%] mx-auto rounded
      group-hover:w-full group-hover:via-${accent === 'orange' ? 'orange-400' : accent === 'amber' ? 'amber-400' : 'zinc-500'}
      transition-all duration-500
    `} />
    
    {/* Blur glow on hover */}
    <div className={`
      absolute bottom-0 left-0 right-0 h-2 
      bg-gradient-to-l from-transparent via-${accent === 'orange' ? 'orange-500/50' : accent === 'amber' ? 'amber-500/50' : 'zinc-500/30'} to-transparent
      blur-xl opacity-0 group-hover:opacity-100
      transition-opacity duration-500
    `} />
  </div>
);
```

### 3.2 Archive Item Card Redesign

Update `components/views/ArchiveView.tsx` - Grid items:

```tsx
// CURRENT (simplified):
<div className="bg-slate-50 rounded-lg border border-slate-200 ...">

// NEW:
<div className="
  relative overflow-hidden rounded-lg
  bg-gradient-to-tl from-zinc-900 to-zinc-950
  hover:from-zinc-800 hover:to-zinc-950
  border-r-2 border-t-2 border-zinc-800
  hover:border-orange-500/30
  transition-all duration-300
  cursor-pointer group
">
  {/* Thumbnail container */}
  <div className="relative aspect-square overflow-hidden">
    <img ... />
    {/* Overlay gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
    
    {/* Type indicator - orange accent */}
    <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-orange-500 rounded-tl-none 
                    group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-orange-900/50
                    transition-all duration-300" />
  </div>
  
  {/* Content */}
  <div className="px-4 py-3">
    <div className="uppercase font-bold text-zinc-200 text-sm truncate font-display">
      {item.label}
    </div>
    <div className="uppercase tracking-widest text-xs text-zinc-500 mt-1">
      {item.type}
    </div>
  </div>
  
  {/* Bottom accent line */}
  <div className="absolute bottom-0 left-0 right-0 h-0.5 
                  bg-gradient-to-l from-transparent via-orange-500/50 to-transparent
                  w-[70%] mx-auto rounded
                  group-hover:w-full group-hover:via-orange-400
                  transition-all duration-500" />
</div>
```

### 3.3 Sidebar Navigation Redesign

Update `components/Sidebar.tsx`:

```tsx
// CURRENT:
<button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ...`}>

// NEW:
<button className={`
  w-full flex items-center gap-3 px-4 py-3 
  relative overflow-hidden rounded-lg
  transition-all duration-300 group
  ${active 
    ? 'bg-gradient-to-r from-orange-500/20 to-transparent border-r-2 border-orange-500' 
    : 'hover:bg-gradient-to-r hover:from-zinc-800/50 to-transparent border-r-2 border-transparent hover:border-zinc-700'
  }
`}>
  {/* Icon with orange accent when active */}
  <span className={`
    w-8 h-8 rounded-full flex items-center justify-center
    ${active 
      ? 'bg-orange-500 rounded-tl-none' 
      : 'bg-zinc-800 group-hover:bg-zinc-700'
    }
    transition-all duration-300
  `}>
    <Icon name={icon} className={active ? 'text-black' : 'text-zinc-400 group-hover:text-zinc-200'} />
  </span>
  
  <span className={`
    uppercase font-medium tracking-wide
    ${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}
  `}>
    {label}
  </span>
  
  {/* Active indicator glow */}
  {active && (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 
                    bg-orange-500 rounded-l-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
  )}
</button>
```

### 3.4 Inspector Panel Redesign

Update `components/Inspector.tsx`:

```tsx
// Panel container
<div className="
  h-full flex flex-col
  bg-gradient-to-b from-zinc-900 to-zinc-950
  border-l border-zinc-800
">
  {/* Header */}
  <div className="px-6 py-4 border-b border-zinc-800">
    <div className="flex items-center gap-3">
      {/* Resource type indicator */}
      <div className="w-10 h-10 rounded-full rounded-tl-none bg-orange-500 flex items-center justify-center">
        <Icon name={resourceIcon} className="text-black" />
      </div>
      <div>
        <div className="uppercase font-bold text-zinc-100 font-display">
          {resourceType}
        </div>
        <div className="uppercase tracking-widest text-xs text-zinc-500">
          {resourceId}
        </div>
      </div>
    </div>
  </div>
  
  {/* Content sections as cards */}
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
    {sections.map(section => (
      <div className="
        rounded-lg bg-zinc-900/50 border border-zinc-800
        hover:border-zinc-700 transition-colors
        overflow-hidden
      ">
        {/* Section header */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
          <span className="uppercase tracking-widest text-xs text-zinc-500 font-medium">
            {section.title}
          </span>
        </div>
        {/* Section content */}
        <div className="p-4">{section.content}</div>
      </div>
    ))}
  </div>
</div>
```

### 3.5 Status Bar Redesign

Update `components/StatusBar.tsx`:

```tsx
// Bottom status bar
<div className="
  h-6 flex items-center px-4
  bg-zinc-950 border-t border-zinc-800
  text-xs uppercase tracking-wider
">
  {/* Left section */}
  <div className="flex items-center gap-4 text-zinc-500">
    <span>{totalItems} items</span>
    <span className="w-px h-3 bg-zinc-800" />
    <span className={saveStatus === 'saved' ? 'text-green-500' : 'text-amber-500'}>
      {saveStatus}
    </span>
  </div>
  
  {/* Center - accent line decoration */}
  <div className="flex-1 flex justify-center">
    <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
  </div>
  
  {/* Right section */}
  <div className="flex items-center gap-4 text-zinc-500">
    {storageUsage && (
      <span>{formatBytes(storageUsage.usage)} used</span>
    )}
  </div>
</div>
```

---

## 4. Animation & Effects System

### 4.1 Global Transitions

Add to `index.html` style section:

```css
/* Premium transitions */
.premium-transition {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Glow effects */
.glow-orange {
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
}

.glow-amber {
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.2);
}

/* Gradient animations */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(249, 115, 22, 0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

/* Pulse glow for active elements */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(249, 115, 22, 0.5); }
  50% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.8); }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

### 4.2 Hover Effects Pattern

Standard hover effect for interactive cards:

```tsx
// Hover brightness + glow
className="
  ...
  hover:brightness-110
  hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]
  transition-all duration-300
  group
"
```

---

## 5. Field Mode Adaptation

The current "Field Mode" (high contrast) needs to work with the new design:

```tsx
// Field mode variant - maintain contrast while adopting new structure
const fieldModeClasses = fieldMode ? {
  card: 'bg-black border-yellow-400 border-2',
  text: 'text-yellow-400 uppercase font-black',
  accent: 'bg-yellow-400',
  glow: 'shadow-[0_0_20px_rgba(250,204,21,0.5)]',
} : {
  card: 'bg-gradient-to-tl from-zinc-900 to-zinc-950 border-zinc-800',
  text: 'text-zinc-200',
  accent: 'bg-orange-500',
  glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
};
```

---

## 6. Modal/Dialog Updates

Update modal containers:

```tsx
// Overlay
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm ..." />

// Modal content
<div className="
  bg-gradient-to-b from-zinc-900 to-zinc-950
  border border-zinc-800
  rounded-lg
  shadow-2xl shadow-black/50
  overflow-hidden
">
  {/* Header with accent */}
  <div className="px-6 py-4 border-b border-zinc-800 relative">
    <h2 className="uppercase font-bold text-lg text-zinc-100 font-display">
      {title}
    </h2>
    {/* Subtle accent line */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
  </div>
  
  {/* Body */}
  <div className="p-6">{children}</div>
  
  {/* Footer */}
  <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
    {actions}
  </div>
</div>
```

---

## 7. Implementation Phases

### Phase 1: Foundation (1-2 days)
1. Update Tailwind config in `index.html`
2. Update `designSystem.ts` with new color constants
3. Add new animation keyframes to global CSS
4. Create new `Card` component

### Phase 2: Core Components (2-3 days)
1. Redesign `Sidebar` navigation
2. Redesign `Inspector` panel
3. Redesign `StatusBar`
4. Update `ArchiveView` grid items

### Phase 3: Secondary Components (2 days)
1. Update modals and dialogs
2. Update forms and inputs
3. Update buttons and toolbars
4. Update toast notifications

### Phase 4: Polish (1-2 days)
1. Fine-tune hover effects
2. Ensure Field Mode compatibility
3. Test accessibility (contrast ratios)
4. Performance optimization

---

## 8. Accessibility Considerations

### Contrast Requirements
- Primary text on cards: zinc-100 (#f4f4f5) on zinc-900 (#18181b) = **7.5:1** ✓
- Orange accent: orange-500 (#f97316) on zinc-950 (#09090b) = **4.6:1** ✓
- All combinations must meet WCAG AA (4.5:1 for normal text)

### Focus Indicators
```css
/* High visibility focus ring */
*:focus-visible {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .premium-transition,
  .group-hover\:translate-y-1 {
    transition: none !important;
    transform: none !important;
  }
}
```

---

## 9. Migration Checklist

- [ ] Update Tailwind configuration
- [ ] Update designSystem.ts constants
- [ ] Create Card component
- [ ] Update Sidebar
- [ ] Update Inspector
- [ ] Update ArchiveView grid
- [ ] Update StatusBar
- [ ] Update all modal/dialogs
- [ ] Update buttons
- [ ] Update forms/inputs
- [ ] Update Field Mode styles
- [ ] Update loading states
- [ ] Update empty states
- [ ] Test dark/light mode (if applicable)
- [ ] Verify accessibility compliance
- [ ] Test on mobile/touch devices
- [ ] Performance audit

---

## 10. File Changes Summary

| File | Changes |
|------|---------|
| `index.html` | Update Tailwind config, add new animations |
| `designSystem.ts` | New color palette, typography updates |
| `components/Card.tsx` | NEW - reusable card component |
| `components/Sidebar.tsx` | Full redesign |
| `components/Inspector.tsx` | Full redesign |
| `components/StatusBar.tsx` | Visual updates |
| `components/views/ArchiveView.tsx` | Grid item redesign |
| `components/Modal*.tsx` | All modals need updates |
| `components/Button*.tsx` | Button styling updates |
| `components/Input*.tsx` | Input styling updates |
| `App.tsx` | Background color updates |

---

*Document created for IIIF Field Archive Studio visual overhaul*
