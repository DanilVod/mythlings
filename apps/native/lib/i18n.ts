import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import ru from '../locales/ru.json';

const LANGUAGE_KEY = '@mythlings_language';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
};

export const initI18n = async () => {
  // Try to get saved language preference
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

  // Get device language if no saved preference
  const deviceLanguage = getLocales()[0]?.languageCode || 'en';

  // Use saved language, device language, or default to English
  const initialLanguage =
    savedLanguage || (deviceLanguage.startsWith('ru') ? 'ru' : 'en');

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
};

export const changeLanguage = async (language: string) => {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
};

export const getCurrentLanguage = () => i18n.language;

export default i18n;
