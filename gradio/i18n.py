from __future__ import annotations


class _I18n:
    """
    Handles internationalization (i18n) for Gradio applications.

    Stores translation dictionaries and provides a method to retrieve translation keys.
    The translation lookup happens on the frontend based on the browser's locale
    and the provided translation dictionaries.
    """

    def __init__(self, translations: dict[str, dict[str, str]] | None = None):
        """
        Initializes the I18n class.

        Args:
            translations: A dictionary where keys are locale codes (e.g., "en", "es")
                          and values are dictionaries mapping translation keys to translated strings.
                          Example: {"en": {"greeting": "Hello"}, "es": {"greeting": "Hola"}}
        """
        self.translations = translations or {}

    def __call__(self, key: str) -> str:
        """
        Returns the translation key.

        This key is used by the frontend to look up the appropriate translation based on the
        current locale and the translations provided during initialization.

        Args:
            key: The key to identify the translation string (e.g., "submit_button").

        Returns:
            The translation key as a string.
        """
        return key

    @property
    def translations_dict(self) -> dict[str, dict[str, str]]:
        """
        Returns the dictionary of translations provided during initialization.
        """
        return self.translations
