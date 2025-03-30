
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import english from "./public/locales/en/translation.json";
import spanish from "./public/locales/es/translation.json";

i18n
.use(LanguageDetector)
.use(initReactI18next)
.init({
    debug: true,
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

console.log("i18n initialized with languages:", i18n.options.resources);
console.log("Current language:", i18n.language);
console.log("Available languages:", i18n.languages);
console.log("Language detection:", i18n.services.languageDetector);
console.log("Language detector:", i18n.services.languageDetector?.detector);
console.log("Language detector type:", i18n.services.languageDetector?.type);
console.log("Language detector cache:", i18n.services.languageDetector?.cache);


export default i18n;