import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend'; // pour charger les traductions depuis des fichiers externes (optionnel)
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // Utilisation d'un backend pour charger les fichiers de traduction (si besoin)
  .use(LanguageDetector) // Détecteur de langue du navigateur
  .use(initReactI18next) // Lier i18next avec react-i18next
  .init({
    fallbackLng: 'de', // Langue par défaut si aucune langue n'est détectée
    supportedLngs: ['fr', 'en', 'es', 'de'], // Langues supportées
    ns: ['translations'], // namespace "translations" pour correspondre au nom d dossier
    defaultNS: 'translations',
    debug: true, // Activer le mode debug pour les logs dans la console
    interpolation: {
      escapeValue: false, // Pas besoin d'échapper les valeurs dans React
    },
    react: {
      useSuspense: true, // Utiliser `Suspense` pour le chargement des traductions
    },
    // Les options de backend si tu veux charger les traductions à partir de fichiers
    backend: {
      loadPath: '/translations/{{lng}}.json', // URL où les fichiers de traduction sont stockés
    },
    /*detection: {
      //order: ['localStorage', 'navigator'], // Utilise localStorage d'abord, puis la langue du navigateur
      //caches: ['localStorage'], // Garde la langue choisie dans le localStorage
      //lookupLocalStorage: 'i18nextLng', // Stocke la langue sous ce nom
    },*/
    load: 'languageOnly', // Charge uniquement "fr" ou "en" (et non "fr-FR")
  });

export default i18n;
