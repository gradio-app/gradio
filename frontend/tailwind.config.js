module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontWeight: "semibold"
            },
            h2: {
              fontWeight: "semibold"
            },
            h3: {
              fontWeight: "semibold"
            },
            h4: {
              fontWeight: "semibold"
            },
            h5: {
              fontWeight: "semibold"
            },
            h6: {
              fontWeight: "semibold"
            }
          }
        }
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: [require("@tailwindcss/typography")]
};
