import { register } from 'node:module';

console.error("CALLING REGISTER");
register('./hooks.mjs', import.meta.url);