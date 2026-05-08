import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // VORA Design Tokens
        vora: {
          surface:          '#12131c',
          'surface-low':    '#1a1b24',
          'surface-mid':    '#1e1f28',
          'surface-high':   '#292933',
          primary:          '#bdc2ff',
          'primary-ctr':    '#4f61ff',
          secondary:        '#c7c5d3',
          tertiary:         '#ffb692',
          outline:          '#8f8fa1',
          'outline-v':      '#454655',
          on:               '#e3e1ee',
          'on-v':           '#c5c5d8',
        },
      },
      fontFamily: {
        arabic: ['IBM Plex Sans Arabic', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        inter:  ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:   '4px',
        DEFAULT: '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        '2xl': '32px',
      },
      animation: {
        'fade-up':    'fadeInUp 0.6s ease both',
        'scale-in':   'scaleIn  0.4s ease both',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        shimmer:      'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeInUp:  { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' },       to: { opacity: '1', transform: 'scale(1)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79,97,255,0.3)' },
          '50%':       { boxShadow: '0 0 40px rgba(79,97,255,0.6)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
      backdropBlur: {
        glass:   '24px',
        heavy:   '40px',
      },
    },
  },
  plugins: [],
};

export default config;
