const Encore = require("@symfony/webpack-encore");

Encore
  // Répertoire de sortie des fichiers compilés
  .setOutputPath("public/build/")

  // Chemin public pour inclure les fichiers dans Twig
  .setPublicPath("/build")

  // Ajouter une entrée SCSS principale
  .addStyleEntry("app", "./assets/styles/app.scss")

  // Activer le support SCSS
  .enableSassLoader()

  // Nettoyer les fichiers générés avant chaque build
  .cleanupOutputBeforeBuild()

  // Ajouter des noms de fichiers hashés pour la production
  .enableVersioning(Encore.isProduction())

  // Activer la prise en charge de Symfony
  .enableSingleRuntimeChunk();

module.exports = Encore.getWebpackConfig();
