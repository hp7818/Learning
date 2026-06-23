// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend'; // <--- Make sure this is imported
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) // <-- This plugin fetches from the public folder automatically
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'ja', 'my'], // Use 'ja' for Japanese (standard ISO code)
    fallbackLng: 'en',
    debug: false, 
    interpolation: {
      escapeValue: false, 
    },
    backend: {
      // This tells it to load files via network requests from public/locales/...
      loadPath: '/locales/{{lng}}/translation.json', 
    },
  });

export default i18n;