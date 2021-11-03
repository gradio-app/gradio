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
    display: ["group-hover"],
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")]
}
