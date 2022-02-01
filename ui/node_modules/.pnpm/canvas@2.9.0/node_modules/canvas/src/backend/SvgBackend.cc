#include "SvgBackend.h"

#include <cairo-svg.h>
#include "../Canvas.h"
#include "../closure.h"
#include <cassert>

using namespace v8;

SvgBackend::SvgBackend(int width, int height)
  : Backend("svg", width, height) {
  createSurface();
}

SvgBackend::~SvgBackend() {
  cairo_surface_finish(surface);
  if (_closure) {
    delete _closure;
    _closure = nullptr;
  }
  destroySurface();
}

Backend *SvgBackend::construct(int width, int height){
  return new SvgBackend(width, height);
}

cairo_surface_t* SvgBackend::createSurface() {
  assert(!_closure);
  _closure = new PdfSvgClosure(canvas);
  surface = cairo_svg_surface_create_for_stream(PdfSvgClosure::writeVec, _closure, width, height);
  return surface;
}

cairo_surface_t* SvgBackend::recreateSurface() {
  cairo_surface_finish(surface);
  delete _closure;
  _closure = nullptr;
  cairo_surface_destroy(surface);

  return createSurface();
 }


Nan::Persistent<FunctionTemplate> SvgBackend::constructor;

void SvgBackend::Initialize(Local<Object> target) {
  Nan::HandleScope scope;

  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(SvgBackend::New);
  SvgBackend::constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New<String>("SvgBackend").ToLocalChecked());
  Nan::Set(target,
           Nan::New<String>("SvgBackend").ToLocalChecked(),
           Nan::GetFunction(ctor).ToLocalChecked()).Check();
}

NAN_METHOD(SvgBackend::New) {
  init(info);
}
