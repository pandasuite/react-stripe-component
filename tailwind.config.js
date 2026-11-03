const kitPreset = require('pandasuite-bridge-react/tailwind.config');

module.exports = {
  presets: [kitPreset],
  // Tailwind 2 purges from `purge`; the kit's preset lists its paths under `content`
  purge: kitPreset.content,
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('pandasuite-bridge/studio-theme'),
  ],
};
