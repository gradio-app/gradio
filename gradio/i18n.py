from __future__ import annotations

import re
import warnings
from typing import Any


class I18nData:
    """
    A class that wraps a translation key with metadata.

    This object will be serialized and sent to the frontend, where the actual
    translation will happen using the frontend's i18n system.
    """

    def __init__(self, key: str):
        """
        Initialize a I18nData object.

        Args:
            key: The translation key to be translated in the frontend.
        """
        self.key = key
        self._type = "translation_metadata"

    def to_dict(self) -> dict[str, Any]:
        """
        Convert the I18nData object to a dictionary for serialization.
        This allows the frontend to recognize it as a translatable object.
        """
        return {"__type__": self._type, "key": self.key}

    def __str__(self) -> str:
        """
        String representation of the I18nData object.
        Used when the object is converted to a string.
        This returns a special format that can be recognized by the frontend
        as needing translation.
        """
        import json

        return f"__i18n__{json.dumps(self.to_dict())}"

    def __repr__(self) -> str:
        """
        Representation of the I18nData object for debugging.
        """
        return self.__str__()

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

    def __getattr__(self, name):
        """
        Handle attribute access for I18nData.
        This makes it possible to use I18nData objects in contexts
        that expect strings with methods.
        """
        if name.startswith("__") and name.endswith("__"):
            raise AttributeError(f"{self.__class__.__name__} has no attribute {name}")

        def method(*_args, **_kwargs):
            return self

        return method

    def tojson(self) -> dict[str, Any]:
        """
        Convert the I18nData object to a JSON-serializable dictionary.
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

    # BCP 47 language tag regex pattern
    _LOCALE_PATTERN = re.compile(r"^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$")

    def __init__(self, **translations: dict[str, str]):
        """
        Initializes the I18n class.

        Args:
            **translations: Each keyword argument should be a locale code (e.g., "en", "fr") with a
                          dictionary value, which maps translation keys to translated strings.
                          Example: gr.I18n(en={"greeting": "Hello"}, es={"greeting": "Hola"})

                          These translations can be passed to the frontend for use there.
        """
        self.translations = {}

        for locale, translation_dict in translations.items():
            if not self._is_valid_locale(locale):
                warnings.warn(
                    f"Invalid locale code: '{locale}'. Locale codes should follow BCP 47 format (e.g., 'en', 'en-US'). "
                    f"This locale will still be included, but may not work correctly.",
                    UserWarning,
                )
            self.translations[locale] = translation_dict

    def _is_valid_locale(self, locale: str) -> bool:
        return bool(self._LOCALE_PATTERN.match(locale))

    def __call__(self, key: str) -> I18nData:
        """
        Returns a I18nData object containing the translation key.

        This metadata object will be serialized and sent to the frontend,
        where it will be translated by the frontend's i18n system.

        Args:
            key: The key to identify the translation string (e.g., "submit_button").

        Returns:
            A I18nData object containing the translation key.
        """
        return I18nData(key)

    @property
    def translations_dict(self) -> dict[str, dict[str, str]]:
        """
        Returns the dictionary of translations provided during initialization.
        These can be passed to the frontend for use in its translation system.
        """
        return self.translations
