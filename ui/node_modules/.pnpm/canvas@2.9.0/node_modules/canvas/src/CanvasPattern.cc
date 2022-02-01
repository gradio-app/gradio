// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include "CanvasPattern.h"

#include "Canvas.h"
#include "Image.h"

using namespace v8;

const cairo_user_data_key_t *pattern_repeat_key;

Nan::Persistent<FunctionTemplate> Pattern::constructor;
Nan::Persistent<Function> Pattern::_DOMMatrix;

/*
 * Initialize CanvasPattern.
 */

void
Pattern::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Pattern::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("CanvasPattern").ToLocalChecked());
  Nan::SetPrototypeMethod(ctor, "setTransform", SetTransform);

  // Prototype
  Local<Context> ctx = Nan::GetCurrentContext();
  Nan::Set(target, Nan::New("CanvasPattern").ToLocalChecked(), ctor->GetFunction(ctx).ToLocalChecked());
  Nan::Set(target, Nan::New("CanvasPatternInit").ToLocalChecked(), Nan::New<Function>(SaveExternalModules));
}

/*
 * Save some external modules as private references.
 */

NAN_METHOD(Pattern::SaveExternalModules) {
  _DOMMatrix.Reset(Nan::To<Function>(info[0]).ToLocalChecked());
}

/*
 * Initialize a new CanvasPattern.
 */

NAN_METHOD(Pattern::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  cairo_surface_t *surface;

  Local<Object> obj = Nan::To<Object>(info[0]).ToLocalChecked();

  // Image
  if (Nan::New(Image::constructor)->HasInstance(obj)) {
    Image *img = Nan::ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
      return Nan::ThrowError("Image given has not completed loading");
    }
    surface = img->surface();

  // Canvas
  } else if (Nan::New(Canvas::constructor)->HasInstance(obj)) {
    Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(obj);
    surface = canvas->surface();
  // Invalid
  } else {
    return Nan::ThrowTypeError("Image or Canvas expected");
  }
  repeat_type_t repeat = REPEAT;
  if (0 == strcmp("no-repeat", *Nan::Utf8String(info[1]))) {
    repeat = NO_REPEAT;
  } else if (0 == strcmp("repeat-x", *Nan::Utf8String(info[1]))) {
    repeat = REPEAT_X;
  } else if (0 == strcmp("repeat-y", *Nan::Utf8String(info[1]))) {
    repeat = REPEAT_Y;
  }
  Pattern *pattern = new Pattern(surface, repeat);
  pattern->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

/*
 * Set the pattern-space to user-space transform.
 */
NAN_METHOD(Pattern::SetTransform) {
  Pattern *pattern = Nan::ObjectWrap::Unwrap<Pattern>(info.This());
  Local<Context> ctx = Nan::GetCurrentContext();
  Local<Object> mat = Nan::To<Object>(info[0]).ToLocalChecked();

#if NODE_MAJOR_VERSION >= 8
  if (!mat->InstanceOf(ctx, _DOMMatrix.Get(Isolate::GetCurrent())).ToChecked()) {
    return Nan::ThrowTypeError("Expected DOMMatrix");
  }
#endif

  cairo_matrix_t matrix;
  cairo_matrix_init(&matrix,
    Nan::To<double>(Nan::Get(mat, Nan::New("a").ToLocalChecked()).ToLocalChecked()).FromMaybe(1),
    Nan::To<double>(Nan::Get(mat, Nan::New("b").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("c").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("d").ToLocalChecked()).ToLocalChecked()).FromMaybe(1),
    Nan::To<double>(Nan::Get(mat, Nan::New("e").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("f").ToLocalChecked()).ToLocalChecked()).FromMaybe(0)
  );

  cairo_matrix_invert(&matrix);
  cairo_pattern_set_matrix(pattern->_pattern, &matrix);
}


/*
 * Initialize pattern.
 */

Pattern::Pattern(cairo_surface_t *surface, repeat_type_t repeat) {
  _pattern = cairo_pattern_create_for_surface(surface);
  _repeat = repeat;
  cairo_pattern_set_user_data(_pattern, pattern_repeat_key, &_repeat, NULL);
}

repeat_type_t Pattern::get_repeat_type_for_cairo_pattern(cairo_pattern_t *pattern) {
  void *ud = cairo_pattern_get_user_data(pattern, pattern_repeat_key);
  return *reinterpret_cast<repeat_type_t*>(ud);
}

/*
 * Destroy the pattern.
 */

Pattern::~Pattern() {
  cairo_pattern_destroy(_pattern);
}
