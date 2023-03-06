import gradio_banner from "../assets/img/header-image.jpg";
import { logos, tweets } from "../assets";


export async function load({fetch}) {

    let r = await fetch("https://api.github.com/repos/gradio-app/gradio");
    let j  = await r.json();
    let star_count = j.stargazers_count;

    return {
        gradio_banner,
        logos,
        tweets,
        star_count
    };
}