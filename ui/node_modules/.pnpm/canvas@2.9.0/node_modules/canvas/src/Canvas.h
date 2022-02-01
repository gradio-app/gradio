// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

#include "backend/Backend.h"
#include <cairo.h>
#include "dll_visibility.h"
#include <nan.h>
#include <pango/pangocairo.h>
#include <v8.h>
#include <vector>
#include <cstddef>

/*
 * Maxmimum states per context.
 * TODO: remove/resize
 */

#ifndef CANVAS_MAX_STATES
#define CANVAS_MAX_STATES 64
#endif

/*
 * FontFace describes a font file in terms of one PangoFontDescription that
 * will resolve to it and one that the user describes it as (like @font-face)
 */
class FontFace {
  public:
    PangoFontDescription *sys_desc = nullptr;
    PangoFontDescription *user_desc = nullptr;
    unsigned char file_path[1024];
};

/*
 * Canvas.
 */

class Canvas: public Nan::ObjectWrap {
  public:
    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    static NAN_METHOD(ToBuffer);
    static NAN_GETTER(GetType);
    static NAN_GETTER(GetStride);
    static NAN_GETTER(GetWidth);
    static NAN_GETTER(GetHeight);
    static NAN_SETTER(SetWidth);
    static NAN_SETTER(SetHeight);
    static NAN_METHOD(StreamPNGSync);
    static NAN_METHOD(StreamPDFSync);
    static NAN_METHOD(StreamJPEGSync);
    static NAN_METHOD(RegisterFont);
    static NAN_METHOD(DeregisterAllFonts);
    static v8::Local<v8::Value> Error(cairo_status_t status);
    static void ToPngBufferAsync(uv_work_t *req);
    static void ToJpegBufferAsync(uv_work_t *req);
    static void ToBufferAsyncAfter(uv_work_t *req);
    static PangoWeight GetWeightFromCSSString(const char *weight);
    static PangoStyle GetStyleFromCSSString(const char *style);
    static PangoFontDescription *ResolveFontDescription(const PangoFontDescription *desc);

    DLL_PUBLIC inline Backend* backend() { return _backend; }
    DLL_PUBLIC inline cairo_surface_t* surface(){ return backend()->getSurface(); }
    cairo_t* createCairoContext();

    DLL_PUBLIC inline uint8_t *data(){ return cairo_image_surface_get_data(surface()); }
    DLL_PUBLIC inline int stride(){ return cairo_image_surface_get_stride(surface()); }
    DLL_PUBLIC inline std::size_t nBytes(){
      return static_cast<std::size_t>(getHeight()) * stride();
    }

    DLL_PUBLIC inline int getWidth() { return backend()->getWidth(); }
    DLL_PUBLIC inline int getHeight() { return backend()->getHeight(); }

    Canvas(Backend* backend);
    void resurface(v8::Local<v8::Object> canvas);

  private:
    ~Canvas();
    Backend* _backend;
};
