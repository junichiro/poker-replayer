/**
 * Customization utilities for poker hand replay component
 *
 * This module provides utilities for managing themes, sizes, and other
 * customization options for the poker hand replay component.
 */

import {
  ThemeColors,
  CustomTheme,
  ComponentTheme,
  ComponentSize,
  TableShape,
  CardDesign,
  AnimationConfig,
  SizeConfig,
} from "../types";

/**
 * Default theme colors for built-in themes
 */
export const DEFAULT_THEMES: Record<ComponentTheme | string, ThemeColors> = {
  dark: {
    bgPrimary: "#1a1a1a",
    bgSecondary: "#2d2d2d",
    bgTable: "#0d4f3c",
    textPrimary: "#ffffff",
    textSecondary: "#b0b0b0",
    border: "#404040",
    cardBg: "#ffffff",
    cardText: "#000000",
    heroHighlight: "#ffd700",
    allInIndicator: "#ff4444",
    actionHighlight: "#4a9eff",
    potColor: "#228B22",
  },
  light: {
    bgPrimary: "#ffffff",
    bgSecondary: "#f5f5f5",
    bgTable: "#228B22",
    textPrimary: "#000000",
    textSecondary: "#666666",
    border: "#e0e0e0",
    cardBg: "#ffffff",
    cardText: "#000000",
    heroHighlight: "#ffd700",
    allInIndicator: "#ff4444",
    actionHighlight: "#0066cc",
    potColor: "#1a7a1a",
  },
  auto: {
    bgPrimary: "#ffffff",
    bgSecondary: "#f5f5f5",
    bgTable: "#228B22",
    textPrimary: "#000000",
    textSecondary: "#666666",
    border: "#e0e0e0",
    cardBg: "#ffffff",
    cardText: "#000000",
    heroHighlight: "#ffd700",
    allInIndicator: "#ff4444",
    actionHighlight: "#0066cc",
    potColor: "#1a7a1a",
  },
  casino: {
    bgPrimary: "#0f1419",
    bgSecondary: "#1e2328",
    bgTable: "#8B0000",
    textPrimary: "#ffd700",
    textSecondary: "#cccccc",
    border: "#333333",
    cardBg: "#ffffff",
    cardText: "#000000",
    heroHighlight: "#ff6b35",
    allInIndicator: "#ff1744",
    actionHighlight: "#ffd700",
    potColor: "#8B0000",
  },
  professional: {
    bgPrimary: "#f8f9fa",
    bgSecondary: "#ffffff",
    bgTable: "#2d5016",
    textPrimary: "#212529",
    textSecondary: "#6c757d",
    border: "#dee2e6",
    cardBg: "#ffffff",
    cardText: "#000000",
    heroHighlight: "#0066cc",
    allInIndicator: "#dc3545",
    actionHighlight: "#28a745",
    potColor: "#2d5016",
  },
};

/**
 * Default animation configurations
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  enableCardAnimations: true,
  enableChipAnimations: true,
  enableActionHighlight: true,
  cardDealDuration: 300,
  actionTransitionDuration: 200,
  easing: "ease-out",
};

/**
 * Creates a custom theme with validation
 */
export function createCustomTheme(
  name: string,
  colors: Partial<ThemeColors>,
  className?: string,
): CustomTheme {
  // Merge with default dark theme as base
  const defaultColors = DEFAULT_THEMES.dark;
  const mergedColors: ThemeColors = { ...defaultColors, ...colors };

  return {
    name,
    colors: mergedColors,
    className,
  };
}

/**
 * Applies theme to a DOM element
 */
export function applyTheme(
  element: HTMLElement,
  theme: ComponentTheme | CustomTheme,
  customColors?: Partial<ThemeColors>,
): void {
  // Remove existing theme attributes
  element.removeAttribute("data-theme");
  element.style.removeProperty("--bg-primary");
  element.style.removeProperty("--bg-secondary");
  element.style.removeProperty("--bg-table");
  element.style.removeProperty("--text-primary");
  element.style.removeProperty("--text-secondary");
  element.style.removeProperty("--border");
  element.style.removeProperty("--card-bg");
  element.style.removeProperty("--card-text");
  element.style.removeProperty("--hero-highlight");
  element.style.removeProperty("--all-in-indicator");
  element.style.removeProperty("--action-highlight");
  element.style.removeProperty("--pot-color");

  if (typeof theme === "string") {
    // Built-in theme
    element.setAttribute("data-theme", theme);

    // Apply custom color overrides if provided
    if (customColors) {
      const baseColors = DEFAULT_THEMES[theme] || DEFAULT_THEMES.dark;
      const finalColors = { ...baseColors, ...customColors };
      applyCustomColors(element, finalColors);
    }
  } else {
    // Custom theme
    element.setAttribute("data-theme", "custom");
    if (theme.className) {
      element.classList.add(theme.className);
    }
    applyCustomColors(element, theme.colors);
  }
}

/**
 * Applies custom colors as CSS custom properties
 */
function applyCustomColors(element: HTMLElement, colors: ThemeColors): void {
  element.style.setProperty("--bg-primary", colors.bgPrimary);
  element.style.setProperty("--bg-secondary", colors.bgSecondary);
  element.style.setProperty("--bg-table", colors.bgTable);
  element.style.setProperty("--text-primary", colors.textPrimary);
  element.style.setProperty("--text-secondary", colors.textSecondary);
  element.style.setProperty("--border", colors.border);
  element.style.setProperty("--card-bg", colors.cardBg);
  element.style.setProperty("--card-text", colors.cardText);
  element.style.setProperty("--hero-highlight", colors.heroHighlight);
  element.style.setProperty("--all-in-indicator", colors.allInIndicator);
  element.style.setProperty("--action-highlight", colors.actionHighlight);
  element.style.setProperty("--pot-color", colors.potColor);
}

/**
 * Applies size configuration to a DOM element
 */
export function applySize(
  element: HTMLElement,
  size: ComponentSize | SizeConfig,
): void {
  // Remove existing size attributes
  element.removeAttribute("data-size");
  element.style.removeProperty("--size-scale");
  element.style.removeProperty("--card-scale");
  element.style.removeProperty("--table-scale");
  element.style.removeProperty("--font-scale");
  element.style.removeProperty("--spacing-scale");

  if (typeof size === "string") {
    // Built-in size
    element.setAttribute("data-size", size);
  } else {
    // Custom size configuration
    element.setAttribute("data-size", "custom");
    if (size.cardScale) {
      element.style.setProperty("--card-scale", size.cardScale.toString());
    }
    if (size.tableScale) {
      element.style.setProperty("--table-scale", size.tableScale.toString());
    }
    if (size.fontScale) {
      element.style.setProperty("--font-scale", size.fontScale.toString());
    }
    if (size.spacingScale) {
      element.style.setProperty(
        "--spacing-scale",
        size.spacingScale.toString(),
      );
    }
  }
}

/**
 * Applies table shape to a table element
 */
export function applyTableShape(element: HTMLElement, shape: TableShape): void {
  element.setAttribute("data-shape", shape);
}

/**
 * Applies card design to the main element
 */
export function applyCardDesign(
  element: HTMLElement,
  design: CardDesign,
): void {
  element.setAttribute("data-card-design", design);
}

/**
 * Applies animation configuration to the main element
 */
export function applyAnimationConfig(
  element: HTMLElement,
  config: AnimationConfig,
  speed?: number,
): void {
  const finalConfig = { ...DEFAULT_ANIMATION_CONFIG, ...config };

  // Set animation speed
  if (speed !== undefined) {
    if (speed <= 0.5) {
      element.setAttribute("data-animation-speed", "fast");
    } else if (speed >= 1.5) {
      element.setAttribute("data-animation-speed", "slow");
    } else {
      element.setAttribute("data-animation-speed", "normal");
    }
    element.style.setProperty("--animation-speed", speed.toString());
  }

  // Apply animation toggles
  element.setAttribute(
    "data-enable-card-animations",
    finalConfig.enableCardAnimations ? "true" : "false",
  );
  element.setAttribute(
    "data-enable-chip-animations",
    finalConfig.enableChipAnimations ? "true" : "false",
  );
  element.setAttribute(
    "data-enable-action-highlight",
    finalConfig.enableActionHighlight ? "true" : "false",
  );

  // Apply animation durations
  if (finalConfig.cardDealDuration) {
    element.style.setProperty(
      "--card-deal-duration",
      `${finalConfig.cardDealDuration}ms`,
    );
  }
  if (finalConfig.actionTransitionDuration) {
    element.style.setProperty(
      "--action-transition-duration",
      `${finalConfig.actionTransitionDuration}ms`,
    );
  }
}

/**
 * Detects system color scheme preference
 */
export function getSystemColorScheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light"; // Default fallback
}

/**
 * Creates a theme that automatically follows system preference
 */
export function createAutoTheme(): ComponentTheme {
  return "auto";
}

/**
 * Validates theme colors to ensure they meet contrast requirements
 */
export function validateThemeColors(colors: ThemeColors): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for sufficient contrast between text and background
  const contrastRatio = calculateContrastRatio(
    colors.textPrimary,
    colors.bgPrimary,
  );
  if (contrastRatio < 4.5) {
    issues.push(
      "Primary text does not have sufficient contrast with primary background",
    );
  }

  // Check that card colors are readable
  const cardContrastRatio = calculateContrastRatio(
    colors.cardText,
    colors.cardBg,
  );
  if (cardContrastRatio < 4.5) {
    issues.push(
      "Card text does not have sufficient contrast with card background",
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Simple contrast ratio calculation (approximation)
 */
function calculateContrastRatio(color1: string, color2: string): number {
  // This is a simplified implementation
  // In a real implementation, you'd want to use a proper color contrast library
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1; // Fallback

  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates relative luminance for contrast ratio
 */
function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
