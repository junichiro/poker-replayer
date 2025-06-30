# 🎨 Theming Example

A comprehensive example demonstrating custom themes, color schemes, and visual customization of the Poker Hand Replay component.

## 🎯 What This Example Shows

- ✅ **Custom Theme Creation** - Build your own themes
- ✅ **Color Customization** - Override theme colors
- ✅ **CSS Variables** - Use CSS custom properties
- ✅ **Theme Switching** - Dynamic theme changes
- ✅ **Responsive Themes** - Mobile-optimized themes
- ✅ **Accessibility Themes** - High contrast and accessibility
- ✅ **Brand Integration** - Corporate theme examples

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## 🎨 Available Themes

### Built-in Themes
- **Dark** - Default dark theme
- **Light** - Clean light theme  
- **Casino** - Green felt casino style
- **Professional** - Minimal business theme
- **Auto** - System preference detection

### Custom Themes
- **Neon** - Cyberpunk neon colors
- **Ocean** - Blue ocean theme
- **Sunset** - Warm sunset colors
- **High Contrast** - Accessibility theme
- **Corporate** - Business brand theme

## 📂 Project Structure

```
theming/
├── src/
│   ├── themes/
│   │   ├── neon.ts             # Neon cyberpunk theme
│   │   ├── ocean.ts            # Ocean blue theme
│   │   ├── sunset.ts           # Sunset warm theme
│   │   ├── corporate.ts        # Corporate brand theme
│   │   └── accessibility.ts    # High contrast theme
│   ├── components/
│   │   ├── ThemeSelector.tsx   # Theme switching UI
│   │   ├── ColorPicker.tsx     # Color customization
│   │   └── ThemePreview.tsx    # Live theme preview
│   ├── App.tsx                 # Main application
│   ├── index.tsx              # Entry point
│   └── styles.css             # Base styling
├── public/
│   └── index.html             # HTML template
└── README.md                  # This file
```

## 🎨 Custom Theme Examples

### Neon Cyberpunk Theme

```typescript
export const neonTheme: CustomTheme = {
  name: "neon",
  colors: {
    bgPrimary: "#0a0a0a",
    bgSecondary: "#1a1a2e",
    bgTable: "#16213e",
    textPrimary: "#00ff88",
    textSecondary: "#ff0080",
    border: "#00ffff",
    cardBg: "#000000",
    cardText: "#00ff88",
    heroHighlight: "#ff0080",
    allInIndicator: "#ff4444",
    actionHighlight: "#00ffff",
    potColor: "#ffff00",
  },
  className: "neon-theme"
};
```

### Ocean Theme

```typescript
export const oceanTheme: CustomTheme = {
  name: "ocean",
  colors: {
    bgPrimary: "#0f4c75",
    bgSecondary: "#3282b8",
    bgTable: "#0f3460",
    textPrimary: "#ffffff",
    textSecondary: "#bbe1fa",
    border: "#3282b8",
    cardBg: "#ffffff",
    cardText: "#0f4c75",
    heroHighlight: "#ffd700",
    allInIndicator: "#ff6b6b",
    actionHighlight: "#4ecdc4",
    potColor: "#45b7d1",
  }
};
```

### Corporate Brand Theme

```typescript
export const corporateTheme: CustomTheme = {
  name: "corporate",
  colors: {
    bgPrimary: "#2c3e50",
    bgSecondary: "#34495e",
    bgTable: "#1abc9c",
    textPrimary: "#ffffff",
    textSecondary: "#bdc3c7",
    border: "#95a5a6",
    cardBg: "#ffffff",
    cardText: "#2c3e50",
    heroHighlight: "#f39c12",
    allInIndicator: "#e74c3c",
    actionHighlight: "#9b59b6",
    potColor: "#27ae60",
  }
};
```

## 🔧 Dynamic Theme Switching

```typescript
const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const themes = [
    { id: 'dark', name: 'Dark', type: 'built-in' },
    { id: 'light', name: 'Light', type: 'built-in' },
    { id: 'casino', name: 'Casino', type: 'built-in' },
    { id: 'neon', name: 'Neon', type: 'custom' },
    { id: 'ocean', name: 'Ocean', type: 'custom' },
    { id: 'sunset', name: 'Sunset', type: 'custom' },
  ];

  return (
    <div className="theme-selector">
      {themes.map(theme => (
        <button
          key={theme.id}
          className={`theme-button ${currentTheme === theme.id ? 'active' : ''}`}
          onClick={() => onThemeChange(theme.id)}
        >
          <div className={`theme-preview ${theme.id}`}></div>
          <span>{theme.name}</span>
        </button>
      ))}
    </div>
  );
};
```

## 🎨 Color Customization

```typescript
const ColorCustomizer = ({ theme, onColorChange }) => {
  const colorGroups = {
    'Background': ['bgPrimary', 'bgSecondary', 'bgTable'],
    'Text': ['textPrimary', 'textSecondary'],
    'Highlights': ['heroHighlight', 'actionHighlight', 'potColor'],
    'Interface': ['border', 'cardBg', 'cardText'],
  };

  return (
    <div className="color-customizer">
      {Object.entries(colorGroups).map(([group, colors]) => (
        <div key={group} className="color-group">
          <h3>{group}</h3>
          {colors.map(colorKey => (
            <div key={colorKey} className="color-control">
              <label>{colorKey}</label>
              <input
                type="color"
                value={theme.colors[colorKey]}
                onChange={(e) => onColorChange(colorKey, e.target.value)}
              />
              <input
                type="text"
                value={theme.colors[colorKey]}
                onChange={(e) => onColorChange(colorKey, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## 📱 Responsive Theming

```css
/* Mobile-optimized themes */
@media (max-width: 768px) {
  .poker-replay {
    --table-size: 300px;
    --card-size: 40px;
    --font-size-small: 10px;
    --spacing-small: 8px;
  }
  
  .neon-theme {
    --glow-intensity: 0.5; /* Reduce glow on mobile */
  }
  
  .ocean-theme {
    --wave-animation: none; /* Disable animations on mobile */
  }
}
```

## ♿ Accessibility Themes

```typescript
export const highContrastTheme: CustomTheme = {
  name: "high-contrast",
  colors: {
    bgPrimary: "#000000",
    bgSecondary: "#000000", 
    bgTable: "#000000",
    textPrimary: "#ffffff",
    textSecondary: "#ffff00",
    border: "#ffffff",
    cardBg: "#ffffff",
    cardText: "#000000",
    heroHighlight: "#ffff00",
    allInIndicator: "#ff0000",
    actionHighlight: "#00ff00",
    potColor: "#00ffff",
  }
};

// WCAG AA compliant color ratios
const validateContrast = (bg: string, text: string) => {
  const ratio = getContrastRatio(bg, text);
  return ratio >= 4.5; // WCAG AA standard
};
```

## 🌈 Advanced Styling

### CSS Custom Properties

```css
:root {
  /* Theme variables */
  --poker-primary: #667eea;
  --poker-secondary: #764ba2;
  --poker-accent: #f093fb;
  
  /* Component sizing */
  --poker-table-size: 400px;
  --poker-card-width: 50px;
  --poker-card-height: 70px;
  
  /* Animation properties */
  --poker-transition-fast: 0.15s ease;
  --poker-transition-normal: 0.3s ease;
  --poker-transition-slow: 0.5s ease;
  
  /* Shadows and effects */
  --poker-shadow-small: 0 2px 4px rgba(0, 0, 0, 0.1);
  --poker-shadow-medium: 0 4px 8px rgba(0, 0, 0, 0.15);
  --poker-shadow-large: 0 8px 16px rgba(0, 0, 0, 0.2);
}
```

### Dynamic CSS Classes

```typescript
// Apply theme-specific CSS classes
const getThemeClasses = (theme: string) => {
  const baseClasses = ['poker-replay'];
  
  switch (theme) {
    case 'neon':
      return [...baseClasses, 'neon-theme', 'glow-effects'];
    case 'ocean':
      return [...baseClasses, 'ocean-theme', 'wave-animation'];
    case 'sunset':
      return [...baseClasses, 'sunset-theme', 'gradient-bg'];
    default:
      return baseClasses;
  }
};
```

## 🎯 Theme Performance

### Optimized Theme Loading

```typescript
// Lazy load theme assets
const loadTheme = async (themeName: string) => {
  if (themeName === 'neon') {
    await import('./themes/neon.css');
  } else if (themeName === 'ocean') {
    await import('./themes/ocean.css');
  }
  // ... other themes
};

// Preload critical themes
const preloadThemes = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = '/themes/dark.css';
  document.head.appendChild(link);
};
```

### Theme Caching

```typescript
// Cache theme configurations
const themeCache = new Map<string, CustomTheme>();

const getTheme = (themeName: string): CustomTheme => {
  if (themeCache.has(themeName)) {
    return themeCache.get(themeName)!;
  }
  
  const theme = loadThemeConfig(themeName);
  themeCache.set(themeName, theme);
  return theme;
};
```

## 🎨 CSS-in-JS Integration

```typescript
// Styled-components integration
const ThemedReplayContainer = styled.div<{ theme: CustomTheme }>`
  background: ${props => props.theme.colors.bgPrimary};
  color: ${props => props.theme.colors.textPrimary};
  border: 1px solid ${props => props.theme.colors.border};
  
  .poker-table {
    background: ${props => props.theme.colors.bgTable};
  }
  
  .poker-card {
    background: ${props => props.theme.colors.cardBg};
    color: ${props => props.theme.colors.cardText};
  }
`;
```

## 🔗 Theme Resources

- **Color Palette Tools**
  - [Coolors.co](https://coolors.co/) - Color scheme generator
  - [Adobe Color](https://color.adobe.com/) - Professional color tools
  - [Paletton](http://paletton.com/) - Color scheme designer

- **Accessibility Tools**
  - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
  - [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
  - [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)

## 📚 Learn More

- **[Basic Example](../basic/)** - Start with fundamentals
- **[Advanced Example](../advanced/)** - Complete feature showcase
- **[CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)**

---

**Make it yours!** This example shows how to create beautiful, accessible themes for any brand or style.