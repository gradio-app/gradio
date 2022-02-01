// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

#include <cairo.h>
#include "CanvasError.h"
#include <functional>
#include <nan.h>
#include <stdint.h> // node < 7 uses libstdc++ on macOS which lacks complete c++11
#include <v8.h>

#ifdef HAVE_JPEG
#include <jpeglib.h>
#include <jerror.h>
#endif

#ifdef HAVE_GIF
#include <gif_lib.h>

  #if GIFLIB_MAJOR > 5 || GIFLIB_MAJOR == 5 && GIFLIB_MINOR >= 1
    #define GIF_CLOSE_FILE(gif) DGifCloseFile(gif, NULL)
  #else
    #define GIF_CLOSE_FILE(gif) DGifCloseFile(gif)
  #endif
#endif

#ifdef HAVE_RSVG
#include <librsvg/rsvg.h>
  // librsvg <= 2.36.1, identified by undefined macro, needs an extra include
  #ifndef LIBRSVG_CHECK_VERSION
  #include <librsvg/rsvg-cairo.h>
  #endif
#endif

using JPEGDecodeL = std::function<uint32_t (uint8_t* const src)>;

class Image: public Nan::ObjectWrap {
  public:
    char *filename;
    int width, height;
    int naturalWidth, naturalHeight;
    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    static NAN_GETTER(GetComplete);
    static NAN_GETTER(GetWidth);
    static NAN_GETTER(GetHeight);
    static NAN_GETTER(GetNaturalWidth);
    static NAN_GETTER(GetNaturalHeight);
    static NAN_GETTER(GetDataMode);
    static NAN_SETTER(SetDataMode);
    static NAN_SETTER(SetWidth);
    static NAN_SETTER(SetHeight);
    static NAN_METHOD(GetSource);
    static NAN_METHOD(SetSource);
    inline uint8_t *data(){ return cairo_image_surface_get_data(_surface); }
    inline int stride(){ return cairo_image_surface_get_stride(_surface); }
    static int isPNG(uint8_t *data);
    static int isJPEG(uint8_t *data);
    static int isGIF(uint8_t *data);
    static int isSVG(uint8_t *data, unsigned len);
    static int isBMP(uint8_t *data, unsigned len);
    static cairo_status_t readPNG(void *closure, unsigned char *data, unsigned len);
    inline int isComplete(){ return COMPLETE == state; }
    cairo_surface_t *surface();
    cairo_status_t loadSurface();
    cairo_status_t loadFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadPNGFromBuffer(uint8_t *buf);
    cairo_status_t loadPNG();
    void clearData();
#ifdef HAVE_RSVG
    cairo_status_t loadSVGFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadSVG(FILE *stream);
    cairo_status_t renderSVGToSurface();
#endif
#ifdef HAVE_GIF
    cairo_status_t loadGIFFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadGIF(FILE *stream);
#endif
#ifdef HAVE_JPEG
    cairo_status_t loadJPEGFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadJPEG(FILE *stream);
    void jpegToARGB(jpeg_decompress_struct* args, uint8_t* data, uint8_t* src, JPEGDecodeL decode);
    cairo_status_t decodeJPEGIntoSurface(jpeg_decompress_struct *info);
    cairo_status_t decodeJPEGBufferIntoMimeSurface(uint8_t *buf, unsigned len);
    cairo_status_t assignDataAsMime(uint8_t *data, int len, const char *mime_type);
#endif
    cairo_status_t loadBMPFromBuffer(uint8_t *buf, unsigned len);
    cairo_status_t loadBMP(FILE *stream);
    CanvasError errorInfo;
    void loaded();
    cairo_status_t load();
    Image();

    enum {
        DEFAULT
      , LOADING
      , COMPLETE
    } state;

    enum data_mode_t {
        DATA_IMAGE = 1
      , DATA_MIME = 2
    } data_mode;

    typedef enum {
        UNKNOWN
      , GIF
      , JPEG
      , PNG
      , SVG
    } type;

    static type extension(const char *filename);

  private:
    cairo_surface_t *_surface;
    uint8_t *_data = nullptr;
    int _data_len;
#ifdef HAVE_RSVG
    RsvgHandle *_rsvg;
    bool _is_svg;
    int _svg_last_width;
    int _svg_last_height;
#endif
    ~Image();
};
