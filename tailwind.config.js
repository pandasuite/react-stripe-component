module.exports = {
  presets: [
    require('pandasuite-bridge-react/tailwind.config')
  ],
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
