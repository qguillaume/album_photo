const Encore = require("@symfony/webpack-encore");
const dotenv = require("dotenv");
dotenv.config(); // Charge les variables d'environnement depuis le fichier .env
const webpack = require("webpack");

Encore
  // Répertoire de sortie des fichiers compilés
  .setOutputPath("public/build/")

  // Chemin public pour inclure les fichiers dans Twig
  .setPublicPath("/build")

  // Ajouter une entrée SCSS principale
  .addStyleEntry("app", "./assets/styles/app.scss")

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
  .enableSingleRuntimeChunk()

  // Ajouter DefinePlugin pour injecter les variables d'environnement dans le code JS
  .addPlugin(
    new webpack.DefinePlugin({
      "process.env.REACT_APP_API_URL": JSON.stringify(
        process.env.REACT_APP_API_URL
      ),
    })
  );

module.exports = Encore.getWebpackConfig();
