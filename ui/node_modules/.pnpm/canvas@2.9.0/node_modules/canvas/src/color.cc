// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include "color.h"

#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <cstring>
#include <limits>
#include <map>
#include <string>

// Compatibility with Visual Studio versions prior to VS2015
#if defined(_MSC_VER) && _MSC_VER < 1900
#define snprintf _snprintf
#endif

/*
 * Parse integer value
 */

template <typename parsed_t>
static bool
parse_integer(const char** pStr, parsed_t *pParsed) {
  parsed_t& c = *pParsed;
  const char*& str = *pStr;
  int8_t sign=1;

  c = 0;
  if (*str == '-') {
    sign=-1;
    ++str;
  }
  else if (*str == '+')
    ++str;

  if (*str >= '0' && *str <= '9') {
     do {
       c *= 10;
       c += *str++ - '0';
     } while (*str >= '0' && *str <= '9');
   } else {
     return false;
   }
   if (sign<0)
    c=-c;
   return true;
}


/*
 * Parse CSS <number> value
 * Adapted from http://crackprogramming.blogspot.co.il/2012/10/implement-atof.html
 */

template <typename parsed_t>
static bool
parse_css_number(const char** pStr, parsed_t *pParsed) {
   parsed_t &parsed = *pParsed;
   const char*& str = *pStr;
   const char* startStr = str;
   if (!str || !*str)
       return false;
   parsed_t integerPart = 0;
   parsed_t fractionPart = 0;
   int divisorForFraction = 1;
   int sign = 1;
   int exponent = 0;
   int digits = 0;
   bool inFraction = false;

   if (*str == '-') {
       ++str;
       sign = -1;
   }
   else if (*str == '+')
       ++str;
   while (*str != '\0') {
       if (*str >= '0' && *str <= '9') {
          if (digits>=std::numeric_limits<parsed_t>::digits10) {
            if (!inFraction)
              return false;
          }
          else {
            ++digits;

            if (inFraction) {
                fractionPart = fractionPart*10 + (*str - '0');
                divisorForFraction *= 10;
            }
            else {
                integerPart = integerPart*10 + (*str - '0');
            }
          }
       }
       else if (*str == '.') {
           if (inFraction)
               break;
           else
               inFraction = true;
       }
       else if (*str == 'e') {
          ++str;
          if (!parse_integer(&str, &exponent))
            return false;
          break;
       }
       else
          break;
       ++str;
   }
   if (str != startStr) {
      parsed = sign * (integerPart + fractionPart/divisorForFraction);
      for (;exponent>0;--exponent)
        parsed *= 10;
      for (;exponent<0;++exponent)
        parsed /= 10;
      return true;
   }
   return false;
}

/*
 * Clip value to the range [minValue, maxValue]
 */

template <typename T>
static T
clip(T value, T minValue, T maxValue) {
  if (value > maxValue)
      value = maxValue;
  if (value < minValue)
      value = minValue;
  return value;
}

/*
 * Wrap value to the range [0, limit]
 */

template <typename T>
static T
wrap_float(T value, T limit) {
  return fmod(fmod(value, limit) + limit, limit);
}

/*
 * Wrap value to the range [0, limit] - currently-unused integer version of wrap_float
 */

// template <typename T>
// static T wrap_int(T value, T limit) {
//   return (value % limit + limit) % limit;
// }

/*
 * Parse color channel value
 */

static bool
parse_rgb_channel(const char** pStr, uint8_t *pChannel) {
  int channel;
  if (parse_integer(pStr, &channel)) {
    *pChannel = clip(channel, 0, 255);
    return true;
  }
  return false;
}

/*
 * Parse a value in degrees
 */

static bool
parse_degrees(const char** pStr, float *pDegrees) {
  float degrees;
  if (parse_css_number(pStr, &degrees)) {
    *pDegrees = wrap_float(degrees, 360.0f);
    return true;
  }
  return false;
}

/*
 * Parse and clip a percentage value. Returns a float in the range [0, 1].
 */

static bool
parse_clipped_percentage(const char** pStr, float *pFraction) {
  float percentage;
  bool result = parse_css_number(pStr,&percentage);
  const char*& str = *pStr;
  if (result) {
    if (*str == '%') {
      ++str;
      *pFraction = clip(percentage, 0.0f, 100.0f) / 100.0f;
      return result;
    }
  }
  return false;
}

/*
 * Macros to help with parsing inside rgba_from_*_string
 */

#define WHITESPACE \
  while (' ' == *str) ++str;

#define WHITESPACE_OR_COMMA \
  while (' ' == *str || ',' == *str) ++str;

#define CHANNEL(NAME) \
   if (!parse_rgb_channel(&str, &NAME)) \
    return 0; \

#define HUE(NAME) \
   if (!parse_degrees(&str, &NAME)) \
    return 0;

#define SATURATION(NAME) \
   if (!parse_clipped_percentage(&str, &NAME)) \
    return 0;

#define LIGHTNESS(NAME) SATURATION(NAME)

#define ALPHA(NAME) \
  if (*str >= '1' && *str <= '9') { \
      NAME = 1; \
    } else { \
      if ('0' == *str) ++str; \
      if ('.' == *str) { \
        ++str; \
        float n = .1f; \
        while (*str >= '0' && *str <= '9') { \
          NAME += (*str++ - '0') * n; \
          n *= .1f; \
        } \
      } \
    } \
    do {} while (0) // require trailing semicolon

/*
 * Named colors.
 */
static const std::map<std::string, uint32_t> named_colors = {
    { "transparent", 0xFFFFFF00}
  , { "aliceblue", 0xF0F8FFFF }
  , { "antiquewhite", 0xFAEBD7FF }
  , { "aqua", 0x00FFFFFF }
  , { "aquamarine", 0x7FFFD4FF }
  , { "azure", 0xF0FFFFFF }
  , { "beige", 0xF5F5DCFF }
  , { "bisque", 0xFFE4C4FF }
  , { "black", 0x000000FF }
  , { "blanchedalmond", 0xFFEBCDFF }
  , { "blue", 0x0000FFFF }
  , { "blueviolet", 0x8A2BE2FF }
  , { "brown", 0xA52A2AFF }
  , { "burlywood", 0xDEB887FF }
  , { "cadetblue", 0x5F9EA0FF }
  , { "chartreuse", 0x7FFF00FF }
  , { "chocolate", 0xD2691EFF }
  , { "coral", 0xFF7F50FF }
  , { "cornflowerblue", 0x6495EDFF }
  , { "cornsilk", 0xFFF8DCFF }
  , { "crimson", 0xDC143CFF }
  , { "cyan", 0x00FFFFFF }
  , { "darkblue", 0x00008BFF }
  , { "darkcyan", 0x008B8BFF }
  , { "darkgoldenrod", 0xB8860BFF }
  , { "darkgray", 0xA9A9A9FF }
  , { "darkgreen", 0x006400FF }
  , { "darkgrey", 0xA9A9A9FF }
  , { "darkkhaki", 0xBDB76BFF }
  , { "darkmagenta", 0x8B008BFF }
  , { "darkolivegreen", 0x556B2FFF }
  , { "darkorange", 0xFF8C00FF }
  , { "darkorchid", 0x9932CCFF }
  , { "darkred", 0x8B0000FF }
  , { "darksalmon", 0xE9967AFF }
  , { "darkseagreen", 0x8FBC8FFF }
  , { "darkslateblue", 0x483D8BFF }
  , { "darkslategray", 0x2F4F4FFF }
  , { "darkslategrey", 0x2F4F4FFF }
  , { "darkturquoise", 0x00CED1FF }
  , { "darkviolet", 0x9400D3FF }
  , { "deeppink", 0xFF1493FF }
  , { "deepskyblue", 0x00BFFFFF }
  , { "dimgray", 0x696969FF }
  , { "dimgrey", 0x696969FF }
  , { "dodgerblue", 0x1E90FFFF }
  , { "firebrick", 0xB22222FF }
  , { "floralwhite", 0xFFFAF0FF }
  , { "forestgreen", 0x228B22FF }
  , { "fuchsia", 0xFF00FFFF }
  , { "gainsboro", 0xDCDCDCFF }
  , { "ghostwhite", 0xF8F8FFFF }
  , { "gold", 0xFFD700FF }
  , { "goldenrod", 0xDAA520FF }
  , { "gray", 0x808080FF }
  , { "green", 0x008000FF }
  , { "greenyellow", 0xADFF2FFF }
  , { "grey", 0x808080FF }
  , { "honeydew", 0xF0FFF0FF }
  , { "hotpink", 0xFF69B4FF }
  , { "indianred", 0xCD5C5CFF }
  , { "indigo", 0x4B0082FF }
  , { "ivory", 0xFFFFF0FF }
  , { "khaki", 0xF0E68CFF }
  , { "lavender", 0xE6E6FAFF }
  , { "lavenderblush", 0xFFF0F5FF }
  , { "lawngreen", 0x7CFC00FF }
  , { "lemonchiffon", 0xFFFACDFF }
  , { "lightblue", 0xADD8E6FF }
  , { "lightcoral", 0xF08080FF }
  , { "lightcyan", 0xE0FFFFFF }
  , { "lightgoldenrodyellow", 0xFAFAD2FF }
  , { "lightgray", 0xD3D3D3FF }
  , { "lightgreen", 0x90EE90FF }
  , { "lightgrey", 0xD3D3D3FF }
  , { "lightpink", 0xFFB6C1FF }
  , { "lightsalmon", 0xFFA07AFF }
  , { "lightseagreen", 0x20B2AAFF }
  , { "lightskyblue", 0x87CEFAFF }
  , { "lightslategray", 0x778899FF }
  , { "lightslategrey", 0x778899FF }
  , { "lightsteelblue", 0xB0C4DEFF }
  , { "lightyellow", 0xFFFFE0FF }
  , { "lime", 0x00FF00FF }
  , { "limegreen", 0x32CD32FF }
  , { "linen", 0xFAF0E6FF }
  , { "magenta", 0xFF00FFFF }
  , { "maroon", 0x800000FF }
  , { "mediumaquamarine", 0x66CDAAFF }
  , { "mediumblue", 0x0000CDFF }
  , { "mediumorchid", 0xBA55D3FF }
  , { "mediumpurple", 0x9370DBFF }
  , { "mediumseagreen", 0x3CB371FF }
  , { "mediumslateblue", 0x7B68EEFF }
  , { "mediumspringgreen", 0x00FA9AFF }
  , { "mediumturquoise", 0x48D1CCFF }
  , { "mediumvioletred", 0xC71585FF }
  , { "midnightblue", 0x191970FF }
  , { "mintcream", 0xF5FFFAFF }
  , { "mistyrose", 0xFFE4E1FF }
  , { "moccasin", 0xFFE4B5FF }
  , { "navajowhite", 0xFFDEADFF }
  , { "navy", 0x000080FF }
  , { "oldlace", 0xFDF5E6FF }
  , { "olive", 0x808000FF }
  , { "olivedrab", 0x6B8E23FF }
  , { "orange", 0xFFA500FF }
  , { "orangered", 0xFF4500FF }
  , { "orchid", 0xDA70D6FF }
  , { "palegoldenrod", 0xEEE8AAFF }
  , { "palegreen", 0x98FB98FF }
  , { "paleturquoise", 0xAFEEEEFF }
  , { "palevioletred", 0xDB7093FF }
  , { "papayawhip", 0xFFEFD5FF }
  , { "peachpuff", 0xFFDAB9FF }
  , { "peru", 0xCD853FFF }
  , { "pink", 0xFFC0CBFF }
  , { "plum", 0xDDA0DDFF }
  , { "powderblue", 0xB0E0E6FF }
  , { "purple", 0x800080FF }
  , { "rebeccapurple", 0x663399FF } // Source: CSS Color Level 4 draft
  , { "red", 0xFF0000FF }
  , { "rosybrown", 0xBC8F8FFF }
  , { "royalblue", 0x4169E1FF }
  , { "saddlebrown", 0x8B4513FF }
  , { "salmon", 0xFA8072FF }
  , { "sandybrown", 0xF4A460FF }
  , { "seagreen", 0x2E8B57FF }
  , { "seashell", 0xFFF5EEFF }
  , { "sienna", 0xA0522DFF }
  , { "silver", 0xC0C0C0FF }
  , { "skyblue", 0x87CEEBFF }
  , { "slateblue", 0x6A5ACDFF }
  , { "slategray", 0x708090FF }
  , { "slategrey", 0x708090FF }
  , { "snow", 0xFFFAFAFF }
  , { "springgreen", 0x00FF7FFF }
  , { "steelblue", 0x4682B4FF }
  , { "tan", 0xD2B48CFF }
  , { "teal", 0x008080FF }
  , { "thistle", 0xD8BFD8FF }
  , { "tomato", 0xFF6347FF }
  , { "turquoise", 0x40E0D0FF }
  , { "violet", 0xEE82EEFF }
  , { "wheat", 0xF5DEB3FF }
  , { "white", 0xFFFFFFFF }
  , { "whitesmoke", 0xF5F5F5FF }
  , { "yellow", 0xFFFF00FF }
  , { "yellowgreen", 0x9ACD32FF }
};

/*
 * Hex digit int val.
 */

static int
h(char c) {
  switch (c) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      return c - '0';
    case 'a':
    case 'b':
    case 'c':
    case 'd':
    case 'e':
    case 'f':
      return (c - 'a') + 10;
    case 'A':
    case 'B':
    case 'C':
    case 'D':
    case 'E':
    case 'F':
      return (c - 'A') + 10;
  }
  return 0;
}

/*
 * Return rgba_t from rgba.
 */

rgba_t
rgba_create(uint32_t rgba) {
  rgba_t color;
  color.r = (double) (rgba >> 24) / 255;
  color.g = (double) (rgba >> 16 & 0xff) / 255;
  color.b = (double) (rgba >> 8 & 0xff) / 255;
  color.a = (double) (rgba & 0xff) / 255;
  return color;
}

/*
 * Return a string representation of the color.
 */

void
rgba_to_string(rgba_t rgba, char *buf, size_t len) {
  if (1 == rgba.a) {
    snprintf(buf, len, "#%.2x%.2x%.2x",
      static_cast<int>(round(rgba.r * 255)),
      static_cast<int>(round(rgba.g * 255)),
      static_cast<int>(round(rgba.b * 255)));
  } else {
    snprintf(buf, len, "rgba(%d, %d, %d, %.2f)",
      static_cast<int>(round(rgba.r * 255)),
      static_cast<int>(round(rgba.g * 255)),
      static_cast<int>(round(rgba.b * 255)),
      rgba.a);
  }
}

/*
 * Return rgba from (r,g,b,a).
 */

static inline int32_t
rgba_from_rgba(uint8_t r, uint8_t g, uint8_t b, uint8_t a) {
  return
      r << 24
    | g << 16
    | b << 8
    | a;
}

/*
 * Helper function used in rgba_from_hsla().
 * Based on http://dev.w3.org/csswg/css-color-4/#hsl-to-rgb
 */

static float
hue_to_rgb(float t1, float t2, float hue) {
  if (hue < 0)
    hue += 6;
  if (hue >= 6)
    hue -= 6;

  if (hue < 1)
    return (t2 - t1) * hue + t1;
  else if (hue < 3)
    return t2;
  else if (hue < 4)
    return (t2 - t1) * (4 - hue) + t1;
  else
    return t1;
}

/*
 * Return rgba from (h,s,l,a).
 * Expects h values in the range [0, 360), and s, l, a in the range [0, 1].
 * Adapted from http://dev.w3.org/csswg/css-color-4/#hsl-to-rgb
 */

static inline int32_t
rgba_from_hsla(float h_deg, float s, float l, float a) {
  uint8_t r, g, b;
  float h = (6 * h_deg) / 360.0f, m1, m2;

  if (l<=0.5)
    m2=l*(s+1);
  else
    m2=l+s-l*s;
  m1 = l*2 - m2;

  // Scale and round the RGB components
  r = (uint8_t)floor(hue_to_rgb(m1, m2, h + 2) * 255 + 0.5);
  g = (uint8_t)floor(hue_to_rgb(m1, m2, h    ) * 255 + 0.5);
  b = (uint8_t)floor(hue_to_rgb(m1, m2, h - 2) * 255 + 0.5);

  return rgba_from_rgba(r, g, b, (uint8_t) (a * 255));
}

/*
 * Return rgba from (h,s,l).
 * Expects h values in the range [0, 360), and s, l in the range [0, 1].
 */

static inline int32_t
rgba_from_hsl(float h_deg, float s, float l) {
  return rgba_from_hsla(h_deg, s, l, 1.0);
}


/*
 * Return rgba from (r,g,b).
 */

static int32_t
rgba_from_rgb(uint8_t r, uint8_t g, uint8_t b) {
  return rgba_from_rgba(r, g, b, 255);
}

/*
 * Return rgba from #RRGGBBAA
 */

static int32_t
rgba_from_hex8_string(const char *str) {
  return rgba_from_rgba(
    (h(str[0]) << 4) + h(str[1]),
    (h(str[2]) << 4) + h(str[3]),
    (h(str[4]) << 4) + h(str[5]),
    (h(str[6]) << 4) + h(str[7])
  );
}

/*
 * Return rgb from "#RRGGBB".
 */

static int32_t
rgba_from_hex6_string(const char *str) {
  return rgba_from_rgb(
      (h(str[0]) << 4) + h(str[1])
    , (h(str[2]) << 4) + h(str[3])
    , (h(str[4]) << 4) + h(str[5])
    );
}

/*
* Return rgba from #RGBA
*/

static int32_t
rgba_from_hex4_string(const char *str) {
  return rgba_from_rgba(
    (h(str[0]) << 4) + h(str[0]),
    (h(str[1]) << 4) + h(str[1]),
    (h(str[2]) << 4) + h(str[2]),
    (h(str[3]) << 4) + h(str[3])
  );
}

/*
 * Return rgb from "#RGB"
 */

static int32_t
rgba_from_hex3_string(const char *str) {
  return rgba_from_rgb(
      (h(str[0]) << 4) + h(str[0])
    , (h(str[1]) << 4) + h(str[1])
    , (h(str[2]) << 4) + h(str[2])
    );
}

/*
 * Return rgb from "rgb()"
 */

static int32_t
rgba_from_rgb_string(const char *str, short *ok) {
  if (str == strstr(str, "rgb(")) {
    str += 4;
    WHITESPACE;
    uint8_t r = 0, g = 0, b = 0;
    CHANNEL(r);
    WHITESPACE_OR_COMMA;
    CHANNEL(g);
    WHITESPACE_OR_COMMA;
    CHANNEL(b);
    WHITESPACE;
    return *ok = 1, rgba_from_rgb(r, g, b);
  }
  return *ok = 0;
}

/*
 * Return rgb from "rgba()"
 */

static int32_t
rgba_from_rgba_string(const char *str, short *ok) {
  if (str == strstr(str, "rgba(")) {
    str += 5;
    WHITESPACE;
    uint8_t r = 0, g = 0, b = 0;
    float a = 0;
    CHANNEL(r);
    WHITESPACE_OR_COMMA;
    CHANNEL(g);
    WHITESPACE_OR_COMMA;
    CHANNEL(b);
    WHITESPACE_OR_COMMA;
    ALPHA(a);
    WHITESPACE;
    return *ok = 1, rgba_from_rgba(r, g, b, (int) (a * 255));
  }
  return *ok = 0;
}

/*
 * Return rgb from "hsla()"
 */

static int32_t
rgba_from_hsla_string(const char *str, short *ok) {
  if (str == strstr(str, "hsla(")) {
    str += 5;
    WHITESPACE;
    float h_deg = 0;
    float s = 0, l = 0;
    float a = 0;
    HUE(h_deg);
    WHITESPACE_OR_COMMA;
    SATURATION(s);
    WHITESPACE_OR_COMMA;
    LIGHTNESS(l);
    WHITESPACE_OR_COMMA;
    ALPHA(a);
    WHITESPACE;
    return *ok = 1, rgba_from_hsla(h_deg, s, l, a);
  }
  return *ok = 0;
}

/*
 * Return rgb from "hsl()"
 */

static int32_t
rgba_from_hsl_string(const char *str, short *ok) {
  if (str == strstr(str, "hsl(")) {
    str += 4;
    WHITESPACE;
    float h_deg = 0;
    float s = 0, l = 0;
    HUE(h_deg);
    WHITESPACE_OR_COMMA;
    SATURATION(s);
    WHITESPACE_OR_COMMA;
    LIGHTNESS(l);
    WHITESPACE;
    return *ok = 1, rgba_from_hsl(h_deg, s, l);
  }
  return *ok = 0;
}


/*
 * Return rgb from:
 *
 *  - "#RGB"
 *  - "#RGBA"
 *  - "#RRGGBB"
 *  - "#RRGGBBAA"
 *
 */

static int32_t
rgba_from_hex_string(const char *str, short *ok) {
  size_t len = strlen(str);
  *ok = 1;
  switch (len) {
    case 8: return rgba_from_hex8_string(str);
    case 6: return rgba_from_hex6_string(str);
    case 4: return rgba_from_hex4_string(str);
    case 3: return rgba_from_hex3_string(str);
  }
  return *ok = 0;
}

/*
 * Return named color value.
 */

static int32_t
rgba_from_name_string(const char *str, short *ok) {
  std::string lowered(str);
  std::transform(lowered.begin(), lowered.end(), lowered.begin(), tolower);
  auto color = named_colors.find(lowered);
  if (color != named_colors.end()) {
    return *ok = 1, color->second;
  }
  return *ok = 0;
}

/*
 * Return rgb from:
 *
 *  - #RGB
 *  - #RGBA
 *  - #RRGGBB
 *  - #RRGGBBAA
 *  - rgb(r,g,b)
 *  - rgba(r,g,b,a)
 *  - hsl(h,s,l)
 *  - hsla(h,s,l,a)
 *  - name
 *
 */

int32_t
rgba_from_string(const char *str, short *ok) {
  if ('#' == str[0])
    return rgba_from_hex_string(++str, ok);
  if (str == strstr(str, "rgba"))
    return rgba_from_rgba_string(str, ok);
  if (str == strstr(str, "rgb"))
    return rgba_from_rgb_string(str, ok);
  if (str == strstr(str, "hsla"))
    return rgba_from_hsla_string(str, ok);
  if (str == strstr(str, "hsl"))
    return rgba_from_hsl_string(str, ok);
  return rgba_from_name_string(str, ok);
}

/*
 * Inspect the given rgba color.
 */

void
rgba_inspect(int32_t rgba) {
  printf("rgba(%d,%d,%d,%d)\n"
    , rgba >> 24 & 0xff
    , rgba >> 16 & 0xff
    , rgba >> 8 & 0xff
    , rgba & 0xff
    );
}
