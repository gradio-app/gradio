# -*- coding: utf-8 -*-
# Copyright (c) The python-semanticversion project
# This code is distributed under the two-clause BSD License.

import warnings

import django
from django.db import models

if django.VERSION >= (3, 0):
    # See https://docs.djangoproject.com/en/dev/releases/3.0/#features-deprecated-in-3-0
    from django.utils.translation import gettext_lazy as _
else:
    from django.utils.translation import ugettext_lazy as _

from . import base


class SemVerField(models.CharField):

    def __init__(self, *args, **kwargs):
        kwargs.setdefault('max_length', 200)
        super(SemVerField, self).__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection, *args):
        """Convert from the database format.

        This should be the inverse of self.get_prep_value()
        """
        return self.to_python(value)

    def get_prep_value(self, obj):
        return None if obj is None else str(obj)

    def get_db_prep_value(self, value, connection, prepared=False):
        if not prepared:
            value = self.get_prep_value(value)
        return value

    def value_to_string(self, obj):
        value = self.to_python(self.value_from_object(obj))
        return str(value)

    def run_validators(self, value):
        return super(SemVerField, self).run_validators(str(value))


class VersionField(SemVerField):
    default_error_messages = {
        'invalid': _("Enter a valid version number in X.Y.Z format."),
    }
    description = _("Version")

    def __init__(self, *args, **kwargs):
        self.partial = kwargs.pop('partial', False)
        if self.partial:
            warnings.warn(
                "Use of `partial=True` will be removed in 3.0.",
                DeprecationWarning,
                stacklevel=2,
            )
        self.coerce = kwargs.pop('coerce', False)
        super(VersionField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        """Handle django.db.migrations."""
        name, path, args, kwargs = super(VersionField, self).deconstruct()
        kwargs['partial'] = self.partial
        kwargs['coerce'] = self.coerce
        return name, path, args, kwargs

    def to_python(self, value):
        """Converts any value to a base.Version field."""
        if value is None or value == '':
            return value
        if isinstance(value, base.Version):
            return value
        if self.coerce:
            return base.Version.coerce(value, partial=self.partial)
        else:
            return base.Version(value, partial=self.partial)


class SpecField(SemVerField):
    default_error_messages = {
        'invalid': _("Enter a valid version number spec list in ==X.Y.Z,>=A.B.C format."),
    }
    description = _("Version specification list")

    def __init__(self, *args, **kwargs):
        self.syntax = kwargs.pop('syntax', base.DEFAULT_SYNTAX)
        super(SpecField, self).__init__(*args, **kwargs)

    def deconstruct(self):
        """Handle django.db.migrations."""
        name, path, args, kwargs = super(SpecField, self).deconstruct()
        if self.syntax != base.DEFAULT_SYNTAX:
            kwargs['syntax'] = self.syntax
        return name, path, args, kwargs

    def to_python(self, value):
        """Converts any value to a base.Spec field."""
        if value is None or value == '':
            return value
        if isinstance(value, base.BaseSpec):
            return value
        return base.BaseSpec.parse(value, syntax=self.syntax)
