const Encore = require("@symfony/webpack-encore");

Encore
  // Répertoire de sortie des fichiers compilés
  .setOutputPath("public/build/")

  // Chemin public pour inclure les fichiers dans Twig
  .setPublicPath("/build")

  // Ajouter une entrée SCSS principale
  .addStyleEntry("app", "./assets/styles/app.scss")

  // Ajouter une entrée JS principale
  .addEntry("app-js", "./assets/js/app.js")

  // Point d'entrée principal (typescript)
  .addEntry("app-ts", "./assets/ts/app.tsx")

  // Activer React et TypeScript
  .enableReactPreset()
  .enableTypeScriptLoader()

  // Activer le support SCSS
  .enableSassLoader()

  // Nettoyer les fichiers générés avant chaque build
  .cleanupOutputBeforeBuild()

  // Ajouter des noms de fichiers hashés pour la production
  .enableVersioning(Encore.isProduction())

  // Activer la prise en charge de Symfony
  .enableSingleRuntimeChunk();

module.exports = Encore.getWebpackConfig();
