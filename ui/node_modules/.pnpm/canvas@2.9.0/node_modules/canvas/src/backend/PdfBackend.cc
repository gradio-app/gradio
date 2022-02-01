#include "PdfBackend.h"

#include <cairo-pdf.h>
#include "../Canvas.h"
#include "../closure.h"

using namespace v8;

PdfBackend::PdfBackend(int width, int height)
  : Backend("pdf", width, height) {
  createSurface();
}

PdfBackend::~PdfBackend() {
  cairo_surface_finish(surface);
  if (_closure) delete _closure;
  destroySurface();
}

Backend *PdfBackend::construct(int width, int height){
  return new PdfBackend(width, height);
}

cairo_surface_t* PdfBackend::createSurface() {
  if (!_closure) _closure = new PdfSvgClosure(canvas);
  surface = cairo_pdf_surface_create_for_stream(PdfSvgClosure::writeVec, _closure, width, height);
  return surface;
}

cairo_surface_t* PdfBackend::recreateSurface() {
  cairo_pdf_surface_set_size(surface, width, height);

  return surface;
}


Nan::Persistent<FunctionTemplate> PdfBackend::constructor;

void PdfBackend::Initialize(Local<Object> target) {
  Nan::HandleScope scope;

  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(PdfBackend::New);
  PdfBackend::constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New<String>("PdfBackend").ToLocalChecked());
  Nan::Set(target,
           Nan::New<String>("PdfBackend").ToLocalChecked(),
           Nan::GetFunction(ctor).ToLocalChecked()).Check();
}

NAN_METHOD(PdfBackend::New) {
  init(info);
}
