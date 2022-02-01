// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

#include <nan.h>
#include <v8.h>
#include <cairo.h>

class Gradient: public Nan::ObjectWrap {
  public:
    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    static NAN_METHOD(AddColorStop);
    Gradient(double x0, double y0, double x1, double y1);
    Gradient(double x0, double y0, double r0, double x1, double y1, double r1);
    inline cairo_pattern_t *pattern(){ return _pattern; }

  private:
    ~Gradient();
    cairo_pattern_t *_pattern;
};
