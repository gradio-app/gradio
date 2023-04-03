import { redirect } from '@sveltejs/kit';
import { redirects } from './redirects.js';

export async function load({ url }) {
    if (url.pathname in redirects) {
        throw redirect(302, redirects[url.pathname]);
    }
}