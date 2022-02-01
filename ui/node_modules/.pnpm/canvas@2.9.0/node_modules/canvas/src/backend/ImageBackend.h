#pragma once

#include "Backend.h"
#include <v8.h>

class ImageBackend : public Backend
{
  private:
    cairo_surface_t* createSurface();
    void destroySurface();
    cairo_format_t format = DEFAULT_FORMAT;

  public:
    ImageBackend(int width, int height);
    static Backend *construct(int width, int height);

    cairo_format_t getFormat();
    void setFormat(cairo_format_t format);

    int32_t approxBytesPerPixel();

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> target);
    static NAN_METHOD(New);
    const static cairo_format_t DEFAULT_FORMAT = CAIRO_FORMAT_ARGB32;
};
