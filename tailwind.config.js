/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FAF8F5',
          surface: '#F3EFEA',
          card: '#F7F4EE',
          border: '#E3DCD2',
          dark: '#26231E',
          taupe: '#635E4E',
          lightTaupe: '#9C9588',
          accent: '#B87D4B'
        },
        "surface-container-high": "#e7e8e9",
        "outline": "#76777d",
        "surface-variant": "#e1e3e4",
        "on-secondary-fixed": "#00174b",
        "on-surface-variant": "#45464c",
        "tertiary-fixed-dim": "#4edea3",
        "on-secondary-fixed-variant": "#003ea8",
        "on-primary-fixed-variant": "#404758",
        "secondary-container": "#316bf3",
        "tertiary": "#000000",
        "background": "#f8f9fa",
        "tertiary-fixed": "#6ffbbe",
        "surface-container-low": "#f3f4f5",
        "on-tertiary-fixed": "#002113",
        "on-primary-fixed": "#141b2b",
        "on-background": "#191c1d",
        "surface-container-lowest": "#ffffff",
        "on-error": "#ffffff",
        "primary": "#000000",
        "on-surface": "#191c1d",
        "on-tertiary-fixed-variant": "#005236",
        "outline-variant": "#c6c6cd",
        "tertiary-container": "#002113",
        "text-muted": "#6B7280",
        "on-secondary-container": "#fefcff",
        "on-tertiary-container": "#009668",
        "error": "#ba1a1a",
        "primary-fixed": "#dce2f7",
        "on-primary": "#ffffff",
        "text-main": "#111827",
        "on-tertiary": "#ffffff",
        "surface-container-highest": "#e1e3e4",
        "inverse-primary": "#c0c6db",
        "surface-tint": "#575e70",
        "on-error-container": "#93000a",
        "primary-fixed-dim": "#c0c6db",
        "on-primary-container": "#7d8497",
        "surface-white": "#FFFFFF",
        "secondary-fixed": "#dbe1ff",
        "surface-bright": "#f8f9fa",
        "cta-activation": "#10B981",
        "secondary": "#0051d5",
        "inverse-surface": "#2e3132",
        "secondary-fixed-dim": "#b4c5ff",
        "surface": "#f8f9fa",
        "surface-dim": "#d9dadb",
        "error-container": "#ffdad6",
        "inverse-on-surface": "#f0f1f2",
        "on-secondary": "#ffffff",
        "surface-container": "#edeeef",
        "primary-container": "#141b2b"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "container-margin": "20px",
        "stack-lg": "48px",
        "stack-md": "24px",
        "gutter": "16px",
        "base": "8px",
        "stack-sm": "12px"
      },
      fontFamily: {
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-bold": ["Inter", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-lg": [
          "32px",
          {
            "lineHeight": "40px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "headline-lg-mobile": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "body-sm": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "400"
          }
        ],
        "body-lg": [
          "18px",
          {
            "lineHeight": "28px",
            "fontWeight": "400"
          }
        ],
        "body-md": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "label-bold": [
          "14px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.01em",
            "fontWeight": "600"
          }
        ],
        "headline-md": [
          "20px",
          {
            "lineHeight": "28px",
            "fontWeight": "600"
          }
        ],
        "label-caps": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.05em",
            "fontWeight": "700"
          }
        ]
      }
    },
  },
  plugins: [],
};
