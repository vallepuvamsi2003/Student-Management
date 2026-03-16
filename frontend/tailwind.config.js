/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2563EB",
                secondary: "#38BDF8",
                accent: "#9333EA",
                background: "#F5F7FF"
            }
        },
    },
    plugins: [],
}
