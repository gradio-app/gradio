import { json } from '@sveltejs/kit';
import SYSTEM_PROMPT from "$lib/json/system_prompt.json";

export async function GET({ url }) {
    const worker_url = "https://llms-txt.playground-worker.pages.dev/api/prompt";
    // const worker_url = "https://playground-worker.pages.dev/api/prompt";
    // const worker_url = "http://localhost:5173/api/prompt";

    const query = url.searchParams.get('q')?.toLowerCase() || '';
    const format = url.searchParams.get('format')?.toLowerCase() || 'text';
    
    const response = await fetch(worker_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": url.origin
        },
        body: JSON.stringify({ 
            prompt_to_embed: query, 
            SYSTEM_PROMPT: SYSTEM_PROMPT.SYSTEM,
            FALLBACK_PROMPT: SYSTEM_PROMPT.FALLBACK
         })
    });

    const data = await response.json();

    console.log(data);

    if (format === 'json') {
        return json(data);
    } else {
        return new Response(data.SYS_PROMPT, {
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    }
}