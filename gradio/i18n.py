from __future__ import annotations

from typing import Any


class TranslationMetadata:
    """
    A class that wraps a translation key with metadata.

    This object will be serialized and sent to the frontend, where the actual
    translation will happen using the frontend's i18n system.
    """

    def __init__(self, key: str):
        """
        Initialize a TranslationMetadata object.

        Args:
            key: The translation key to be translated in the frontend.
        """
        self.key = key
        self._type = "translation_metadata"

    def to_dict(self) -> dict[str, Any]:
        """
        Convert the TranslationMetadata object to a dictionary for serialization.
        This allows the frontend to recognize it as a translatable object.
        """
        return {"__type__": self._type, "key": self.key}

    def __str__(self) -> str:
        """
        String representation of the TranslationMetadata object.
        Used when the object is converted to a string.
        This returns a special format that can be recognized by the frontend
        as needing translation.
        """
        import json
        # Create a JSON representation that can be detected and processed by the frontend
        return f"__i18n__{json.dumps(self.to_dict())}"

    def __repr__(self) -> str:
        """
        Representation of the TranslationMetadata object for debugging.
        """
        return self.__str__()

    # Add more string compatibility methods
    def __add__(self, other):
        """
        Handle string concatenation (self + other).
        """
        return str(self) + str(other)

    def __radd__(self, other):
        """
        Handle string concatenation (other + self).
        """
        return str(other) + str(self)

    # For attribute/method access attempts to be gracefully handled
    def __getattr__(self, name):
        """
        Handle attribute access for TranslationMetadata.
        This makes it possible to use TranslationMetadata objects in contexts
        that expect strings with methods.
        """
        if name.startswith('__') and name.endswith('__'):
            raise AttributeError(f"{self.__class__.__name__} has no attribute {name}")

        # Return a function that returns self for any method call
        def method(*args, **kwargs):
            return self
        return method

    # Make the object JSON-serializable
    def tojson(self) -> dict[str, Any]:
        """
        Convert the TranslationMetadata object to a JSON-serializable dictionary.
        This is used by the default Python JSON serializer.
        """
        return self.to_dict()


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
                          Example: gr.I18n(en={"greeting": "Hello"}, es={"greeting": "Hola"})

                          These translations can be passed to the frontend for use there.
        """
        self.translations = translations or {}

    def __call__(self, key: str) -> TranslationMetadata:
        """
        Returns a TranslationMetadata object containing the translation key.

        This metadata object will be serialized and sent to the frontend,
        where it will be translated by the frontend's i18n system.

        Args:
            key: The key to identify the translation string (e.g., "submit_button").

        Returns:
            A TranslationMetadata object containing the translation key.
        """
        return TranslationMetadata(key)

    @property
    def translations_dict(self) -> dict[str, dict[str, str]]:
        """
        Returns the dictionary of translations provided during initialization.
        These can be passed to the frontend for use in its translation system.
        """
        return self.translations
