import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import path from 'path';
import { config } from '../config';

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, './locale/{{lng}}.json'),
    },
    fallbackLng: config.app.lang || 'id',
    preload: ['id', 'en'],
    nsSeparator: false,
    keySeparator: '.',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'header', 'cookie'],
      caches: false,
    },
  });

export default i18next;
export const i18nMiddleware = i18nextMiddleware.handle(i18next);
