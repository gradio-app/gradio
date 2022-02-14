module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            code: {
              fontWeight: 'normal',
              backgroundColor: 'whitesmoke',
              '&:before': {
                content: "none !important",
              },
              '&:after': {
                content: "none !important",
              },
            },
          },
        },
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")]
}
