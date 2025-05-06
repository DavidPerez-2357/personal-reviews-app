import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import english from "./src/shared/i18n/en/translation.json";
import spanish from "./src/shared/i18n/es/translation.json";

i18n
.use(LanguageDetector)
.use(initReactI18next)
.init({
    fallbackLng: "en",
    resources: {
        en: {
            translation: english,
        },
        es: {
            translation: spanish,
        },
    },
    interpolation: {
        escapeValue: false,
    },
    detection: { // Añadir esta sección para configurar el detector de idioma
      order: ['localStorage', 'navigator'], // Priorizar localStorage
      lookupLocalStorage: 'language', // Usar la misma clave que en ChangeLanguageModal.tsx
    }
});

export default i18n;