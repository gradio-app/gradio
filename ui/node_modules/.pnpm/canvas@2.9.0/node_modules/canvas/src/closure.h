// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

#include "Canvas.h"

#ifdef HAVE_JPEG
#include <jpeglib.h>
#endif

#include <nan.h>
#include <png.h>
#include <stdint.h> // node < 7 uses libstdc++ on macOS which lacks complete c++11
#include <vector>

#ifndef PAGE_SIZE
  #define PAGE_SIZE 4096
#endif

/*
 * Image encoding closures.
 */

struct Closure {
  std::vector<uint8_t> vec;
  Nan::Callback cb;
  Canvas* canvas = nullptr;
  cairo_status_t status = CAIRO_STATUS_SUCCESS;

  static cairo_status_t writeVec(void *c, const uint8_t *odata, unsigned len) {
    Closure* closure = static_cast<Closure*>(c);
    try {
      closure->vec.insert(closure->vec.end(), odata, odata + len);
    } catch (const std::bad_alloc &) {
      return CAIRO_STATUS_NO_MEMORY;
    }
    return CAIRO_STATUS_SUCCESS;
  }

  Closure(Canvas* canvas) : canvas(canvas) {};
};

struct PdfSvgClosure : Closure {
  PdfSvgClosure(Canvas* canvas) : Closure(canvas) {};
};

struct PngClosure : Closure {
  uint32_t compressionLevel = 6;
  uint32_t filters = PNG_ALL_FILTERS;
  uint32_t resolution = 0; // 0 = unspecified
  // Indexed PNGs:
  uint32_t nPaletteColors = 0;
  uint8_t* palette = nullptr;
  uint8_t backgroundIndex = 0;

  PngClosure(Canvas* canvas) : Closure(canvas) {};
};

#ifdef HAVE_JPEG
struct JpegClosure : Closure {
  uint32_t quality = 75;
  uint32_t chromaSubsampling = 2;
  bool progressive = false;
  jpeg_destination_mgr* jpeg_dest_mgr = nullptr;

  static void init_destination(j_compress_ptr cinfo);
  static boolean empty_output_buffer(j_compress_ptr cinfo);
  static void term_destination(j_compress_ptr cinfo);

  JpegClosure(Canvas* canvas) : Closure(canvas) {
    jpeg_dest_mgr = new jpeg_destination_mgr;
    jpeg_dest_mgr->init_destination = init_destination;
    jpeg_dest_mgr->empty_output_buffer = empty_output_buffer;
    jpeg_dest_mgr->term_destination = term_destination;
  };

  ~JpegClosure() {
    delete jpeg_dest_mgr;
  }
};
#endif
