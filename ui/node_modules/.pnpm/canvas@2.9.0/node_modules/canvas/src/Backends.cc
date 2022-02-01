#include "Backends.h"

#include "backend/ImageBackend.h"
#include "backend/PdfBackend.h"
#include "backend/SvgBackend.h"

using namespace v8;

void Backends::Initialize(Local<Object> target) {
  Nan::HandleScope scope;

  Local<Object> obj = Nan::New<Object>();
  ImageBackend::Initialize(obj);
  PdfBackend::Initialize(obj);
  SvgBackend::Initialize(obj);

  Nan::Set(target, Nan::New<String>("Backends").ToLocalChecked(), obj).Check();
}
