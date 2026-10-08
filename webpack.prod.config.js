// Webpack's module cache can reuse code generated for a different federation
// runtime on incremental builds, stripping required RxJS/Angular exports.
// Keep production optimization; regenerate module code on every compilation.
module.exports = { ...require('./webpack.config'), cache: false };
