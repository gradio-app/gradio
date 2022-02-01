#pragma once

#include "backend/Backend.h"
#include <nan.h>
#include <v8.h>

class Backends : public Nan::ObjectWrap {
  public:
    static void Initialize(v8::Local<v8::Object> target);
};
