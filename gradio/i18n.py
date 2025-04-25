from __future__ import annotations


class I18n:
    """
    Handles internationalization (i18n) for Gradio applications.

    Stores translation dictionaries and provides a method to retrieve translation keys.
    The translation lookup happens on the frontend based on the browser's locale
    and the provided translation dictionaries.
    """

    def __init__(self, **translations: dict[str, str]):
        """
        Initializes the I18n class.

        Args:
            **translations: Each keyword argument should be a locale code (e.g., "en", "fr") with a
                          dictionary value, which maps translation keys to translated strings.
                          Example: I18n(en={"greeting": "Hello"}, es={"greeting": "Hola"})
        """
        self.translations = translations or {}

    @property
    def translations_dict(self) -> dict[str, dict[str, str]]:
        """
        Returns the dictionary of translations provided during initialization.
        """
        return self.translations
