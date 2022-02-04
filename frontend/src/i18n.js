import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./langs/en.json'));
register('es', () => import('./langs/es.json'));

function setupi18n() {
  init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator(),
  });
}
