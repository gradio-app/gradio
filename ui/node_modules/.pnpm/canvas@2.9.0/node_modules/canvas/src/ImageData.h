// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

#include <nan.h>
#include <stdint.h> // node < 7 uses libstdc++ on macOS which lacks complete c++11
#include <v8.h>

class ImageData: public Nan::ObjectWrap {
  public:
    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    static NAN_GETTER(GetWidth);
    static NAN_GETTER(GetHeight);

    inline int width() { return _width; }
    inline int height() { return _height; }
    inline uint8_t *data() { return _data; }
    ImageData(uint8_t *data, int width, int height) : _width(width), _height(height), _data(data) {}

  private:
    int _width;
    int _height;
    uint8_t *_data;

};
