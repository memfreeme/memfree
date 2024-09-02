import type { Config } from 'tailwindcss';

const config = {
    darkMode: 'class',
    content: [
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
        './ui/**/*.{ts,tsx}',
        './content/**/*.{md,mdx}',
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '1rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                // Fade up and down
                'fade-up': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(10px)',
                    },
                    '80%': {
                        opacity: '0.7',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0px)',
                    },
                },
                'fade-down': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(-10px)',
                    },
                    '80%': {
                        opacity: '0.6',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0px)',
                    },
                },
                'fade-in': {
                    '0%': {
                        opacity: '0',
                    },
                    '50%': {
                        opacity: '0.6',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
                'fade-out': {
                    '0%': {
                        opacity: '0',
                    },
                    '50%': {
                        opacity: '0.6',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
                'spin-around': {
                    '0%': {
                        transform: 'translateZ(0) rotate(0)',
                    },
                    '15%, 35%': {
                        transform: 'translateZ(0) rotate(90deg)',
                    },
                    '65%, 85%': {
                        transform: 'translateZ(0) rotate(270deg)',
                    },
                    '100%': {
                        transform: 'translateZ(0) rotate(360deg)',
                    },
                },
                'slide': {
                    to: {
                        transform: 'translate(calc(100cqw - 100%), 0)',
                    },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',

                // Fade up and down
                'fade-up': 'fade-up 0.5s',
                'fade-down': 'fade-down 0.5s',

                // Fade in and out
                'fade-in': 'fade-in 0.4s',
                'fade-out': 'fade-out 0.4s',

                'spin-around':
                    'spin-around calc(var(--speed) * 2) infinite linear',
                'slide': 'slide var(--speed) ease-in-out infinite alternate',
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme('colors.gray.800'),
                        a: {
                            'color': theme('colors.blue.500'),
                            '&:hover': {
                                color: theme('colors.blue.700'),
                            },
                        },
                        h1: { color: theme('colors.gray.900') },
                        h2: { color: theme('colors.gray.900') },
                        h3: { color: theme('colors.gray.900') },
                        h4: { color: theme('colors.gray.900') },
                        strong: { color: theme('colors.gray.900') },
                        blockquote: {
                            borderLeftColor: theme('colors.gray.200'),
                            color: theme('colors.gray.900'),
                        },
                    },
                },
                dark: {
                    css: {
                        color: theme('colors.gray.300'),
                        a: {
                            'color': theme('colors.blue.400'),
                            '&:hover': {
                                color: theme('colors.blue.600'),
                            },
                        },
                        h1: { color: theme('colors.gray.100') },
                        h2: { color: theme('colors.gray.100') },
                        h3: { color: theme('colors.gray.100') },
                        h4: { color: theme('colors.gray.100') },
                        strong: { color: theme('colors.gray.100') },
                        blockquote: {
                            borderLeftColor: theme('colors.gray.700'),
                            color: theme('colors.gray.300'),
                        },
                    },
                },
            }),
        },
    },
    plugins: [
        require('tailwindcss-animate'),
        require('@tailwindcss/typography'),
    ],
} satisfies Config;

export default config;
