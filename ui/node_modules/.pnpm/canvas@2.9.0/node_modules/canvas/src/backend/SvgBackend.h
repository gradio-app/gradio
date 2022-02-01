#pragma once

#include "Backend.h"
#include "../closure.h"
#include <v8.h>

class SvgBackend : public Backend
{
  private:
    cairo_surface_t* createSurface();
    cairo_surface_t* recreateSurface();

  public:
    PdfSvgClosure* _closure = NULL;
    inline PdfSvgClosure* closure() { return _closure; }

    SvgBackend(int width, int height);
    ~SvgBackend();
    static Backend *construct(int width, int height);

    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(v8::Local<v8::Object> target);
    static NAN_METHOD(New);
};
