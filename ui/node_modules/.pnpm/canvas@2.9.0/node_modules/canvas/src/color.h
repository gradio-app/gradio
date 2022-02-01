// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

#include <stdint.h> // node < 7 uses libstdc++ on macOS which lacks complete c++11
#include <cstdlib>

/*
 * RGBA struct.
 */

typedef struct {
  double r, g, b, a;
} rgba_t;

/*
 * Prototypes.
 */

rgba_t
rgba_create(uint32_t rgba);

int32_t
rgba_from_string(const char *str, short *ok);

void
rgba_to_string(rgba_t rgba, char *buf, size_t len);

void
rgba_inspect(int32_t rgba);
