import argparse
import json
import os

from huggingface_hub import InferenceClient

client = InferenceClient(
    model="Qwen/Qwen2.5-72B-Instruct",
    provider="sambanova",
    token=os.getenv("SAMBANOVA_API_KEY"),
)


def translate_text(text: str, target_language: str) -> str:
    """Use the Hugging Face Inference API to translate text to the target language
    Use the llm `Qwen/Qwen2.5-72B-Instruct` with provider "sambanova"
    """
    system_prompt = f"""You are a helpful assistant that translates text from English to {target_language}. Only return the translation, nothing else. This text is the i18n for Gradio so use words and phrases that are common and expected in web apps.
    """
    prompt = f"""Translate the following English text to {target_language}. Only return the translation, nothing else: {text}"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt},
    ]
    response = client.chat_completion(messages)
    if isinstance(response.choices, list):
        translation = response.choices[0].message.content.strip().strip("\"'").strip()
    else:
        raise RuntimeError(f"Unexpected response from the API: {response}")
    return translation


def populate_i18n(lang: str):
    """Populate missing translations in the target language file from English."""
    with open("js/core/src/lang/en.json", encoding="utf-8-sig") as f:
        en_data = json.load(f)

    try:
        with open(f"js/core/src/lang/{lang}.json", encoding="utf-8-sig") as f:
            lang_data = json.load(f)
    except FileNotFoundError:
        lang_data = {}

    def update_nested(en_dict, lang_dict):
        """Recursively update nested dictionary with translations."""
        for key, value in en_dict.items():
            if isinstance(value, dict):
                lang_dict[key] = lang_dict.get(key, {})
                update_nested(value, lang_dict[key])
            elif key not in lang_dict:
                try:
                    translated_text = translate_text(value, lang)
                    print(f"Translating '{value}' to {lang}: '{translated_text}'")
                    lang_dict[key] = translated_text
                except Exception as e:
                    print(f"Error translating '{value}' to {lang}: {e}")

    update_nested(en_data, lang_data)

    with open(f"js/core/src/lang/{lang}.json", "w", encoding="utf-8") as f:
        json.dump(lang_data, f, indent=4, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser(description="Populate i18n translation files")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--lang", help="Target language code (filename without .json)")
    group.add_argument(
        "--all", action="store_true", help="Translate to all available languages"
    )

    args = parser.parse_args()

    lang_dir = "js/core/src/lang"

    if args.all:
        lang_files = [
            f[:-5]
            for f in os.listdir(lang_dir)
            if f.endswith(".json") and f not in ["en.json", "de.json", "tr.json", "lt.json"]
        ]
        for lang in lang_files:
            print(f"\nProcessing language: {lang}")
            populate_i18n(lang)
    else:
        if not os.path.exists(f"{lang_dir}/{args.lang}.json") and not os.path.exists(
            lang_dir
        ):
            raise ValueError(f"Language directory {lang_dir} does not exist")
        populate_i18n(args.lang)


if __name__ == "__main__":
    main()
