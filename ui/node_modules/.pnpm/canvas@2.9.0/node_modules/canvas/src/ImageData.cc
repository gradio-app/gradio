// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include "ImageData.h"

#include "Util.h"

using namespace v8;

Nan::Persistent<FunctionTemplate> ImageData::constructor;

/*
 * Initialize ImageData.
 */

void
ImageData::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(ImageData::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("ImageData").ToLocalChecked());

  // Prototype
  Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
  SetProtoAccessor(proto, Nan::New("width").ToLocalChecked(), GetWidth, NULL, ctor);
  SetProtoAccessor(proto, Nan::New("height").ToLocalChecked(), GetHeight, NULL, ctor);
  Local<Context> ctx = Nan::GetCurrentContext();
  Nan::Set(target, Nan::New("ImageData").ToLocalChecked(), ctor->GetFunction(ctx).ToLocalChecked());
}

/*
 * Initialize a new ImageData object.
 */

NAN_METHOD(ImageData::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  Local<TypedArray> dataArray;
  uint32_t width;
  uint32_t height;
  int length;

  if (info[0]->IsUint32() && info[1]->IsUint32()) {
    width = Nan::To<uint32_t>(info[0]).FromMaybe(0);
    if (width == 0) {
      Nan::ThrowRangeError("The source width is zero.");
      return;
    }
    height = Nan::To<uint32_t>(info[1]).FromMaybe(0);
    if (height == 0) {
      Nan::ThrowRangeError("The source height is zero.");
      return;
    }
    length = width * height * 4; // ImageData(w, h) constructor assumes 4 BPP; documented.

    dataArray = Uint8ClampedArray::New(ArrayBuffer::New(Isolate::GetCurrent(), length), 0, length);

  } else if (info[0]->IsUint8ClampedArray() && info[1]->IsUint32()) {
    dataArray = info[0].As<Uint8ClampedArray>();

    length = dataArray->Length();
    if (length == 0) {
      Nan::ThrowRangeError("The input data has a zero byte length.");
      return;
    }

    // Don't assert that the ImageData length is a multiple of four because some
    // data formats are not 4 BPP.

    width = Nan::To<uint32_t>(info[1]).FromMaybe(0);
    if (width == 0) {
      Nan::ThrowRangeError("The source width is zero.");
      return;
    }

    // Don't assert that the byte length is a multiple of 4 * width, ditto.

    if (info[2]->IsUint32()) { // Explicit height given
      height = Nan::To<uint32_t>(info[2]).FromMaybe(0);
    } else { // Calculate height assuming 4 BPP
      int size = length / 4;
      height = size / width;
    }

  } else if (info[0]->IsUint16Array() && info[1]->IsUint32()) { // Intended for RGB16_565 format
  dataArray = info[0].As<Uint16Array>();

  length = dataArray->Length();
  if (length == 0) {
    Nan::ThrowRangeError("The input data has a zero byte length.");
    return;
  }

  width = Nan::To<uint32_t>(info[1]).FromMaybe(0);
  if (width == 0) {
    Nan::ThrowRangeError("The source width is zero.");
    return;
  }

  if (info[2]->IsUint32()) { // Explicit height given
    height = Nan::To<uint32_t>(info[2]).FromMaybe(0);
  } else { // Calculate height assuming 2 BPP
    int size = length / 2;
    height = size / width;
  }

  } else {
    Nan::ThrowTypeError("Expected (Uint8ClampedArray, width[, height]), (Uint16Array, width[, height]) or (width, height)");
    return;
  }

  Nan::TypedArrayContents<uint8_t> dataPtr(dataArray);

  ImageData *imageData = new ImageData(reinterpret_cast<uint8_t*>(*dataPtr), width, height);
  imageData->Wrap(info.This());
  Nan::Set(info.This(), Nan::New("data").ToLocalChecked(), dataArray).Check();
  info.GetReturnValue().Set(info.This());
}

/*
 * Get width.
 */

NAN_GETTER(ImageData::GetWidth) {
  ImageData *imageData = Nan::ObjectWrap::Unwrap<ImageData>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(imageData->width()));
}

/*
 * Get height.
 */

NAN_GETTER(ImageData::GetHeight) {
  ImageData *imageData = Nan::ObjectWrap::Unwrap<ImageData>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(imageData->height()));
}
