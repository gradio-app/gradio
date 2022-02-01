// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include "Canvas.h"

#include <algorithm> // std::min
#include <assert.h>
#include <cairo-pdf.h>
#include <cairo-svg.h>
#include "CanvasRenderingContext2d.h"
#include "closure.h"
#include <cstring>
#include <cctype>
#include <ctime>
#include <glib.h>
#include "PNG.h"
#include "register_font.h"
#include <sstream>
#include <stdlib.h>
#include <string>
#include <unordered_set>
#include "Util.h"
#include <vector>
#include "node_buffer.h"

#ifdef HAVE_JPEG
#include "JPEGStream.h"
#endif

#include "backend/ImageBackend.h"
#include "backend/PdfBackend.h"
#include "backend/SvgBackend.h"

#define GENERIC_FACE_ERROR \
  "The second argument to registerFont is required, and should be an object " \
  "with at least a family (string) and optionally weight (string/number) " \
  "and style (string)."

using namespace v8;
using namespace std;

Nan::Persistent<FunctionTemplate> Canvas::constructor;

std::vector<FontFace> font_face_list;

/*
 * Initialize Canvas.
 */

void
Canvas::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Canvas::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("Canvas").ToLocalChecked());

  // Prototype
  Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
  Nan::SetPrototypeMethod(ctor, "toBuffer", ToBuffer);
  Nan::SetPrototypeMethod(ctor, "streamPNGSync", StreamPNGSync);
  Nan::SetPrototypeMethod(ctor, "streamPDFSync", StreamPDFSync);
#ifdef HAVE_JPEG
  Nan::SetPrototypeMethod(ctor, "streamJPEGSync", StreamJPEGSync);
#endif
  SetProtoAccessor(proto, Nan::New("type").ToLocalChecked(), GetType, NULL, ctor);
  SetProtoAccessor(proto, Nan::New("stride").ToLocalChecked(), GetStride, NULL, ctor);
  SetProtoAccessor(proto, Nan::New("width").ToLocalChecked(), GetWidth, SetWidth, ctor);
  SetProtoAccessor(proto, Nan::New("height").ToLocalChecked(), GetHeight, SetHeight, ctor);

  Nan::SetTemplate(proto, "PNG_NO_FILTERS", Nan::New<Uint32>(PNG_NO_FILTERS));
  Nan::SetTemplate(proto, "PNG_FILTER_NONE", Nan::New<Uint32>(PNG_FILTER_NONE));
  Nan::SetTemplate(proto, "PNG_FILTER_SUB", Nan::New<Uint32>(PNG_FILTER_SUB));
  Nan::SetTemplate(proto, "PNG_FILTER_UP", Nan::New<Uint32>(PNG_FILTER_UP));
  Nan::SetTemplate(proto, "PNG_FILTER_AVG", Nan::New<Uint32>(PNG_FILTER_AVG));
  Nan::SetTemplate(proto, "PNG_FILTER_PAETH", Nan::New<Uint32>(PNG_FILTER_PAETH));
  Nan::SetTemplate(proto, "PNG_ALL_FILTERS", Nan::New<Uint32>(PNG_ALL_FILTERS));

  // Class methods
  Nan::SetMethod(ctor, "_registerFont", RegisterFont);
  Nan::SetMethod(ctor, "_deregisterAllFonts", DeregisterAllFonts);

  Local<Context> ctx = Nan::GetCurrentContext();
  Nan::Set(target,
           Nan::New("Canvas").ToLocalChecked(),
           ctor->GetFunction(ctx).ToLocalChecked());
}

/*
 * Initialize a Canvas with the given width and height.
 */

NAN_METHOD(Canvas::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  Backend* backend = NULL;
  if (info[0]->IsNumber()) {
    int width = Nan::To<uint32_t>(info[0]).FromMaybe(0), height = 0;

    if (info[1]->IsNumber()) height = Nan::To<uint32_t>(info[1]).FromMaybe(0);

    if (info[2]->IsString()) {
      if (0 == strcmp("pdf", *Nan::Utf8String(info[2])))
        backend = new PdfBackend(width, height);
      else if (0 == strcmp("svg", *Nan::Utf8String(info[2])))
        backend = new SvgBackend(width, height);
      else
        backend = new ImageBackend(width, height);
    }
    else
      backend = new ImageBackend(width, height);
  }
  else if (info[0]->IsObject()) {
    if (Nan::New(ImageBackend::constructor)->HasInstance(info[0]) ||
        Nan::New(PdfBackend::constructor)->HasInstance(info[0]) ||
        Nan::New(SvgBackend::constructor)->HasInstance(info[0])) {
      backend = Nan::ObjectWrap::Unwrap<Backend>(Nan::To<Object>(info[0]).ToLocalChecked());
    }else{
      return Nan::ThrowTypeError("Invalid arguments");
    }
  }
  else {
    backend = new ImageBackend(0, 0);
  }

  if (!backend->isSurfaceValid()) {
    delete backend;
    return Nan::ThrowError(backend->getError());
  }

  Canvas* canvas = new Canvas(backend);
  canvas->Wrap(info.This());

  backend->setCanvas(canvas);

  info.GetReturnValue().Set(info.This());
}

/*
 * Get type string.
 */

NAN_GETTER(Canvas::GetType) {
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Nan::New<String>(canvas->backend()->getName()).ToLocalChecked());
}

/*
 * Get stride.
 */
NAN_GETTER(Canvas::GetStride) {
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(canvas->stride()));
}

/*
 * Get width.
 */

NAN_GETTER(Canvas::GetWidth) {
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(canvas->getWidth()));
}

/*
 * Set width.
 */

NAN_SETTER(Canvas::SetWidth) {
  if (value->IsNumber()) {
    Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->backend()->setWidth(Nan::To<uint32_t>(value).FromMaybe(0));
    canvas->resurface(info.This());
  }
}

/*
 * Get height.
 */

NAN_GETTER(Canvas::GetHeight) {
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(canvas->getHeight()));
}

/*
 * Set height.
 */

NAN_SETTER(Canvas::SetHeight) {
  if (value->IsNumber()) {
    Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
    canvas->backend()->setHeight(Nan::To<uint32_t>(value).FromMaybe(0));
    canvas->resurface(info.This());
  }
}

/*
 * EIO toBuffer callback.
 */

void
Canvas::ToPngBufferAsync(uv_work_t *req) {
  PngClosure* closure = static_cast<PngClosure*>(req->data);

  closure->status = canvas_write_to_png_stream(
    closure->canvas->surface(),
    PngClosure::writeVec,
    closure);
}

#ifdef HAVE_JPEG
void
Canvas::ToJpegBufferAsync(uv_work_t *req) {
  JpegClosure* closure = static_cast<JpegClosure*>(req->data);
  write_to_jpeg_buffer(closure->canvas->surface(), closure);
}
#endif

/*
 * EIO after toBuffer callback.
 */

void
Canvas::ToBufferAsyncAfter(uv_work_t *req) {
  Nan::HandleScope scope;
  Nan::AsyncResource async("canvas:ToBufferAsyncAfter");
  Closure* closure = static_cast<Closure*>(req->data);
  delete req;

  if (closure->status) {
    Local<Value> argv[1] = { Canvas::Error(closure->status) };
    closure->cb.Call(1, argv, &async);
  } else {
    Local<Object> buf = Nan::CopyBuffer((char*)&closure->vec[0], closure->vec.size()).ToLocalChecked();
    Local<Value> argv[2] = { Nan::Null(), buf };
    closure->cb.Call(sizeof argv / sizeof *argv, argv, &async);
  }

  closure->canvas->Unref();
  delete closure;
}

static void parsePNGArgs(Local<Value> arg, PngClosure& pngargs) {
  if (arg->IsObject()) {
    Local<Object> obj = Nan::To<Object>(arg).ToLocalChecked();

    Local<Value> cLevel = Nan::Get(obj, Nan::New("compressionLevel").ToLocalChecked()).ToLocalChecked();
    if (cLevel->IsUint32()) {
      uint32_t val = Nan::To<uint32_t>(cLevel).FromMaybe(0);
      // See quote below from spec section 4.12.5.5.
      if (val <= 9) pngargs.compressionLevel = val;
    }

    Local<Value> rez = Nan::Get(obj, Nan::New("resolution").ToLocalChecked()).ToLocalChecked();
    if (rez->IsUint32()) {
      uint32_t val = Nan::To<uint32_t>(rez).FromMaybe(0);
      if (val > 0) pngargs.resolution = val;
    }

    Local<Value> filters = Nan::Get(obj, Nan::New("filters").ToLocalChecked()).ToLocalChecked();
    if (filters->IsUint32()) pngargs.filters = Nan::To<uint32_t>(filters).FromMaybe(0);

    Local<Value> palette = Nan::Get(obj, Nan::New("palette").ToLocalChecked()).ToLocalChecked();
    if (palette->IsUint8ClampedArray()) {
      Local<Uint8ClampedArray> palette_ta = palette.As<Uint8ClampedArray>();
      pngargs.nPaletteColors = palette_ta->Length();
      if (pngargs.nPaletteColors % 4 != 0) {
        throw "Palette length must be a multiple of 4.";
      }
      pngargs.nPaletteColors /= 4;
      Nan::TypedArrayContents<uint8_t> _paletteColors(palette_ta);
      pngargs.palette = *_paletteColors;
      // Optional background color index:
      Local<Value> backgroundIndexVal = Nan::Get(obj, Nan::New("backgroundIndex").ToLocalChecked()).ToLocalChecked();
      if (backgroundIndexVal->IsUint32()) {
        pngargs.backgroundIndex = static_cast<uint8_t>(Nan::To<uint32_t>(backgroundIndexVal).FromMaybe(0));
      }
    }
  }
}

#ifdef HAVE_JPEG
static void parseJPEGArgs(Local<Value> arg, JpegClosure& jpegargs) {
  // "If Type(quality) is not Number, or if quality is outside that range, the
  // user agent must use its default quality value, as if the quality argument
  // had not been given." - 4.12.5.5
  if (arg->IsObject()) {
    Local<Object> obj = Nan::To<Object>(arg).ToLocalChecked();

    Local<Value> qual = Nan::Get(obj, Nan::New("quality").ToLocalChecked()).ToLocalChecked();
    if (qual->IsNumber()) {
      double quality = Nan::To<double>(qual).FromMaybe(0);
      if (quality >= 0.0 && quality <= 1.0) {
        jpegargs.quality = static_cast<uint32_t>(100.0 * quality);
      }
    }

    Local<Value> chroma = Nan::Get(obj, Nan::New("chromaSubsampling").ToLocalChecked()).ToLocalChecked();
    if (chroma->IsBoolean()) {
      bool subsample = Nan::To<bool>(chroma).FromMaybe(0);
      jpegargs.chromaSubsampling = subsample ? 2 : 1;
    } else if (chroma->IsNumber()) {
      jpegargs.chromaSubsampling = Nan::To<uint32_t>(chroma).FromMaybe(0);
    }

    Local<Value> progressive = Nan::Get(obj, Nan::New("progressive").ToLocalChecked()).ToLocalChecked();
    if (!progressive->IsUndefined()) {
      jpegargs.progressive = Nan::To<bool>(progressive).FromMaybe(0);
    }
  }
}
#endif

#if CAIRO_VERSION >= CAIRO_VERSION_ENCODE(1, 16, 0)

static inline void setPdfMetaStr(cairo_surface_t* surf, Local<Object> opts,
  cairo_pdf_metadata_t t, const char* pName) {
  auto propName = Nan::New(pName).ToLocalChecked();
  auto propValue = Nan::Get(opts, propName).ToLocalChecked();
  if (propValue->IsString()) {
    // (copies char data)
    cairo_pdf_surface_set_metadata(surf, t, *Nan::Utf8String(propValue));
  }
}

static inline void setPdfMetaDate(cairo_surface_t* surf, Local<Object> opts,
  cairo_pdf_metadata_t t, const char* pName) {
  auto propName = Nan::New(pName).ToLocalChecked();
  auto propValue = Nan::Get(opts, propName).ToLocalChecked();
  if (propValue->IsDate()) {
    auto date = static_cast<time_t>(propValue.As<v8::Date>()->ValueOf() / 1000); // ms -> s
    char buf[sizeof "2011-10-08T07:07:09Z"];
    strftime(buf, sizeof buf, "%FT%TZ", gmtime(&date));
    cairo_pdf_surface_set_metadata(surf, t, buf);
  }
}

static void setPdfMetadata(Canvas* canvas, Local<Object> opts) {
  cairo_surface_t* surf = canvas->surface();

  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_TITLE, "title");
  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_AUTHOR, "author");
  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_SUBJECT, "subject");
  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_KEYWORDS, "keywords");
  setPdfMetaStr(surf, opts, CAIRO_PDF_METADATA_CREATOR, "creator");
  setPdfMetaDate(surf, opts, CAIRO_PDF_METADATA_CREATE_DATE, "creationDate");
  setPdfMetaDate(surf, opts, CAIRO_PDF_METADATA_MOD_DATE, "modDate");
}

#endif // CAIRO 16+

/*
 * Converts/encodes data to a Buffer. Async when a callback function is passed.

 * PDF canvases:
    (any) => Buffer
    ("application/pdf", config) => Buffer

 * SVG canvases:
    (any) => Buffer

 * ARGB data:
    ("raw") => Buffer

 * PNG-encoded
    () => Buffer
    (undefined|"image/png", {compressionLevel?: number, filter?: number}) => Buffer
    ((err: null|Error, buffer) => any)
    ((err: null|Error, buffer) => any, undefined|"image/png", {compressionLevel?: number, filter?: number})

 * JPEG-encoded
    ("image/jpeg") => Buffer
    ("image/jpeg", {quality?: number, progressive?: Boolean, chromaSubsampling?: Boolean|number}) => Buffer
    ((err: null|Error, buffer) => any, "image/jpeg")
    ((err: null|Error, buffer) => any, "image/jpeg", {quality?: number, progressive?: Boolean, chromaSubsampling?: Boolean|number})
 */

NAN_METHOD(Canvas::ToBuffer) {
  cairo_status_t status;
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());

  // Vector canvases, sync only
  const std::string name = canvas->backend()->getName();
  if (name == "pdf" || name == "svg") {
    // mime type may be present, but it's not checked
    PdfSvgClosure* closure;
    if (name == "pdf") {
      closure = static_cast<PdfBackend*>(canvas->backend())->closure();
#if CAIRO_VERSION >= CAIRO_VERSION_ENCODE(1, 16, 0)
      if (info[1]->IsObject()) { // toBuffer("application/pdf", config)
        setPdfMetadata(canvas, Nan::To<Object>(info[1]).ToLocalChecked());
      }
#endif // CAIRO 16+
    } else {
      closure = static_cast<SvgBackend*>(canvas->backend())->closure();
    }

    cairo_surface_finish(canvas->surface());
    Local<Object> buf = Nan::CopyBuffer((char*)&closure->vec[0], closure->vec.size()).ToLocalChecked();
    info.GetReturnValue().Set(buf);
    return;
  }

  // Raw ARGB data -- just a memcpy()
  if (info[0]->StrictEquals(Nan::New<String>("raw").ToLocalChecked())) {
    cairo_surface_t *surface = canvas->surface();
    cairo_surface_flush(surface);
    if (canvas->nBytes() > node::Buffer::kMaxLength) {
      Nan::ThrowError("Data exceeds maximum buffer length.");
      return;
    }
    const unsigned char *data = cairo_image_surface_get_data(surface);
    Isolate* iso = Nan::GetCurrentContext()->GetIsolate();
    Local<Object> buf = node::Buffer::Copy(iso, reinterpret_cast<const char*>(data), canvas->nBytes()).ToLocalChecked();
    info.GetReturnValue().Set(buf);
    return;
  }

  // Sync PNG, default
  if (info[0]->IsUndefined() || info[0]->StrictEquals(Nan::New<String>("image/png").ToLocalChecked())) {
    try {
      PngClosure closure(canvas);
      parsePNGArgs(info[1], closure);
      if (closure.nPaletteColors == 0xFFFFFFFF) {
        Nan::ThrowError("Palette length must be a multiple of 4.");
        return;
      }

      Nan::TryCatch try_catch;
      status = canvas_write_to_png_stream(canvas->surface(), PngClosure::writeVec, &closure);

      if (try_catch.HasCaught()) {
        try_catch.ReThrow();
      } else if (status) {
        throw status;
      } else {
        // TODO it's possible to avoid this copy
        Local<Object> buf = Nan::CopyBuffer((char *)&closure.vec[0], closure.vec.size()).ToLocalChecked();
        info.GetReturnValue().Set(buf);
      }
    } catch (cairo_status_t ex) {
      Nan::ThrowError(Canvas::Error(ex));
    } catch (const char* ex) {
      Nan::ThrowError(ex);
    }
    return;
  }

  // Async PNG
  if (info[0]->IsFunction() &&
    (info[1]->IsUndefined() || info[1]->StrictEquals(Nan::New<String>("image/png").ToLocalChecked()))) {

    PngClosure* closure;
    try {
      closure = new PngClosure(canvas);
      parsePNGArgs(info[2], *closure);
    } catch (cairo_status_t ex) {
      Nan::ThrowError(Canvas::Error(ex));
      return;
    } catch (const char* ex) {
      Nan::ThrowError(ex);
      return;
    }

    canvas->Ref();
    closure->cb.Reset(info[0].As<Function>());

    uv_work_t* req = new uv_work_t;
    req->data = closure;
    // Make sure the surface exists since we won't have an isolate context in the async block:
    canvas->surface();
    uv_queue_work(uv_default_loop(), req, ToPngBufferAsync, (uv_after_work_cb)ToBufferAsyncAfter);

    return;
  }

#ifdef HAVE_JPEG
  // Sync JPEG
  Local<Value> jpegStr = Nan::New<String>("image/jpeg").ToLocalChecked();
  if (info[0]->StrictEquals(jpegStr)) {
    try {
      JpegClosure closure(canvas);
      parseJPEGArgs(info[1], closure);

      Nan::TryCatch try_catch;
      write_to_jpeg_buffer(canvas->surface(), &closure);

      if (try_catch.HasCaught()) {
        try_catch.ReThrow();
      } else {
        // TODO it's possible to avoid this copy.
        Local<Object> buf = Nan::CopyBuffer((char *)&closure.vec[0], closure.vec.size()).ToLocalChecked();
        info.GetReturnValue().Set(buf);
      }
    } catch (cairo_status_t ex) {
      Nan::ThrowError(Canvas::Error(ex));
    }
    return;
  }

  // Async JPEG
  if (info[0]->IsFunction() && info[1]->StrictEquals(jpegStr)) {
    JpegClosure* closure = new JpegClosure(canvas);
    parseJPEGArgs(info[2], *closure);

    canvas->Ref();
    closure->cb.Reset(info[0].As<Function>());

    uv_work_t* req = new uv_work_t;
    req->data = closure;
    // Make sure the surface exists since we won't have an isolate context in the async block:
    canvas->surface();
    uv_queue_work(uv_default_loop(), req, ToJpegBufferAsync, (uv_after_work_cb)ToBufferAsyncAfter);

    return;
  }
#endif
}

/*
 * Canvas::StreamPNG callback.
 */

static cairo_status_t
streamPNG(void *c, const uint8_t *data, unsigned len) {
  Nan::HandleScope scope;
  Nan::AsyncResource async("canvas:StreamPNG");
  PngClosure* closure = (PngClosure*) c;
  Local<Object> buf = Nan::CopyBuffer((char *)data, len).ToLocalChecked();
  Local<Value> argv[3] = {
      Nan::Null()
    , buf
    , Nan::New<Number>(len) };
  closure->cb.Call(sizeof argv / sizeof *argv, argv, &async);
  return CAIRO_STATUS_SUCCESS;
}

/*
 * Stream PNG data synchronously. TODO async
 * StreamPngSync(this, options: {palette?: Uint8ClampedArray, backgroundIndex?: uint32, compressionLevel: uint32, filters: uint32})
 */

NAN_METHOD(Canvas::StreamPNGSync) {
  if (!info[0]->IsFunction())
    return Nan::ThrowTypeError("callback function required");

  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());

  PngClosure closure(canvas);
  parsePNGArgs(info[1], closure);

  closure.cb.Reset(Local<Function>::Cast(info[0]));

  Nan::TryCatch try_catch;

  cairo_status_t status = canvas_write_to_png_stream(canvas->surface(), streamPNG, &closure);

  if (try_catch.HasCaught()) {
    try_catch.ReThrow();
    return;
  } else if (status) {
    Local<Value> argv[1] = { Canvas::Error(status) };
    Nan::Call(closure.cb, Nan::GetCurrentContext()->Global(), sizeof argv / sizeof *argv, argv);
  } else {
    Local<Value> argv[3] = {
        Nan::Null()
      , Nan::Null()
      , Nan::New<Uint32>(0) };
    Nan::Call(closure.cb, Nan::GetCurrentContext()->Global(), sizeof argv / sizeof *argv, argv);
  }
  return;
}


struct PdfStreamInfo {
  Local<Function> fn;
  uint32_t len;
  uint8_t* data;
};


/*
 * Canvas::StreamPDF FreeCallback
 */

void stream_pdf_free(char *, void *) {}

/*
 * Canvas::StreamPDF callback.
 */

static cairo_status_t
streamPDF(void *c, const uint8_t *data, unsigned len) {
  Nan::HandleScope scope;
  Nan::AsyncResource async("canvas:StreamPDF");
  PdfStreamInfo* streaminfo = static_cast<PdfStreamInfo*>(c);
  // TODO this is technically wrong, we're returning a pointer to the data in a
  // vector in a class with automatic storage duration. If the canvas goes out
  // of scope while we're in the handler, a use-after-free could happen.
  Local<Object> buf = Nan::NewBuffer(const_cast<char *>(reinterpret_cast<const char *>(data)), len, stream_pdf_free, 0).ToLocalChecked();
  Local<Value> argv[3] = {
      Nan::Null()
    , buf
    , Nan::New<Number>(len) };
  async.runInAsyncScope(Nan::GetCurrentContext()->Global(), streaminfo->fn, sizeof argv / sizeof *argv, argv);
  return CAIRO_STATUS_SUCCESS;
}


cairo_status_t canvas_write_to_pdf_stream(cairo_surface_t *surface, cairo_write_func_t write_func, PdfStreamInfo* streaminfo) {
  size_t whole_chunks = streaminfo->len / PAGE_SIZE;
  size_t remainder = streaminfo->len - whole_chunks * PAGE_SIZE;

  for (size_t i = 0; i < whole_chunks; ++i) {
    write_func(streaminfo, &streaminfo->data[i * PAGE_SIZE], PAGE_SIZE);
  }

  if (remainder) {
    write_func(streaminfo, &streaminfo->data[whole_chunks * PAGE_SIZE], remainder);
  }

  return CAIRO_STATUS_SUCCESS;
}

/*
 * Stream PDF data synchronously.
 */

NAN_METHOD(Canvas::StreamPDFSync) {
  if (!info[0]->IsFunction())
    return Nan::ThrowTypeError("callback function required");

  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.Holder());

  if (canvas->backend()->getName() != "pdf")
    return Nan::ThrowTypeError("wrong canvas type");

#if CAIRO_VERSION >= CAIRO_VERSION_ENCODE(1, 16, 0)
  if (info[1]->IsObject()) {
    setPdfMetadata(canvas, Nan::To<Object>(info[1]).ToLocalChecked());
  }
#endif

  cairo_surface_finish(canvas->surface());

  PdfSvgClosure* closure = static_cast<PdfBackend*>(canvas->backend())->closure();
  Local<Function> fn = info[0].As<Function>();
  PdfStreamInfo streaminfo;
  streaminfo.fn = fn;
  streaminfo.data = &closure->vec[0];
  streaminfo.len = closure->vec.size();

  Nan::TryCatch try_catch;

  cairo_status_t status = canvas_write_to_pdf_stream(canvas->surface(), streamPDF, &streaminfo);

  if (try_catch.HasCaught()) {
    try_catch.ReThrow();
  } else if (status) {
    Local<Value> error = Canvas::Error(status);
    Nan::Call(fn, Nan::GetCurrentContext()->Global(), 1, &error);
  } else {
    Local<Value> argv[3] = {
        Nan::Null()
      , Nan::Null()
      , Nan::New<Uint32>(0) };
    Nan::Call(fn, Nan::GetCurrentContext()->Global(), sizeof argv / sizeof *argv, argv);
  }
}

/*
 * Stream JPEG data synchronously.
 */

#ifdef HAVE_JPEG
static uint32_t getSafeBufSize(Canvas* canvas) {
  // Don't allow the buffer size to exceed the size of the canvas (#674)
  // TODO not sure if this is really correct, but it fixed #674
  return (std::min)(canvas->getWidth() * canvas->getHeight() * 4, static_cast<int>(PAGE_SIZE));
}

NAN_METHOD(Canvas::StreamJPEGSync) {
  if (!info[1]->IsFunction())
    return Nan::ThrowTypeError("callback function required");

  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(info.This());
  JpegClosure closure(canvas);
  parseJPEGArgs(info[0], closure);
  closure.cb.Reset(Local<Function>::Cast(info[1]));

  Nan::TryCatch try_catch;
  uint32_t bufsize = getSafeBufSize(canvas);
  write_to_jpeg_stream(canvas->surface(), bufsize, &closure);

  if (try_catch.HasCaught()) {
    try_catch.ReThrow();
  }
  return;
}
#endif

char *
str_value(Local<Value> val, const char *fallback, bool can_be_number) {
  if (val->IsString() || (can_be_number && val->IsNumber())) {
    return g_strdup(*Nan::Utf8String(val));
  } else if (fallback) {
    return g_strdup(fallback);
  } else {
    return NULL;
  }
}

NAN_METHOD(Canvas::RegisterFont) {
  if (!info[0]->IsString()) {
    return Nan::ThrowError("Wrong argument type");
  } else if (!info[1]->IsObject()) {
    return Nan::ThrowError(GENERIC_FACE_ERROR);
  }

  Nan::Utf8String filePath(info[0]);
  PangoFontDescription *sys_desc = get_pango_font_description((unsigned char *) *filePath);

  if (!sys_desc) return Nan::ThrowError("Could not parse font file");

  PangoFontDescription *user_desc = pango_font_description_new();

  // now check the attrs, there are many ways to be wrong
  Local<Object> js_user_desc = Nan::To<Object>(info[1]).ToLocalChecked();
  Local<String> family_prop = Nan::New<String>("family").ToLocalChecked();
  Local<String> weight_prop = Nan::New<String>("weight").ToLocalChecked();
  Local<String> style_prop = Nan::New<String>("style").ToLocalChecked();

  char *family = str_value(Nan::Get(js_user_desc, family_prop).ToLocalChecked(), NULL, false);
  char *weight = str_value(Nan::Get(js_user_desc, weight_prop).ToLocalChecked(), "normal", true);
  char *style = str_value(Nan::Get(js_user_desc, style_prop).ToLocalChecked(), "normal", false);

  if (family && weight && style) {
    pango_font_description_set_weight(user_desc, Canvas::GetWeightFromCSSString(weight));
    pango_font_description_set_style(user_desc, Canvas::GetStyleFromCSSString(style));
    pango_font_description_set_family(user_desc, family);

    auto found = std::find_if(font_face_list.begin(), font_face_list.end(), [&](FontFace& f) {
      return pango_font_description_equal(f.sys_desc, sys_desc);
    });

    if (found != font_face_list.end()) {
      pango_font_description_free(found->user_desc);
      found->user_desc = user_desc;
    } else if (register_font((unsigned char *) *filePath)) {
      FontFace face;
      face.user_desc = user_desc;
      face.sys_desc = sys_desc;
      strncpy((char *)face.file_path, (char *) *filePath, 1023);
      font_face_list.push_back(face);
    } else {
      pango_font_description_free(user_desc);
      Nan::ThrowError("Could not load font to the system's font host");
    }
  } else {
    pango_font_description_free(user_desc);
    Nan::ThrowError(GENERIC_FACE_ERROR);
  }

  g_free(family);
  g_free(weight);
  g_free(style);
}

NAN_METHOD(Canvas::DeregisterAllFonts) {
  // Unload all fonts from pango to free up memory
  bool success = true;
  
  std::for_each(font_face_list.begin(), font_face_list.end(), [&](FontFace& f) {
    if (!deregister_font( (unsigned char *)f.file_path )) success = false;
    pango_font_description_free(f.user_desc);
    pango_font_description_free(f.sys_desc);
  });
  
  font_face_list.clear();
  if (!success) Nan::ThrowError("Could not deregister one or more fonts");
}

/*
 * Initialize cairo surface.
 */

Canvas::Canvas(Backend* backend) : ObjectWrap() {
  _backend = backend;
}

/*
 * Destroy cairo surface.
 */

Canvas::~Canvas() {
  if (_backend != NULL) {
		delete _backend;
	}
}

/*
 * Get a PangoStyle from a CSS string (like "italic")
 */

PangoStyle
Canvas::GetStyleFromCSSString(const char *style) {
  PangoStyle s = PANGO_STYLE_NORMAL;

  if (strlen(style) > 0) {
    if (0 == strcmp("italic", style)) {
      s = PANGO_STYLE_ITALIC;
    } else if (0 == strcmp("oblique", style)) {
      s = PANGO_STYLE_OBLIQUE;
    }
  }

  return s;
}

/*
 * Get a PangoWeight from a CSS string ("bold", "100", etc)
 */

PangoWeight
Canvas::GetWeightFromCSSString(const char *weight) {
  PangoWeight w = PANGO_WEIGHT_NORMAL;

  if (strlen(weight) > 0) {
    if (0 == strcmp("bold", weight)) {
      w = PANGO_WEIGHT_BOLD;
    } else if (0 == strcmp("100", weight)) {
      w = PANGO_WEIGHT_THIN;
    } else if (0 == strcmp("200", weight)) {
      w = PANGO_WEIGHT_ULTRALIGHT;
    } else if (0 == strcmp("300", weight)) {
      w = PANGO_WEIGHT_LIGHT;
    } else if (0 == strcmp("400", weight)) {
      w = PANGO_WEIGHT_NORMAL;
    } else if (0 == strcmp("500", weight)) {
      w = PANGO_WEIGHT_MEDIUM;
    } else if (0 == strcmp("600", weight)) {
      w = PANGO_WEIGHT_SEMIBOLD;
    } else if (0 == strcmp("700", weight)) {
      w = PANGO_WEIGHT_BOLD;
    } else if (0 == strcmp("800", weight)) {
      w = PANGO_WEIGHT_ULTRABOLD;
    } else if (0 == strcmp("900", weight)) {
      w = PANGO_WEIGHT_HEAVY;
    }
  }

  return w;
}

/*
 * Given a user description, return a description that will select the
 * font either from the system or @font-face
 */

PangoFontDescription *
Canvas::ResolveFontDescription(const PangoFontDescription *desc) {
  // One of the user-specified families could map to multiple SFNT family names
  // if someone registered two different fonts under the same family name.
  // https://drafts.csswg.org/css-fonts-3/#font-style-matching
  FontFace best;
  istringstream families(pango_font_description_get_family(desc));
  unordered_set<string> seen_families;
  string resolved_families;
  bool first = true;

  for (string family; getline(families, family, ','); ) {
    string renamed_families;
    for (auto& ff : font_face_list) {
      string pangofamily = string(pango_font_description_get_family(ff.user_desc));
      if (streq_casein(family, pangofamily)) {
        const char* sys_desc_family_name = pango_font_description_get_family(ff.sys_desc);
        bool unseen = seen_families.find(sys_desc_family_name) == seen_families.end();

        // Avoid sending duplicate SFNT font names due to a bug in Pango for macOS:
        // https://bugzilla.gnome.org/show_bug.cgi?id=762873
        if (unseen) {
          seen_families.insert(sys_desc_family_name);
          if (renamed_families.size()) renamed_families += ',';
          renamed_families += sys_desc_family_name;
        }

        if (first && (best.user_desc == nullptr || pango_font_description_better_match(desc, best.user_desc, ff.user_desc))) {
          best = ff;
        }
      }
    }

    if (resolved_families.size()) resolved_families += ',';
    resolved_families += renamed_families.size() ? renamed_families : family;
    first = false;
  }

  PangoFontDescription* ret = pango_font_description_copy(best.sys_desc ? best.sys_desc : desc);
  pango_font_description_set_family(ret, resolved_families.c_str());

  return ret;
}

/*
 * Re-alloc the surface, destroying the previous.
 */

void
Canvas::resurface(Local<Object> canvas) {
  Nan::HandleScope scope;
  Local<Value> context;

  backend()->recreateSurface();

  // Reset context
	context = Nan::Get(canvas, Nan::New<String>("context").ToLocalChecked()).ToLocalChecked();
	if (!context->IsUndefined()) {
		Context2d *context2d = ObjectWrap::Unwrap<Context2d>(Nan::To<Object>(context).ToLocalChecked());
		cairo_t *prev = context2d->context();
		context2d->setContext(createCairoContext());
		context2d->resetState();
		cairo_destroy(prev);
	}
}

/**
 * Wrapper around cairo_create()
 * (do not call cairo_create directly, call this instead)
 */
cairo_t*
Canvas::createCairoContext() {
  cairo_t* ret = cairo_create(surface());
  cairo_set_line_width(ret, 1); // Cairo defaults to 2
  return ret;
}

/*
 * Construct an Error from the given cairo status.
 */

Local<Value>
Canvas::Error(cairo_status_t status) {
  return Exception::Error(Nan::New<String>(cairo_status_to_string(status)).ToLocalChecked());
}
