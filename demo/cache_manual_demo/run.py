"""Demo showcasing simple manual caching with gr.Cache()."""

import time

import gradio as gr

WEATHER_BY_CITY = {
    "san francisco": ("Foggy", 61),
    "new york": ("Cloudy", 72),
    "tokyo": ("Sunny", 78),
    "london": ("Rainy", 58),
    "nairobi": ("Clear", 75),
}


def normalize_city(city: str) -> str:
    return " ".join(city.lower().strip().split())


def lookup_weather(city: str, c=gr.Cache()):
    if not city.strip():
        return "", "Enter a city name.", ""

    cache_key = normalize_city(city)
    cached = c.get(cache_key)
    if cached is not None:
        return cached["forecast"], "Cache hit", cache_key

    time.sleep(2)
    condition, temperature = WEATHER_BY_CITY.get(cache_key, ("Windy", 68))
    forecast = (
        f"{city.strip()}: {condition}, {temperature} degF.\n"
        f"Normalized cache key: {cache_key}"
    )
    c.set(cache_key, forecast=forecast)
    return forecast, "Computed and stored", cache_key


with gr.Blocks(title="gr.Cache() Demo") as demo:
    gr.Markdown(
        "# `gr.Cache()` Demo\n"
        "This demo manually caches a normalized city lookup. "
        "Try the same city twice, or vary capitalization and spacing "
        "to reuse the same cached result."
    )

    city = gr.Textbox(label="City", value=" San   Francisco ")
    forecast = gr.Textbox(label="Forecast", lines=3)
    status = gr.Textbox(label="Status")
    cache_key = gr.Textbox(label="Cache key used")

    gr.Button("Lookup").click(lookup_weather, city, [forecast, status, cache_key])


if __name__ == "__main__":
    demo.launch()
