#pragma once

#include <pango/pango.h>

PangoFontDescription *get_pango_font_description(unsigned char *filepath);
bool register_font(unsigned char *filepath);
bool deregister_font(unsigned char *filepath);
