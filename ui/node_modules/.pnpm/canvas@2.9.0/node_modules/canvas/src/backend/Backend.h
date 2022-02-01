#pragma once

#include <cairo.h>
#include "../dll_visibility.h"
#include <exception>
#include <nan.h>
#include <string>
#include <v8.h>

class Canvas;

class Backend : public Nan::ObjectWrap
{
  private:
    const std::string name;
    const char* error = NULL;

  protected:
    int width;
    int height;
    cairo_surface_t* surface = nullptr;
    Canvas* canvas = nullptr;

    Backend(std::string name, int width, int height);
    static void init(const Nan::FunctionCallbackInfo<v8::Value> &info);
    static Backend *construct(int width, int height){ return nullptr; }

  public:
    virtual ~Backend();

    void setCanvas(Canvas* canvas);

    virtual cairo_surface_t* createSurface() = 0;
    virtual cairo_surface_t* recreateSurface();

    DLL_PUBLIC cairo_surface_t* getSurface();
    virtual void destroySurface();

    DLL_PUBLIC std::string getName();

    DLL_PUBLIC int getWidth();
    virtual void setWidth(int width);

    DLL_PUBLIC int getHeight();
    virtual void setHeight(int height);

    // Overridden by ImageBackend. SVG and PDF thus always return INVALID.
    virtual cairo_format_t getFormat() {
      return CAIRO_FORMAT_INVALID;
    }

    bool isSurfaceValid();
    inline const char* getError(){ return error; }
};


class BackendOperationNotAvailable: public std::exception
{
  private:
    Backend* backend;
    std::string operation_name;
    std::string msg;

  public:
    BackendOperationNotAvailable(Backend* backend, std::string operation_name);
    ~BackendOperationNotAvailable() throw();

    const char* what() const throw();
};
