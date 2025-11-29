/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				'fpl-purple': '#1a0b2e',
				'fpl-card': '#2d1b4e',
				'fpl-green': '#00ff87',
				'fpl-cyan': '#02efff',
				'fpl-red': '#ef4444',
				'fpl-yellow': '#eab308',
			},
			fontFamily: {
				sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
