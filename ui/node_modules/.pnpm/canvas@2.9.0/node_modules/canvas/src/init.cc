// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include <cstdio>
#include <pango/pango.h>

#include <cairo.h>
#if CAIRO_VERSION < CAIRO_VERSION_ENCODE(1, 10, 0)
// CAIRO_FORMAT_RGB16_565: undeprecated in v1.10.0
// CAIRO_STATUS_INVALID_SIZE: v1.10.0
// CAIRO_FORMAT_INVALID: v1.10.0
// Lots of the compositing operators: v1.10.0
// JPEG MIME tracking: v1.10.0
// Note: CAIRO_FORMAT_RGB30 is v1.12.0 and still optional
#error("cairo v1.10.0 or later is required")
#endif

#include "Backends.h"
#include "Canvas.h"
#include "CanvasGradient.h"
#include "CanvasPattern.h"
#include "CanvasRenderingContext2d.h"
#include "Image.h"
#include "ImageData.h"

#include <ft2build.h>
#include FT_FREETYPE_H

using namespace v8;

// Compatibility with Visual Studio versions prior to VS2015
#if defined(_MSC_VER) && _MSC_VER < 1900
#define snprintf _snprintf
#endif

NAN_MODULE_INIT(init) {
  Backends::Initialize(target);
  Canvas::Initialize(target);
  Image::Initialize(target);
  ImageData::Initialize(target);
  Context2d::Initialize(target);
  Gradient::Initialize(target);
  Pattern::Initialize(target);

  Nan::Set(target, Nan::New<String>("cairoVersion").ToLocalChecked(), Nan::New<String>(cairo_version_string()).ToLocalChecked()).Check();
#ifdef HAVE_JPEG

#ifndef JPEG_LIB_VERSION_MAJOR
#ifdef JPEG_LIB_VERSION
#define JPEG_LIB_VERSION_MAJOR (JPEG_LIB_VERSION / 10)
#else
#define JPEG_LIB_VERSION_MAJOR 0
#endif
#endif

#ifndef JPEG_LIB_VERSION_MINOR
#ifdef JPEG_LIB_VERSION
#define JPEG_LIB_VERSION_MINOR (JPEG_LIB_VERSION % 10)
#else
#define JPEG_LIB_VERSION_MINOR 0
#endif
#endif

  char jpeg_version[10];
  static bool minor_gt_0 = JPEG_LIB_VERSION_MINOR > 0;
  if (minor_gt_0) {
    snprintf(jpeg_version, 10, "%d%c", JPEG_LIB_VERSION_MAJOR, JPEG_LIB_VERSION_MINOR + 'a' - 1);
  } else {
    snprintf(jpeg_version, 10, "%d", JPEG_LIB_VERSION_MAJOR);
  }
  Nan::Set(target, Nan::New<String>("jpegVersion").ToLocalChecked(), Nan::New<String>(jpeg_version).ToLocalChecked()).Check();
#endif

#ifdef HAVE_GIF
#ifndef GIF_LIB_VERSION
  char gif_version[10];
  snprintf(gif_version, 10, "%d.%d.%d", GIFLIB_MAJOR, GIFLIB_MINOR, GIFLIB_RELEASE);
  Nan::Set(target, Nan::New<String>("gifVersion").ToLocalChecked(), Nan::New<String>(gif_version).ToLocalChecked()).Check();
#else
  Nan::Set(target, Nan::New<String>("gifVersion").ToLocalChecked(), Nan::New<String>(GIF_LIB_VERSION).ToLocalChecked()).Check();
#endif
#endif

#ifdef HAVE_RSVG
  Nan::Set(target, Nan::New<String>("rsvgVersion").ToLocalChecked(), Nan::New<String>(LIBRSVG_VERSION).ToLocalChecked()).Check();
#endif

  char freetype_version[10];
  snprintf(freetype_version, 10, "%d.%d.%d", FREETYPE_MAJOR, FREETYPE_MINOR, FREETYPE_PATCH);
  Nan::Set(target, Nan::New<String>("freetypeVersion").ToLocalChecked(), Nan::New<String>(freetype_version).ToLocalChecked()).Check();
}

NODE_MODULE(canvas, init);
