// Copyright (c) 2011 LearnBoost <tj@learnboost.com>

#pragma once

#include <cairo.h>
#include <nan.h>
#include <v8.h>

/*
 * Canvas types.
 */

typedef enum {
  NO_REPEAT,  // match CAIRO_EXTEND_NONE
  REPEAT,  // match CAIRO_EXTEND_REPEAT
  REPEAT_X, // needs custom processing
  REPEAT_Y // needs custom processing
} repeat_type_t;

extern const cairo_user_data_key_t *pattern_repeat_key;

class Pattern: public Nan::ObjectWrap {
  public:
    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static Nan::Persistent<v8::Function> _DOMMatrix;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    static NAN_METHOD(SaveExternalModules);
    static NAN_METHOD(SetTransform);
    static repeat_type_t get_repeat_type_for_cairo_pattern(cairo_pattern_t *pattern);
    Pattern(cairo_surface_t *surface, repeat_type_t repeat);
    inline cairo_pattern_t *pattern(){ return _pattern; }
  private:
    ~Pattern();
    cairo_pattern_t *_pattern;
    repeat_type_t _repeat;
};
