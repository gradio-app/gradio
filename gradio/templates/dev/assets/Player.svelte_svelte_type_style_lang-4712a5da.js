const n=e=>{let a=["B","KB","MB","GB","PB"],t=0;for(;e>1024;)e/=1024,t++;let l=a[t];return e.toFixed(1)+" "+l},r=()=>!0;function s(e,{autoplay:a}){async function t(){a&&await e.play()}return e.addEventListener("loadeddata",t),{destroy(){e.removeEventListener("loadeddata",t)}}}export{n as a,s as l,r as p};
//# sourceMappingURL=Player.svelte_svelte_type_style_lang-4712a5da.js.map
