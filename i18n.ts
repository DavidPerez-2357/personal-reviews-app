
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import english from "./public/locales/en/translation.json";
import spanish from "./public/locales/es/translation.json";

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
});

export default i18n;