// Einstellungen für das Verkleinern der Grafiken in emoji/ (siehe emoji/LIZENZ.md).
// Aufruf: npx svgo@4 --config tools/svgo.config.js -f emoji
module.exports = {
  multipass: true,
  plugins: [{ name: "preset-default" }, { name: "prefixIds", params: { delim: "", prefixClassNames: false } }],
};
