// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#include "CanvasRenderingContext2d.h"

#include <algorithm>
#include "backend/ImageBackend.h"
#include <cairo-pdf.h>
#include "Canvas.h"
#include "CanvasGradient.h"
#include "CanvasPattern.h"
#include <cmath>
#include <cstdlib>
#include "Image.h"
#include "ImageData.h"
#include <limits>
#include <map>
#include "Point.h"
#include <string>
#include "Util.h"
#include <vector>

using namespace v8;

Nan::Persistent<FunctionTemplate> Context2d::constructor;

/*
 * Rectangle arg assertions.
 */

#define RECT_ARGS \
  double args[4]; \
  if(!checkArgs(info, args, 4)) \
    return; \
  double x = args[0]; \
  double y = args[1]; \
  double width = args[2]; \
  double height = args[3];

/*
 * Text baselines.
 */

enum {
    TEXT_BASELINE_ALPHABETIC
  , TEXT_BASELINE_TOP
  , TEXT_BASELINE_BOTTOM
  , TEXT_BASELINE_MIDDLE
  , TEXT_BASELINE_IDEOGRAPHIC
  , TEXT_BASELINE_HANGING
};

/*
 * Simple helper macro for a rather verbose function call.
 */

#define PANGO_LAYOUT_GET_METRICS(LAYOUT) pango_context_get_metrics( \
   pango_layout_get_context(LAYOUT), \
   pango_layout_get_font_description(LAYOUT), \
   pango_context_get_language(pango_layout_get_context(LAYOUT)))

inline static bool checkArgs(const Nan::FunctionCallbackInfo<Value> &info, double *args, int argsNum, int offset = 0){
  int argsEnd = offset + argsNum;
  bool areArgsValid = true;

  for (int i = offset; i < argsEnd; i++) {
    double val = Nan::To<double>(info[i]).FromMaybe(0);

    if (areArgsValid) {
      if (!std::isfinite(val)) {
        // We should continue the loop instead of returning immediately
        // See https://html.spec.whatwg.org/multipage/canvas.html

        areArgsValid = false;
        continue;
      }

      args[i - offset] = val;
    }
  }

  return areArgsValid;
}

Nan::Persistent<Function> Context2d::_DOMMatrix;
Nan::Persistent<Function> Context2d::_parseFont;

/*
 * Initialize Context2d.
 */

void
Context2d::Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target) {
  Nan::HandleScope scope;

  // Constructor
  Local<FunctionTemplate> ctor = Nan::New<FunctionTemplate>(Context2d::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("CanvasRenderingContext2D").ToLocalChecked());

  // Prototype
  Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
  Nan::SetPrototypeMethod(ctor, "drawImage", DrawImage);
  Nan::SetPrototypeMethod(ctor, "putImageData", PutImageData);
  Nan::SetPrototypeMethod(ctor, "getImageData", GetImageData);
  Nan::SetPrototypeMethod(ctor, "createImageData", CreateImageData);
  Nan::SetPrototypeMethod(ctor, "addPage", AddPage);
  Nan::SetPrototypeMethod(ctor, "save", Save);
  Nan::SetPrototypeMethod(ctor, "restore", Restore);
  Nan::SetPrototypeMethod(ctor, "rotate", Rotate);
  Nan::SetPrototypeMethod(ctor, "translate", Translate);
  Nan::SetPrototypeMethod(ctor, "transform", Transform);
  Nan::SetPrototypeMethod(ctor, "getTransform", GetTransform);
  Nan::SetPrototypeMethod(ctor, "resetTransform", ResetTransform);
  Nan::SetPrototypeMethod(ctor, "setTransform", SetTransform);
  Nan::SetPrototypeMethod(ctor, "isPointInPath", IsPointInPath);
  Nan::SetPrototypeMethod(ctor, "scale", Scale);
  Nan::SetPrototypeMethod(ctor, "clip", Clip);
  Nan::SetPrototypeMethod(ctor, "fill", Fill);
  Nan::SetPrototypeMethod(ctor, "stroke", Stroke);
  Nan::SetPrototypeMethod(ctor, "fillText", FillText);
  Nan::SetPrototypeMethod(ctor, "strokeText", StrokeText);
  Nan::SetPrototypeMethod(ctor, "fillRect", FillRect);
  Nan::SetPrototypeMethod(ctor, "strokeRect", StrokeRect);
  Nan::SetPrototypeMethod(ctor, "clearRect", ClearRect);
  Nan::SetPrototypeMethod(ctor, "rect", Rect);
  Nan::SetPrototypeMethod(ctor, "measureText", MeasureText);
  Nan::SetPrototypeMethod(ctor, "moveTo", MoveTo);
  Nan::SetPrototypeMethod(ctor, "lineTo", LineTo);
  Nan::SetPrototypeMethod(ctor, "bezierCurveTo", BezierCurveTo);
  Nan::SetPrototypeMethod(ctor, "quadraticCurveTo", QuadraticCurveTo);
  Nan::SetPrototypeMethod(ctor, "beginPath", BeginPath);
  Nan::SetPrototypeMethod(ctor, "closePath", ClosePath);
  Nan::SetPrototypeMethod(ctor, "arc", Arc);
  Nan::SetPrototypeMethod(ctor, "arcTo", ArcTo);
  Nan::SetPrototypeMethod(ctor, "ellipse", Ellipse);
  Nan::SetPrototypeMethod(ctor, "setLineDash", SetLineDash);
  Nan::SetPrototypeMethod(ctor, "getLineDash", GetLineDash);
  Nan::SetPrototypeMethod(ctor, "createPattern", CreatePattern);
  Nan::SetPrototypeMethod(ctor, "createLinearGradient", CreateLinearGradient);
  Nan::SetPrototypeMethod(ctor, "createRadialGradient", CreateRadialGradient);
  SetProtoAccessor(proto, Nan::New("pixelFormat").ToLocalChecked(), GetFormat, NULL, ctor);
  SetProtoAccessor(proto, Nan::New("patternQuality").ToLocalChecked(), GetPatternQuality, SetPatternQuality, ctor);
  SetProtoAccessor(proto, Nan::New("imageSmoothingEnabled").ToLocalChecked(), GetImageSmoothingEnabled, SetImageSmoothingEnabled, ctor);
  SetProtoAccessor(proto, Nan::New("globalCompositeOperation").ToLocalChecked(), GetGlobalCompositeOperation, SetGlobalCompositeOperation, ctor);
  SetProtoAccessor(proto, Nan::New("globalAlpha").ToLocalChecked(), GetGlobalAlpha, SetGlobalAlpha, ctor);
  SetProtoAccessor(proto, Nan::New("shadowColor").ToLocalChecked(), GetShadowColor, SetShadowColor, ctor);
  SetProtoAccessor(proto, Nan::New("miterLimit").ToLocalChecked(), GetMiterLimit, SetMiterLimit, ctor);
  SetProtoAccessor(proto, Nan::New("lineWidth").ToLocalChecked(), GetLineWidth, SetLineWidth, ctor);
  SetProtoAccessor(proto, Nan::New("lineCap").ToLocalChecked(), GetLineCap, SetLineCap, ctor);
  SetProtoAccessor(proto, Nan::New("lineJoin").ToLocalChecked(), GetLineJoin, SetLineJoin, ctor);
  SetProtoAccessor(proto, Nan::New("lineDashOffset").ToLocalChecked(), GetLineDashOffset, SetLineDashOffset, ctor);
  SetProtoAccessor(proto, Nan::New("shadowOffsetX").ToLocalChecked(), GetShadowOffsetX, SetShadowOffsetX, ctor);
  SetProtoAccessor(proto, Nan::New("shadowOffsetY").ToLocalChecked(), GetShadowOffsetY, SetShadowOffsetY, ctor);
  SetProtoAccessor(proto, Nan::New("shadowBlur").ToLocalChecked(), GetShadowBlur, SetShadowBlur, ctor);
  SetProtoAccessor(proto, Nan::New("antialias").ToLocalChecked(), GetAntiAlias, SetAntiAlias, ctor);
  SetProtoAccessor(proto, Nan::New("textDrawingMode").ToLocalChecked(), GetTextDrawingMode, SetTextDrawingMode, ctor);
  SetProtoAccessor(proto, Nan::New("quality").ToLocalChecked(), GetQuality, SetQuality, ctor);
  SetProtoAccessor(proto, Nan::New("currentTransform").ToLocalChecked(), GetCurrentTransform, SetCurrentTransform, ctor);
  SetProtoAccessor(proto, Nan::New("fillStyle").ToLocalChecked(), GetFillStyle, SetFillStyle, ctor);
  SetProtoAccessor(proto, Nan::New("strokeStyle").ToLocalChecked(), GetStrokeStyle, SetStrokeStyle, ctor);
  SetProtoAccessor(proto, Nan::New("font").ToLocalChecked(), GetFont, SetFont, ctor);
  SetProtoAccessor(proto, Nan::New("textBaseline").ToLocalChecked(), GetTextBaseline, SetTextBaseline, ctor);
  SetProtoAccessor(proto, Nan::New("textAlign").ToLocalChecked(), GetTextAlign, SetTextAlign, ctor);
  Local<Context> ctx = Nan::GetCurrentContext();
  Nan::Set(target, Nan::New("CanvasRenderingContext2d").ToLocalChecked(), ctor->GetFunction(ctx).ToLocalChecked());
  Nan::Set(target, Nan::New("CanvasRenderingContext2dInit").ToLocalChecked(), Nan::New<Function>(SaveExternalModules));
}

/*
 * Create a cairo context.
 */

Context2d::Context2d(Canvas *canvas) {
  _canvas = canvas;
  _context = canvas->createCairoContext();
  _layout = pango_cairo_create_layout(_context);
  state = states[stateno = 0] = (canvas_state_t *) malloc(sizeof(canvas_state_t));

  resetState(true);
}

/*
 * Destroy cairo context.
 */

Context2d::~Context2d() {
  while(stateno >= 0) {
    pango_font_description_free(states[stateno]->fontDescription);
    free(states[stateno--]);
  }
  g_object_unref(_layout);
  cairo_destroy(_context);
  _resetPersistentHandles();
}

/*
 * Reset canvas state.
 */

void Context2d::resetState(bool init) {
  if (!init) {
    pango_font_description_free(state->fontDescription);
  }

  state->shadowBlur = 0;
  state->shadowOffsetX = state->shadowOffsetY = 0;
  state->globalAlpha = 1;
  state->textAlignment = -1;
  state->fillPattern = nullptr;
  state->strokePattern = nullptr;
  state->fillGradient = nullptr;
  state->strokeGradient = nullptr;
  state->textBaseline = TEXT_BASELINE_ALPHABETIC;
  rgba_t transparent = { 0, 0, 0, 1 };
  rgba_t transparent_black = { 0, 0, 0, 0 };
  state->fill = transparent;
  state->stroke = transparent;
  state->shadow = transparent_black;
  state->patternQuality = CAIRO_FILTER_GOOD;
  state->imageSmoothingEnabled = true;
  state->textDrawingMode = TEXT_DRAW_PATHS;
  state->fontDescription = pango_font_description_from_string("sans");
  pango_font_description_set_absolute_size(state->fontDescription, 10 * PANGO_SCALE);
  pango_layout_set_font_description(_layout, state->fontDescription);

  _resetPersistentHandles();
}

void Context2d::_resetPersistentHandles() {
  _fillStyle.Reset();
  _strokeStyle.Reset();
  _font.Reset();
  _textBaseline.Reset();
  _textAlign.Reset();
}

/*
 * Save cairo / canvas state.
 */

void
Context2d::save() {
  if (stateno < CANVAS_MAX_STATES) {
    cairo_save(_context);
    states[++stateno] = (canvas_state_t *) malloc(sizeof(canvas_state_t));
    memcpy(states[stateno], state, sizeof(canvas_state_t));
    states[stateno]->fontDescription = pango_font_description_copy(states[stateno-1]->fontDescription);
    state = states[stateno];
  }
}

/*
 * Restore cairo / canvas state.
 */

void
Context2d::restore() {
  if (stateno > 0) {
    cairo_restore(_context);
    pango_font_description_free(states[stateno]->fontDescription);
    free(states[stateno]);
    states[stateno] = NULL;
    state = states[--stateno];
    pango_layout_set_font_description(_layout, state->fontDescription);
  }
}

/*
 * Save flat path.
 */

void
Context2d::savePath() {
  _path = cairo_copy_path_flat(_context);
  cairo_new_path(_context);
}

/*
 * Restore flat path.
 */

void
Context2d::restorePath() {
  cairo_new_path(_context);
  cairo_append_path(_context, _path);
  cairo_path_destroy(_path);
}

/*
 * Create temporary surface for gradient or pattern transparency
 */
cairo_pattern_t*
create_transparent_gradient(cairo_pattern_t *source, float alpha) {
  double x0;
  double y0;
  double x1;
  double y1;
  double r0;
  double r1;
  int count;
  int i;
  double offset;
  double r;
  double g;
  double b;
  double a;
  cairo_pattern_t *newGradient;
  cairo_pattern_type_t type = cairo_pattern_get_type(source);
  cairo_pattern_get_color_stop_count(source, &count);
  if (type == CAIRO_PATTERN_TYPE_LINEAR) {
    cairo_pattern_get_linear_points (source, &x0, &y0, &x1, &y1);
    newGradient = cairo_pattern_create_linear(x0, y0, x1, y1);
  } else if (type == CAIRO_PATTERN_TYPE_RADIAL) {
    cairo_pattern_get_radial_circles(source, &x0, &y0, &r0, &x1, &y1, &r1);
    newGradient = cairo_pattern_create_radial(x0, y0, r0, x1, y1, r1);
  } else {
    Nan::ThrowError("Unexpected gradient type");
    return NULL;
  }
  for ( i = 0; i < count; i++ ) {
    cairo_pattern_get_color_stop_rgba(source, i, &offset, &r, &g, &b, &a);
    cairo_pattern_add_color_stop_rgba(newGradient, offset, r, g, b, a * alpha);
  }
  return newGradient;
}

cairo_pattern_t*
create_transparent_pattern(cairo_pattern_t *source, float alpha) {
  cairo_surface_t *surface;
  cairo_pattern_get_surface(source, &surface);
  int width = cairo_image_surface_get_width(surface);
  int height = cairo_image_surface_get_height(surface);
  cairo_surface_t *mask_surface = cairo_image_surface_create(
    CAIRO_FORMAT_ARGB32,
    width,
    height);
  cairo_t *mask_context = cairo_create(mask_surface);
  if (cairo_status(mask_context) != CAIRO_STATUS_SUCCESS) {
    Nan::ThrowError("Failed to initialize context");
    return NULL;
  }
  cairo_set_source(mask_context, source);
  cairo_paint_with_alpha(mask_context, alpha);
  cairo_destroy(mask_context);
  cairo_pattern_t* newPattern = cairo_pattern_create_for_surface(mask_surface);
  cairo_surface_destroy(mask_surface);
  return newPattern;
}

/*
 * Fill and apply shadow.
 */

void
Context2d::setFillRule(v8::Local<v8::Value> value) {
  cairo_fill_rule_t rule = CAIRO_FILL_RULE_WINDING;
  if (value->IsString()) {
    Nan::Utf8String str(value);
    if (std::strcmp(*str, "evenodd") == 0) {
      rule = CAIRO_FILL_RULE_EVEN_ODD;
    }
  }
  cairo_set_fill_rule(_context, rule);
}

void
Context2d::fill(bool preserve) {
  cairo_pattern_t *new_pattern;
  if (state->fillPattern) {
    if (state->globalAlpha < 1) {
      new_pattern = create_transparent_pattern(state->fillPattern, state->globalAlpha);
      if (new_pattern == NULL) {
        // failed to allocate; Nan::ThrowError has already been called, so return from this fn.
        return;
      }
      cairo_set_source(_context, new_pattern);
      cairo_pattern_destroy(new_pattern);
    } else {
      cairo_pattern_set_filter(state->fillPattern, state->patternQuality);
      cairo_set_source(_context, state->fillPattern);
    }
    repeat_type_t repeat = Pattern::get_repeat_type_for_cairo_pattern(state->fillPattern);
    if (NO_REPEAT == repeat) {
      cairo_pattern_set_extend(cairo_get_source(_context), CAIRO_EXTEND_NONE);
    } else {
      cairo_pattern_set_extend(cairo_get_source(_context), CAIRO_EXTEND_REPEAT);
    }
  } else if (state->fillGradient) {
    if (state->globalAlpha < 1) {
      new_pattern = create_transparent_gradient(state->fillGradient, state->globalAlpha);
      if (new_pattern == NULL) {
        // failed to recognize gradient; Nan::ThrowError has already been called, so return from this fn.
        return;
      }
      cairo_pattern_set_filter(new_pattern, state->patternQuality);
      cairo_set_source(_context, new_pattern);
      cairo_pattern_destroy(new_pattern);
    } else {
      cairo_pattern_set_filter(state->fillGradient, state->patternQuality);
      cairo_set_source(_context, state->fillGradient);
    }
  } else {
    setSourceRGBA(state->fill);
  }
  if (preserve) {
    hasShadow()
      ? shadow(cairo_fill_preserve)
      : cairo_fill_preserve(_context);
  } else {
    hasShadow()
      ? shadow(cairo_fill)
      : cairo_fill(_context);
  }
}

/*
 * Stroke and apply shadow.
 */

void
Context2d::stroke(bool preserve) {
  cairo_pattern_t *new_pattern;
  if (state->strokePattern) {
    if (state->globalAlpha < 1) {
      new_pattern = create_transparent_pattern(state->strokePattern, state->globalAlpha);
      if (new_pattern == NULL) {
        // failed to allocate; Nan::ThrowError has already been called, so return from this fn.
        return;
      }
      cairo_set_source(_context, new_pattern);
      cairo_pattern_destroy(new_pattern);
    } else {
      cairo_pattern_set_filter(state->strokePattern, state->patternQuality);
      cairo_set_source(_context, state->strokePattern);
    }
    repeat_type_t repeat = Pattern::get_repeat_type_for_cairo_pattern(state->strokePattern);
    if (NO_REPEAT == repeat) {
      cairo_pattern_set_extend(cairo_get_source(_context), CAIRO_EXTEND_NONE);
    } else {
      cairo_pattern_set_extend(cairo_get_source(_context), CAIRO_EXTEND_REPEAT);
    }
  } else if (state->strokeGradient) {
    if (state->globalAlpha < 1) {
      new_pattern = create_transparent_gradient(state->strokeGradient, state->globalAlpha);
      if (new_pattern == NULL) {
        // failed to recognize gradient; Nan::ThrowError has already been called, so return from this fn.
        return;
      }
      cairo_pattern_set_filter(new_pattern, state->patternQuality);
      cairo_set_source(_context, new_pattern);
      cairo_pattern_destroy(new_pattern);
    } else {
      cairo_pattern_set_filter(state->strokeGradient, state->patternQuality);
      cairo_set_source(_context, state->strokeGradient);
    }
  } else {
    setSourceRGBA(state->stroke);
  }

  if (preserve) {
    hasShadow()
      ? shadow(cairo_stroke_preserve)
      : cairo_stroke_preserve(_context);
  } else {
    hasShadow()
      ? shadow(cairo_stroke)
      : cairo_stroke(_context);
  }
}

/*
 * Apply shadow with the given draw fn.
 */

void
Context2d::shadow(void (fn)(cairo_t *cr)) {
  cairo_path_t *path = cairo_copy_path_flat(_context);
  cairo_save(_context);

  // shadowOffset is unaffected by current transform
  cairo_matrix_t path_matrix;
  cairo_get_matrix(_context, &path_matrix);
  cairo_identity_matrix(_context);

  // Apply shadow
  cairo_push_group(_context);

  // No need to invoke blur if shadowBlur is 0
  if (state->shadowBlur) {
    // find out extent of path
    double x1, y1, x2, y2;
    if (fn == cairo_fill || fn == cairo_fill_preserve) {
      cairo_fill_extents(_context, &x1, &y1, &x2, &y2);
    } else {
      cairo_stroke_extents(_context, &x1, &y1, &x2, &y2);
    }

    // create new image surface that size + padding for blurring
    double dx = x2-x1, dy = y2-y1;
    cairo_user_to_device_distance(_context, &dx, &dy);
    int pad = state->shadowBlur * 2;
    cairo_surface_t *shadow_surface = cairo_image_surface_create(
      CAIRO_FORMAT_ARGB32,
      dx + 2 * pad,
      dy + 2 * pad);
    cairo_t *shadow_context = cairo_create(shadow_surface);

    // transform path to the right place
    cairo_translate(shadow_context, pad-x1, pad-y1);
    cairo_transform(shadow_context, &path_matrix);

    // set lineCap lineJoin lineDash
    cairo_set_line_cap(shadow_context, cairo_get_line_cap(_context));
    cairo_set_line_join(shadow_context, cairo_get_line_join(_context));

    double offset;
    int dashes = cairo_get_dash_count(_context);
    std::vector<double> a(dashes);
    cairo_get_dash(_context, a.data(), &offset);
    cairo_set_dash(shadow_context, a.data(), dashes, offset);

    // draw the path and blur
    cairo_set_line_width(shadow_context, cairo_get_line_width(_context));
    cairo_new_path(shadow_context);
    cairo_append_path(shadow_context, path);
    setSourceRGBA(shadow_context, state->shadow);
    fn(shadow_context);
    blur(shadow_surface, state->shadowBlur);

    // paint to original context
    cairo_set_source_surface(_context, shadow_surface,
      x1 - pad + state->shadowOffsetX + 1,
      y1 - pad + state->shadowOffsetY + 1);
    cairo_paint(_context);
    cairo_destroy(shadow_context);
    cairo_surface_destroy(shadow_surface);
  } else {
    // Offset first, then apply path's transform
    cairo_translate(
        _context
      , state->shadowOffsetX
      , state->shadowOffsetY);
    cairo_transform(_context, &path_matrix);

    // Apply shadow
    cairo_new_path(_context);
    cairo_append_path(_context, path);
    setSourceRGBA(state->shadow);

    fn(_context);
  }

  // Paint the shadow
  cairo_pop_group_to_source(_context);
  cairo_paint(_context);

  // Restore state
  cairo_restore(_context);
  cairo_new_path(_context);
  cairo_append_path(_context, path);
  fn(_context);

  cairo_path_destroy(path);
}

/*
 * Set source RGBA for the current context
 */

void
Context2d::setSourceRGBA(rgba_t color) {
  setSourceRGBA(_context, color);
}

/*
 * Set source RGBA
 */

void
Context2d::setSourceRGBA(cairo_t *ctx, rgba_t color) {
  cairo_set_source_rgba(
      ctx
    , color.r
    , color.g
    , color.b
    , color.a * state->globalAlpha);
}

/*
 * Check if the context has a drawable shadow.
 */

bool
Context2d::hasShadow() {
  return state->shadow.a
    && (state->shadowBlur || state->shadowOffsetX || state->shadowOffsetY);
}

/*
 * Blur the given surface with the given radius.
 */

void
Context2d::blur(cairo_surface_t *surface, int radius) {
  // Steve Hanov, 2009
  // Released into the public domain.
  radius = radius * 0.57735f + 0.5f;
  // get width, height
  int width = cairo_image_surface_get_width( surface );
  int height = cairo_image_surface_get_height( surface );
  unsigned* precalc =
      (unsigned*)malloc(width*height*sizeof(unsigned));
  cairo_surface_flush( surface );
  unsigned char* src = cairo_image_surface_get_data( surface );
  double mul=1.f/((radius*2)*(radius*2));
  int channel;

  // The number of times to perform the averaging. According to wikipedia,
  // three iterations is good enough to pass for a gaussian.
  const int MAX_ITERATIONS = 3;
  int iteration;

  for ( iteration = 0; iteration < MAX_ITERATIONS; iteration++ ) {
      for( channel = 0; channel < 4; channel++ ) {
          int x,y;

          // precomputation step.
          unsigned char* pix = src;
          unsigned* pre = precalc;

          pix += channel;
          for (y=0;y<height;y++) {
              for (x=0;x<width;x++) {
                  int tot=pix[0];
                  if (x>0) tot+=pre[-1];
                  if (y>0) tot+=pre[-width];
                  if (x>0 && y>0) tot-=pre[-width-1];
                  *pre++=tot;
                  pix += 4;
              }
          }

          // blur step.
          pix = src + (int)radius * width * 4 + (int)radius * 4 + channel;
          for (y=radius;y<height-radius;y++) {
              for (x=radius;x<width-radius;x++) {
                  int l = x < radius ? 0 : x - radius;
                  int t = y < radius ? 0 : y - radius;
                  int r = x + radius >= width ? width - 1 : x + radius;
                  int b = y + radius >= height ? height - 1 : y + radius;
                  int tot = precalc[r+b*width] + precalc[l+t*width] -
                      precalc[l+b*width] - precalc[r+t*width];
                  *pix=(unsigned char)(tot*mul);
                  pix += 4;
              }
              pix += (int)radius * 2 * 4;
          }
      }
  }

  cairo_surface_mark_dirty(surface);
  free(precalc);
}

/*
 * Initialize a new Context2d with the given canvas.
 */

NAN_METHOD(Context2d::New) {
  if (!info.IsConstructCall()) {
    return Nan::ThrowTypeError("Class constructors cannot be invoked without 'new'");
  }

  if (!info[0]->IsObject())
    return Nan::ThrowTypeError("Canvas expected");
  Local<Object> obj = Nan::To<Object>(info[0]).ToLocalChecked();
  if (!Nan::New(Canvas::constructor)->HasInstance(obj))
    return Nan::ThrowTypeError("Canvas expected");
  Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(obj);

  bool isImageBackend = canvas->backend()->getName() == "image";
  if (isImageBackend) {
    cairo_format_t format = ImageBackend::DEFAULT_FORMAT;
    if (info[1]->IsObject()) {
      Local<Object> ctxAttributes = Nan::To<Object>(info[1]).ToLocalChecked();

      Local<Value> pixelFormat = Nan::Get(ctxAttributes, Nan::New("pixelFormat").ToLocalChecked()).ToLocalChecked();
      if (pixelFormat->IsString()) {
        Nan::Utf8String utf8PixelFormat(pixelFormat);
        if (!strcmp(*utf8PixelFormat, "RGBA32")) format = CAIRO_FORMAT_ARGB32;
        else if (!strcmp(*utf8PixelFormat, "RGB24")) format = CAIRO_FORMAT_RGB24;
        else if (!strcmp(*utf8PixelFormat, "A8")) format = CAIRO_FORMAT_A8;
        else if (!strcmp(*utf8PixelFormat, "RGB16_565")) format = CAIRO_FORMAT_RGB16_565;
        else if (!strcmp(*utf8PixelFormat, "A1")) format = CAIRO_FORMAT_A1;
#ifdef CAIRO_FORMAT_RGB30
        else if (!strcmp(utf8PixelFormat, "RGB30")) format = CAIRO_FORMAT_RGB30;
#endif
      }

      // alpha: false forces use of RGB24
      Local<Value> alpha = Nan::Get(ctxAttributes, Nan::New("alpha").ToLocalChecked()).ToLocalChecked();
      if (alpha->IsBoolean() && !Nan::To<bool>(alpha).FromMaybe(false)) {
        format = CAIRO_FORMAT_RGB24;
      }
    }
    static_cast<ImageBackend*>(canvas->backend())->setFormat(format);
  }

  Context2d *context = new Context2d(canvas);

  context->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

/*
 * Save some external modules as private references.
 */

NAN_METHOD(Context2d::SaveExternalModules) {
  _DOMMatrix.Reset(Nan::To<Function>(info[0]).ToLocalChecked());
  _parseFont.Reset(Nan::To<Function>(info[1]).ToLocalChecked());
}

/*
* Get format (string).
*/

NAN_GETTER(Context2d::GetFormat) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  std::string pixelFormatString;
  switch (context->canvas()->backend()->getFormat()) {
  case CAIRO_FORMAT_ARGB32: pixelFormatString = "RGBA32"; break;
  case CAIRO_FORMAT_RGB24: pixelFormatString = "RGB24"; break;
  case CAIRO_FORMAT_A8: pixelFormatString = "A8"; break;
  case CAIRO_FORMAT_A1: pixelFormatString = "A1"; break;
  case CAIRO_FORMAT_RGB16_565: pixelFormatString = "RGB16_565"; break;
#ifdef CAIRO_FORMAT_RGB30
  case CAIRO_FORMAT_RGB30: pixelFormatString = "RGB30"; break;
#endif
  default: return info.GetReturnValue().SetNull();
  }
  info.GetReturnValue().Set(Nan::New<String>(pixelFormatString).ToLocalChecked());
}

/*
 * Create a new page.
 */

NAN_METHOD(Context2d::AddPage) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  if (context->canvas()->backend()->getName() != "pdf") {
    return Nan::ThrowError("only PDF canvases support .addPage()");
  }
  cairo_show_page(context->context());
  int width = Nan::To<int32_t>(info[0]).FromMaybe(0);
  int height = Nan::To<int32_t>(info[1]).FromMaybe(0);
  if (width < 1) width = context->canvas()->getWidth();
  if (height < 1) height = context->canvas()->getHeight();
  cairo_pdf_surface_set_size(context->canvas()->surface(), width, height);
  return;
}

/*
 * Put image data.
 *
 *  - imageData, dx, dy
 *  - imageData, dx, dy, sx, sy, sw, sh
 *
 */

NAN_METHOD(Context2d::PutImageData) {
  if (!info[0]->IsObject())
    return Nan::ThrowTypeError("ImageData expected");
  Local<Object> obj = Nan::To<Object>(info[0]).ToLocalChecked();
  if (!Nan::New(ImageData::constructor)->HasInstance(obj))
    return Nan::ThrowTypeError("ImageData expected");

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  ImageData *imageData = Nan::ObjectWrap::Unwrap<ImageData>(obj);

  uint8_t *src = imageData->data();
  uint8_t *dst = context->canvas()->data();

  int dstStride = context->canvas()->stride();
  int Bpp = dstStride / context->canvas()->getWidth();
  int srcStride = Bpp * imageData->width();

  int sx = 0
    , sy = 0
    , sw = 0
    , sh = 0
    , dx = Nan::To<int32_t>(info[1]).FromMaybe(0)
    , dy = Nan::To<int32_t>(info[2]).FromMaybe(0)
    , rows
    , cols;

  switch (info.Length()) {
    // imageData, dx, dy
    case 3:
      sw = imageData->width();
      sh = imageData->height();
      break;
    // imageData, dx, dy, sx, sy, sw, sh
    case 7:
      sx = Nan::To<int32_t>(info[3]).FromMaybe(0);
      sy = Nan::To<int32_t>(info[4]).FromMaybe(0);
      sw = Nan::To<int32_t>(info[5]).FromMaybe(0);
      sh = Nan::To<int32_t>(info[6]).FromMaybe(0);
      // fix up negative height, width
      if (sw < 0) sx += sw, sw = -sw;
      if (sh < 0) sy += sh, sh = -sh;
      // clamp the left edge
      if (sx < 0) sw += sx, sx = 0;
      if (sy < 0) sh += sy, sy = 0;
      // clamp the right edge
      if (sx + sw > imageData->width()) sw = imageData->width() - sx;
      if (sy + sh > imageData->height()) sh = imageData->height() - sy;
      // start destination at source offset
      dx += sx;
      dy += sy;
      break;
    default:
      return Nan::ThrowError("invalid arguments");
  }

  // chop off outlying source data
  if (dx < 0) sw += dx, sx -= dx, dx = 0;
  if (dy < 0) sh += dy, sy -= dy, dy = 0;
  // clamp width at canvas size
  // Need to wrap std::min calls using parens to prevent macro expansion on
  // windows. See http://stackoverflow.com/questions/5004858/stdmin-gives-error
  cols = (std::min)(sw, context->canvas()->getWidth() - dx);
  rows = (std::min)(sh, context->canvas()->getHeight() - dy);

  if (cols <= 0 || rows <= 0) return;

  switch (context->canvas()->backend()->getFormat()) {
  case CAIRO_FORMAT_ARGB32: {
    src += sy * srcStride + sx * 4;
    dst += dstStride * dy + 4 * dx;
    for (int y = 0; y < rows; ++y) {
      uint8_t *dstRow = dst;
      uint8_t *srcRow = src;
      for (int x = 0; x < cols; ++x) {
        // rgba
        uint8_t r = *srcRow++;
        uint8_t g = *srcRow++;
        uint8_t b = *srcRow++;
        uint8_t a = *srcRow++;

        // argb
        // performance optimization: fully transparent/opaque pixels can be
        // processed more efficiently.
        if (a == 0) {
          *dstRow++ = 0;
          *dstRow++ = 0;
          *dstRow++ = 0;
          *dstRow++ = 0;
        } else if (a == 255) {
          *dstRow++ = b;
          *dstRow++ = g;
          *dstRow++ = r;
          *dstRow++ = a;
        } else {
          float alpha = (float)a / 255;
          *dstRow++ = b * alpha;
          *dstRow++ = g * alpha;
          *dstRow++ = r * alpha;
          *dstRow++ = a;
        }
      }
      dst += dstStride;
      src += srcStride;
    }
    break;
  }
  case CAIRO_FORMAT_RGB24: {
    src += sy * srcStride + sx * 4;
    dst += dstStride * dy + 4 * dx;
    for (int y = 0; y < rows; ++y) {
      uint8_t *dstRow = dst;
      uint8_t *srcRow = src;
      for (int x = 0; x < cols; ++x) {
        // rgba
        uint8_t r = *srcRow++;
        uint8_t g = *srcRow++;
        uint8_t b = *srcRow++;
        srcRow++;

        // argb
        *dstRow++ = b;
        *dstRow++ = g;
        *dstRow++ = r;
        *dstRow++ = 255;
      }
      dst += dstStride;
      src += srcStride;
    }
    break;
  }
  case CAIRO_FORMAT_A8: {
    src += sy * srcStride + sx;
    dst += dstStride * dy + dx;
    if (srcStride == dstStride && cols == dstStride) {
      // fast path: strides are the same and doing a full-width put
      memcpy(dst, src, cols * rows);
    } else {
      for (int y = 0; y < rows; ++y) {
        memcpy(dst, src, cols);
        dst += dstStride;
        src += srcStride;
      }
    }
    break;
  }
  case CAIRO_FORMAT_A1: {
    // TODO Should this be totally packed, or maintain a stride divisible by 4?
    Nan::ThrowError("putImageData for CANVAS_FORMAT_A1 is not yet implemented");
    break;
  }
  case CAIRO_FORMAT_RGB16_565: {
    src += sy * srcStride + sx * 2;
    dst += dstStride * dy + 2 * dx;
    for (int y = 0; y < rows; ++y) {
      memcpy(dst, src, cols * 2);
      dst += dstStride;
      src += srcStride;
    }
    break;
  }
#ifdef CAIRO_FORMAT_RGB30
  case CAIRO_FORMAT_RGB30: {
    // TODO
    Nan::ThrowError("putImageData for CANVAS_FORMAT_RGB30 is not yet implemented");
    break;
  }
#endif
  default: {
    Nan::ThrowError("Invalid pixel format");
    break;
  }
  }

  cairo_surface_mark_dirty_rectangle(
      context->canvas()->surface()
    , dx
    , dy
    , cols
    , rows);
}

/*
 * Get image data.
 *
 *  - sx, sy, sw, sh
 *
 */

NAN_METHOD(Context2d::GetImageData) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Canvas *canvas = context->canvas();

  int sx = Nan::To<int32_t>(info[0]).FromMaybe(0);
  int sy = Nan::To<int32_t>(info[1]).FromMaybe(0);
  int sw = Nan::To<int32_t>(info[2]).FromMaybe(0);
  int sh = Nan::To<int32_t>(info[3]).FromMaybe(0);

  if (!sw)
    return Nan::ThrowError("IndexSizeError: The source width is 0.");
  if (!sh)
    return Nan::ThrowError("IndexSizeError: The source height is 0.");

  int width = canvas->getWidth();
  int height = canvas->getHeight();

  if (!width)
    return Nan::ThrowTypeError("Canvas width is 0");
  if (!height)
    return Nan::ThrowTypeError("Canvas height is 0");

  // WebKit and Firefox have this behavior:
  // Flip the coordinates so the origin is top/left-most:
  if (sw < 0) {
    sx += sw;
    sw = -sw;
  }
  if (sh < 0) {
    sy += sh;
    sh = -sh;
  }

  if (sx + sw > width) sw = width - sx;
  if (sy + sh > height) sh = height - sy;

  // WebKit/moz functionality. node-canvas used to return in either case.
  if (sw <= 0) sw = 1;
  if (sh <= 0) sh = 1;

  // Non-compliant. "Pixels outside the canvas must be returned as transparent
  // black." This instead clips the returned array to the canvas area.
  if (sx < 0) {
    sw += sx;
    sx = 0;
  }
  if (sy < 0) {
    sh += sy;
    sy = 0;
  }

  int srcStride = canvas->stride();
  int bpp = srcStride / width;
  int size = sw * sh * bpp;
  int dstStride = sw * bpp;

  uint8_t *src = canvas->data();

  Local<ArrayBuffer> buffer = ArrayBuffer::New(Isolate::GetCurrent(), size);
  Local<TypedArray> dataArray;

  if (canvas->backend()->getFormat() == CAIRO_FORMAT_RGB16_565) {
    dataArray = Uint16Array::New(buffer, 0, size >> 1);
  } else {
    dataArray = Uint8ClampedArray::New(buffer, 0, size);
  }

  Nan::TypedArrayContents<uint8_t> typedArrayContents(dataArray);
  uint8_t* dst = *typedArrayContents;

  switch (canvas->backend()->getFormat()) {
  case CAIRO_FORMAT_ARGB32: {
    // Rearrange alpha (argb -> rgba), undo alpha pre-multiplication,
    // and store in big-endian format
    for (int y = 0; y < sh; ++y) {
      uint32_t *row = (uint32_t *)(src + srcStride * (y + sy));
      for (int x = 0; x < sw; ++x) {
        int bx = x * 4;
        uint32_t *pixel = row + x + sx;
        uint8_t a = *pixel >> 24;
        uint8_t r = *pixel >> 16;
        uint8_t g = *pixel >> 8;
        uint8_t b = *pixel;
        dst[bx + 3] = a;

        // Performance optimization: fully transparent/opaque pixels can be
        // processed more efficiently.
        if (a == 0 || a == 255) {
          dst[bx + 0] = r;
          dst[bx + 1] = g;
          dst[bx + 2] = b;
        } else {
          // Undo alpha pre-multiplication
          float alphaR = (float)255 / a;
          dst[bx + 0] = (int)((float)r * alphaR);
          dst[bx + 1] = (int)((float)g * alphaR);
          dst[bx + 2] = (int)((float)b * alphaR);
        }

      }
      dst += dstStride;
    }
    break;
  }
  case CAIRO_FORMAT_RGB24: {
  // Rearrange alpha (argb -> rgba) and store in big-endian format
    for (int y = 0; y < sh; ++y) {
    uint32_t *row = (uint32_t *)(src + srcStride * (y + sy));
    for (int x = 0; x < sw; ++x) {
      int bx = x * 4;
      uint32_t *pixel = row + x + sx;
      uint8_t r = *pixel >> 16;
      uint8_t g = *pixel >> 8;
      uint8_t b = *pixel;

      dst[bx + 0] = r;
      dst[bx + 1] = g;
      dst[bx + 2] = b;
      dst[bx + 3] = 255;
    }
    dst += dstStride;
    }
    break;
  }
  case CAIRO_FORMAT_A8: {
    for (int y = 0; y < sh; ++y) {
      uint8_t *row = (uint8_t *)(src + srcStride * (y + sy));
      memcpy(dst, row + sx, dstStride);
      dst += dstStride;
    }
    break;
  }
  case CAIRO_FORMAT_A1: {
    // TODO Should this be totally packed, or maintain a stride divisible by 4?
    Nan::ThrowError("getImageData for CANVAS_FORMAT_A1 is not yet implemented");
    break;
  }
  case CAIRO_FORMAT_RGB16_565: {
    for (int y = 0; y < sh; ++y) {
      uint16_t *row = (uint16_t *)(src + srcStride * (y + sy));
      memcpy(dst, row + sx, dstStride);
      dst += dstStride;
    }
    break;
  }
#ifdef CAIRO_FORMAT_RGB30
  case CAIRO_FORMAT_RGB30: {
    // TODO
    Nan::ThrowError("getImageData for CANVAS_FORMAT_RGB30 is not yet implemented");
    break;
  }
#endif
  default: {
    // Unlikely
    Nan::ThrowError("Invalid pixel format");
    break;
  }
  }

  const int argc = 3;
  Local<Int32> swHandle = Nan::New(sw);
  Local<Int32> shHandle = Nan::New(sh);
  Local<Value> argv[argc] = { dataArray, swHandle, shHandle };

  Local<Function> ctor = Nan::GetFunction(Nan::New(ImageData::constructor)).ToLocalChecked();
  Local<Object> instance = Nan::NewInstance(ctor, argc, argv).ToLocalChecked();

  info.GetReturnValue().Set(instance);
}

/**
 * Create `ImageData` with the given dimensions or
 * `ImageData` instance for dimensions.
 */

NAN_METHOD(Context2d::CreateImageData){
  Isolate *iso = Isolate::GetCurrent();
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Canvas *canvas = context->canvas();
  int32_t width, height;

  if (info[0]->IsObject()) {
    Local<Object> obj = Nan::To<Object>(info[0]).ToLocalChecked();
    width = Nan::To<int32_t>(Nan::Get(obj, Nan::New("width").ToLocalChecked()).ToLocalChecked()).FromMaybe(0);
    height = Nan::To<int32_t>(Nan::Get(obj, Nan::New("height").ToLocalChecked()).ToLocalChecked()).FromMaybe(0);
  } else {
    width = Nan::To<int32_t>(info[0]).FromMaybe(0);
    height = Nan::To<int32_t>(info[1]).FromMaybe(0);
  }

  int stride = canvas->stride();
  double Bpp = static_cast<double>(stride) / canvas->getWidth();
  int nBytes = static_cast<int>(Bpp * width * height + .5);

  Local<ArrayBuffer> ab = ArrayBuffer::New(iso, nBytes);
  Local<Object> arr;

  if (canvas->backend()->getFormat() == CAIRO_FORMAT_RGB16_565)
    arr = Uint16Array::New(ab, 0, nBytes / 2);
  else
    arr = Uint8ClampedArray::New(ab, 0, nBytes);

  const int argc = 3;
  Local<Value> argv[argc] = { arr, Nan::New(width), Nan::New(height) };

  Local<Function> ctor = Nan::GetFunction(Nan::New(ImageData::constructor)).ToLocalChecked();
  Local<Object> instance = Nan::NewInstance(ctor, argc, argv).ToLocalChecked();

  info.GetReturnValue().Set(instance);
}

/*
 * Take a transform matrix and return its components
 * 0: angle, 1: scaleX, 2: scaleY, 3: skewX, 4: translateX, 5: translateY
 */
void decompose_matrix(cairo_matrix_t matrix, double *destination) {
  double denom = pow(matrix.xx, 2) + pow(matrix.yx, 2);
  destination[0] = atan2(matrix.yx, matrix.xx);
  destination[1] = sqrt(denom);
  destination[2] = (matrix.xx * matrix.yy - matrix.xy * matrix.yx) / destination[1];
  destination[3] = atan2(matrix.xx * matrix.xy + matrix.yx * matrix.yy, denom);
  destination[4] = matrix.x0;
  destination[5] = matrix.y0;
}

/*
 * Draw image src image to the destination (context).
 *
 *  - dx, dy
 *  - dx, dy, dw, dh
 *  - sx, sy, sw, sh, dx, dy, dw, dh
 *
 */

NAN_METHOD(Context2d::DrawImage) {
  int infoLen = info.Length();
  if (infoLen != 3 && infoLen != 5 && infoLen != 9)
    return Nan::ThrowTypeError("Invalid arguments");

  if (!info[0]->IsObject())
    return Nan::ThrowTypeError("The first argument must be an object");

  double args[8];
  if(!checkArgs(info, args, infoLen - 1, 1))
    return;

  double sx = 0
    , sy = 0
    , sw = 0
    , sh = 0
    , dx = 0
    , dy = 0
    , dw = 0
    , dh = 0
    , source_w = 0
    , source_h = 0;

  cairo_surface_t *surface;

  Local<Object> obj = Nan::To<Object>(info[0]).ToLocalChecked();

  // Image
  if (Nan::New(Image::constructor)->HasInstance(obj)) {
    Image *img = Nan::ObjectWrap::Unwrap<Image>(obj);
    if (!img->isComplete()) {
      return Nan::ThrowError("Image given has not completed loading");
    }
    source_w = sw = img->width;
    source_h = sh = img->height;
    surface = img->surface();

  // Canvas
  } else if (Nan::New(Canvas::constructor)->HasInstance(obj)) {
    Canvas *canvas = Nan::ObjectWrap::Unwrap<Canvas>(obj);
    source_w = sw = canvas->getWidth();
    source_h = sh = canvas->getHeight();
    surface = canvas->surface();

  // Invalid
  } else {
    return Nan::ThrowTypeError("Image or Canvas expected");
  }

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  // Arguments
  switch (infoLen) {
    // img, sx, sy, sw, sh, dx, dy, dw, dh
    case 9:
      sx = args[0];
      sy = args[1];
      sw = args[2];
      sh = args[3];
      dx = args[4];
      dy = args[5];
      dw = args[6];
      dh = args[7];
      break;
    // img, dx, dy, dw, dh
    case 5:
      dx = args[0];
      dy = args[1];
      dw = args[2];
      dh = args[3];
      break;
    // img, dx, dy
    case 3:
      dx = args[0];
      dy = args[1];
      dw = sw;
      dh = sh;
      break;
  }

  if (!(sw && sh && dw && dh))
    return;

  // Start draw
  cairo_save(ctx);

  cairo_matrix_t matrix;
  double transforms[6];
  cairo_get_matrix(context->context(), &matrix);
  decompose_matrix(matrix, transforms);
  // extract the scale value from the current transform so that we know how many pixels we
  // need for our extra canvas in the drawImage operation.
  double current_scale_x = std::abs(transforms[1]);
  double current_scale_y = std::abs(transforms[2]);
  double extra_dx = 0;
  double extra_dy = 0;
  double fx = dw / sw * current_scale_x; // transforms[1] is scale on X
  double fy = dh / sh * current_scale_y; // transforms[2] is scale on X
  bool needScale = dw != sw || dh != sh;
  bool needCut = sw != source_w || sh != source_h || sx < 0 || sy < 0;
  bool sameCanvas = surface == context->canvas()->surface();
  bool needsExtraSurface = sameCanvas || needCut || needScale;
  cairo_surface_t *surfTemp = NULL;
  cairo_t *ctxTemp = NULL;

  if (needsExtraSurface) {
    // we want to create the extra surface as small as possible.
    // fx and fy are the total scaling we need to apply to sw, sh.
    // from sw and sh we want to remove the part that is outside the source_w and soruce_h
    double real_w = sw;
    double real_h = sh;
    double translate_x = 0;
    double translate_y = 0;
    // if sx or sy are negative, a part of the area represented by sw and sh is empty
    // because there are empty pixels, so we cut it out.
    // On the other hand if sx or sy are positive, but sw and sh extend outside the real
    // source pixels, we cut the area in that case too.
    if (sx < 0) {
      extra_dx = -sx * fx;
      real_w = sw + sx;
    } else if (sx + sw > source_w) {
      real_w = sw - (sx + sw - source_w);
    }
    if (sy < 0) {
      extra_dy = -sy * fy;
      real_h = sh + sy;
    } else if (sy + sh > source_h) {
      real_h = sh - (sy + sh - source_h);
    }
    // if after cutting we are still bigger than source pixels, we restrict again
    if (real_w > source_w) {
      real_w = source_w;
    }
    if (real_h > source_h) {
      real_h = source_h;
    }
    // TODO: find a way to limit the surfTemp to real_w and real_h if fx and fy are bigger than 1.
    // there are no more pixel than the one available in the source, no need to create a bigger surface.
    surfTemp = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, round(real_w * fx), round(real_h * fy));
    ctxTemp = cairo_create(surfTemp);
    cairo_scale(ctxTemp, fx, fy);
    if (sx > 0) {
      translate_x = sx;
    }
    if (sy > 0) {
      translate_y = sy;
    }
    cairo_set_source_surface(ctxTemp, surface, -translate_x, -translate_y);
    cairo_pattern_set_filter(cairo_get_source(ctxTemp), context->state->imageSmoothingEnabled ? context->state->patternQuality : CAIRO_FILTER_NEAREST);
    cairo_pattern_set_extend(cairo_get_source(ctxTemp), CAIRO_EXTEND_REFLECT);
    cairo_paint_with_alpha(ctxTemp, 1);
    surface = surfTemp;
  }
  // apply shadow if there is one
  if (context->hasShadow()) {
    if(context->state->shadowBlur) {
      // we need to create a new surface in order to blur
      int pad = context->state->shadowBlur * 2;
      cairo_surface_t *shadow_surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, dw + 2 * pad, dh + 2 * pad);
      cairo_t *shadow_context = cairo_create(shadow_surface);

      // mask and blur
      context->setSourceRGBA(shadow_context, context->state->shadow);
      cairo_mask_surface(shadow_context, surface, pad, pad);
      context->blur(shadow_surface, context->state->shadowBlur);

      // paint
      // @note: ShadowBlur looks different in each browser. This implementation matches chrome as close as possible.
      //        The 1.4 offset comes from visual tests with Chrome. I have read the spec and part of the shadowBlur
      //        implementation, and its not immediately clear why an offset is necessary, but without it, the result
      //        in chrome is different.
      cairo_set_source_surface(ctx, shadow_surface,
        dx + context->state->shadowOffsetX - pad + 1.4,
        dy + context->state->shadowOffsetY - pad + 1.4);
      cairo_paint(ctx);
      // cleanup
      cairo_destroy(shadow_context);
      cairo_surface_destroy(shadow_surface);
    } else {
      context->setSourceRGBA(context->state->shadow);
      cairo_mask_surface(ctx, surface,
        dx + (context->state->shadowOffsetX),
        dy + (context->state->shadowOffsetY));
    }
  }

  double scaled_dx = dx;
  double scaled_dy = dy;

  if (needsExtraSurface && (current_scale_x != 1 || current_scale_y != 1)) {
    // in this case our surface contains already current_scale_x, we need to scale back
    cairo_scale(ctx, 1 / current_scale_x, 1 / current_scale_y);
    scaled_dx *= current_scale_x;
    scaled_dy *= current_scale_y;
  }
  // Paint
  cairo_set_source_surface(ctx, surface, scaled_dx + extra_dx, scaled_dy + extra_dy);
  cairo_pattern_set_filter(cairo_get_source(ctx), context->state->imageSmoothingEnabled ? context->state->patternQuality : CAIRO_FILTER_NEAREST);
  cairo_pattern_set_extend(cairo_get_source(ctx), CAIRO_EXTEND_NONE);
  cairo_paint_with_alpha(ctx, context->state->globalAlpha);

  cairo_restore(ctx);

  if (needsExtraSurface) {
    cairo_destroy(ctxTemp);
    cairo_surface_destroy(surfTemp);
  }
}

/*
 * Get global alpha.
 */

NAN_GETTER(Context2d::GetGlobalAlpha) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(context->state->globalAlpha));
}

/*
 * Set global alpha.
 */

NAN_SETTER(Context2d::SetGlobalAlpha) {
  double n = Nan::To<double>(value).FromMaybe(0);
  if (n >= 0 && n <= 1) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->globalAlpha = n;
  }
}

/*
 * Get global composite operation.
 */

NAN_GETTER(Context2d::GetGlobalCompositeOperation) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  const char *op = "source-over";
  switch (cairo_get_operator(ctx)) {
    // composite modes:
    case CAIRO_OPERATOR_CLEAR: op = "clear"; break;
    case CAIRO_OPERATOR_SOURCE: op = "copy"; break;
    case CAIRO_OPERATOR_DEST: op = "destination"; break;
    case CAIRO_OPERATOR_OVER: op = "source-over"; break;
    case CAIRO_OPERATOR_DEST_OVER: op = "destination-over"; break;
    case CAIRO_OPERATOR_IN: op = "source-in"; break;
    case CAIRO_OPERATOR_DEST_IN: op = "destination-in"; break;
    case CAIRO_OPERATOR_OUT: op = "source-out"; break;
    case CAIRO_OPERATOR_DEST_OUT: op = "destination-out"; break;
    case CAIRO_OPERATOR_ATOP: op = "source-atop"; break;
    case CAIRO_OPERATOR_DEST_ATOP: op = "destination-atop"; break;
    case CAIRO_OPERATOR_XOR: op = "xor"; break;
    case CAIRO_OPERATOR_ADD: op = "lighter"; break;
    // blend modes:
    // Note: "source-over" and "normal" are synonyms. Chrome and FF both report
    // "source-over" after setting gCO to "normal".
    // case CAIRO_OPERATOR_OVER: op = "normal";
    case CAIRO_OPERATOR_MULTIPLY: op = "multiply"; break;
    case CAIRO_OPERATOR_SCREEN: op = "screen"; break;
    case CAIRO_OPERATOR_OVERLAY: op = "overlay"; break;
    case CAIRO_OPERATOR_DARKEN: op = "darken"; break;
    case CAIRO_OPERATOR_LIGHTEN: op = "lighten"; break;
    case CAIRO_OPERATOR_COLOR_DODGE: op = "color-dodge"; break;
    case CAIRO_OPERATOR_COLOR_BURN: op = "color-burn"; break;
    case CAIRO_OPERATOR_HARD_LIGHT: op = "hard-light"; break;
    case CAIRO_OPERATOR_SOFT_LIGHT: op = "soft-light"; break;
    case CAIRO_OPERATOR_DIFFERENCE: op = "difference"; break;
    case CAIRO_OPERATOR_EXCLUSION: op = "exclusion"; break;
    case CAIRO_OPERATOR_HSL_HUE: op = "hue"; break;
    case CAIRO_OPERATOR_HSL_SATURATION: op = "saturation"; break;
    case CAIRO_OPERATOR_HSL_COLOR: op = "color"; break;
    case CAIRO_OPERATOR_HSL_LUMINOSITY: op = "luminosity"; break;
    // non-standard:
    case CAIRO_OPERATOR_SATURATE: op = "saturate"; break;
  }

  info.GetReturnValue().Set(Nan::New(op).ToLocalChecked());
}

/*
 * Set pattern quality.
 */

NAN_SETTER(Context2d::SetPatternQuality) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Nan::Utf8String quality(Nan::To<String>(value).ToLocalChecked());
  if (0 == strcmp("fast", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_FAST;
  } else if (0 == strcmp("good", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_GOOD;
  } else if (0 == strcmp("best", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_BEST;
  } else if (0 == strcmp("nearest", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_NEAREST;
  } else if (0 == strcmp("bilinear", *quality)) {
    context->state->patternQuality = CAIRO_FILTER_BILINEAR;
  }
}

/*
 * Get pattern quality.
 */

NAN_GETTER(Context2d::GetPatternQuality) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *quality;
  switch (context->state->patternQuality) {
    case CAIRO_FILTER_FAST: quality = "fast"; break;
    case CAIRO_FILTER_BEST: quality = "best"; break;
    case CAIRO_FILTER_NEAREST: quality = "nearest"; break;
    case CAIRO_FILTER_BILINEAR: quality = "bilinear"; break;
    default: quality = "good";
  }
  info.GetReturnValue().Set(Nan::New(quality).ToLocalChecked());
}

/*
 * Set ImageSmoothingEnabled value.
 */

NAN_SETTER(Context2d::SetImageSmoothingEnabled) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->imageSmoothingEnabled = Nan::To<bool>(value).FromMaybe(false);
}

/*
 * Get pattern quality.
 */

NAN_GETTER(Context2d::GetImageSmoothingEnabled) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Boolean>(context->state->imageSmoothingEnabled));
}

/*
 * Set global composite operation.
 */

NAN_SETTER(Context2d::SetGlobalCompositeOperation) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  Nan::Utf8String opStr(Nan::To<String>(value).ToLocalChecked()); // Unlike CSS colors, this *is* case-sensitive
  const std::map<std::string, cairo_operator_t> blendmodes = {
    // composite modes:
    {"clear", CAIRO_OPERATOR_CLEAR},
    {"copy", CAIRO_OPERATOR_SOURCE},
    {"destination", CAIRO_OPERATOR_DEST}, // this seems to have been omitted from the spec
    {"source-over", CAIRO_OPERATOR_OVER},
    {"destination-over", CAIRO_OPERATOR_DEST_OVER},
    {"source-in", CAIRO_OPERATOR_IN},
    {"destination-in", CAIRO_OPERATOR_DEST_IN},
    {"source-out", CAIRO_OPERATOR_OUT},
    {"destination-out", CAIRO_OPERATOR_DEST_OUT},
    {"source-atop", CAIRO_OPERATOR_ATOP},
    {"destination-atop", CAIRO_OPERATOR_DEST_ATOP},
    {"xor", CAIRO_OPERATOR_XOR},
    {"lighter", CAIRO_OPERATOR_ADD},
    // blend modes:
    {"normal", CAIRO_OPERATOR_OVER},
    {"multiply", CAIRO_OPERATOR_MULTIPLY},
    {"screen", CAIRO_OPERATOR_SCREEN},
    {"overlay", CAIRO_OPERATOR_OVERLAY},
    {"darken", CAIRO_OPERATOR_DARKEN},
    {"lighten", CAIRO_OPERATOR_LIGHTEN},
    {"color-dodge", CAIRO_OPERATOR_COLOR_DODGE},
    {"color-burn", CAIRO_OPERATOR_COLOR_BURN},
    {"hard-light", CAIRO_OPERATOR_HARD_LIGHT},
    {"soft-light", CAIRO_OPERATOR_SOFT_LIGHT},
    {"difference", CAIRO_OPERATOR_DIFFERENCE},
    {"exclusion", CAIRO_OPERATOR_EXCLUSION},
    {"hue", CAIRO_OPERATOR_HSL_HUE},
    {"saturation", CAIRO_OPERATOR_HSL_SATURATION},
    {"color", CAIRO_OPERATOR_HSL_COLOR},
    {"luminosity", CAIRO_OPERATOR_HSL_LUMINOSITY},
    // non-standard:
    {"saturate", CAIRO_OPERATOR_SATURATE}
  };
  auto op = blendmodes.find(*opStr);
  if (op != blendmodes.end()) cairo_set_operator(ctx, op->second);
}

/*
 * Get shadow offset x.
 */

NAN_GETTER(Context2d::GetShadowOffsetX) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(context->state->shadowOffsetX));
}

/*
 * Set shadow offset x.
 */

NAN_SETTER(Context2d::SetShadowOffsetX) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->shadowOffsetX = Nan::To<double>(value).FromMaybe(0);
}

/*
 * Get shadow offset y.
 */

NAN_GETTER(Context2d::GetShadowOffsetY) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(context->state->shadowOffsetY));
}

/*
 * Set shadow offset y.
 */

NAN_SETTER(Context2d::SetShadowOffsetY) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->shadowOffsetY = Nan::To<double>(value).FromMaybe(0);
}

/*
 * Get shadow blur.
 */

NAN_GETTER(Context2d::GetShadowBlur) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(context->state->shadowBlur));
}

/*
 * Set shadow blur.
 */

NAN_SETTER(Context2d::SetShadowBlur) {
  int n = Nan::To<double>(value).FromMaybe(0);
  if (n >= 0) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->shadowBlur = n;
  }
}

/*
 * Get current antialiasing setting.
 */

NAN_GETTER(Context2d::GetAntiAlias) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *aa;
  switch (cairo_get_antialias(context->context())) {
    case CAIRO_ANTIALIAS_NONE: aa = "none"; break;
    case CAIRO_ANTIALIAS_GRAY: aa = "gray"; break;
    case CAIRO_ANTIALIAS_SUBPIXEL: aa = "subpixel"; break;
    default: aa = "default";
  }
  info.GetReturnValue().Set(Nan::New(aa).ToLocalChecked());
}

/*
 * Set antialiasing.
 */

NAN_SETTER(Context2d::SetAntiAlias) {
  Nan::Utf8String str(Nan::To<String>(value).ToLocalChecked());
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  cairo_antialias_t a;
  if (0 == strcmp("none", *str)) {
    a = CAIRO_ANTIALIAS_NONE;
  } else if (0 == strcmp("default", *str)) {
    a = CAIRO_ANTIALIAS_DEFAULT;
  } else if (0 == strcmp("gray", *str)) {
    a = CAIRO_ANTIALIAS_GRAY;
  } else if (0 == strcmp("subpixel", *str)) {
    a = CAIRO_ANTIALIAS_SUBPIXEL;
  } else {
    a = cairo_get_antialias(ctx);
  }
  cairo_set_antialias(ctx, a);
}

/*
 * Get text drawing mode.
 */

NAN_GETTER(Context2d::GetTextDrawingMode) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *mode;
  if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    mode = "path";
  } else if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    mode = "glyph";
  } else {
    mode = "unknown";
  }
  info.GetReturnValue().Set(Nan::New(mode).ToLocalChecked());
}

/*
 * Set text drawing mode.
 */

NAN_SETTER(Context2d::SetTextDrawingMode) {
  Nan::Utf8String str(Nan::To<String>(value).ToLocalChecked());
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  if (0 == strcmp("path", *str)) {
    context->state->textDrawingMode = TEXT_DRAW_PATHS;
  } else if (0 == strcmp("glyph", *str)) {
    context->state->textDrawingMode = TEXT_DRAW_GLYPHS;
  }
}

/*
 * Get filter.
 */

NAN_GETTER(Context2d::GetQuality) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *filter;
  switch (cairo_pattern_get_filter(cairo_get_source(context->context()))) {
    case CAIRO_FILTER_FAST: filter = "fast"; break;
    case CAIRO_FILTER_BEST: filter = "best"; break;
    case CAIRO_FILTER_NEAREST: filter = "nearest"; break;
    case CAIRO_FILTER_BILINEAR: filter = "bilinear"; break;
    default: filter = "good";
  }
  info.GetReturnValue().Set(Nan::New(filter).ToLocalChecked());
}

/*
 * Set filter.
 */

NAN_SETTER(Context2d::SetQuality) {
  Nan::Utf8String str(Nan::To<String>(value).ToLocalChecked());
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_filter_t filter;
  if (0 == strcmp("fast", *str)) {
    filter = CAIRO_FILTER_FAST;
  } else if (0 == strcmp("best", *str)) {
    filter = CAIRO_FILTER_BEST;
  } else if (0 == strcmp("nearest", *str)) {
    filter = CAIRO_FILTER_NEAREST;
  } else if (0 == strcmp("bilinear", *str)) {
    filter = CAIRO_FILTER_BILINEAR;
  } else {
    filter = CAIRO_FILTER_GOOD;
  }
  cairo_pattern_set_filter(cairo_get_source(context->context()), filter);
}

/*
 * Helper for get current transform matrix
 */

Local<Object>
get_current_transform(Context2d *context) {
  Isolate *iso = Isolate::GetCurrent();

  Local<Float64Array> arr = Float64Array::New(ArrayBuffer::New(iso, 48), 0, 6);
  Nan::TypedArrayContents<double> dest(arr);
  cairo_matrix_t matrix;
  cairo_get_matrix(context->context(), &matrix);
  (*dest)[0] = matrix.xx;
  (*dest)[1] = matrix.yx;
  (*dest)[2] = matrix.xy;
  (*dest)[3] = matrix.yy;
  (*dest)[4] = matrix.x0;
  (*dest)[5] = matrix.y0;

  const int argc = 1;
  Local<Value> argv[argc] = { arr };
  return Nan::NewInstance(context->_DOMMatrix.Get(iso), argc, argv).ToLocalChecked();
}

/*
 * Helper for get/set transform.
 */

void parse_matrix_from_object(cairo_matrix_t &matrix, Local<Object> mat) {
  cairo_matrix_init(&matrix,
    Nan::To<double>(Nan::Get(mat, Nan::New("a").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("b").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("c").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("d").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("e").ToLocalChecked()).ToLocalChecked()).FromMaybe(0),
    Nan::To<double>(Nan::Get(mat, Nan::New("f").ToLocalChecked()).ToLocalChecked()).FromMaybe(0)
  );
}


/*
 * Get current transform.
 */

NAN_GETTER(Context2d::GetCurrentTransform) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Local<Object> instance = get_current_transform(context);

  info.GetReturnValue().Set(instance);
}

/*
 * Set current transform.
 */

NAN_SETTER(Context2d::SetCurrentTransform) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Local<Context> ctx = Nan::GetCurrentContext();
  Local<Object> mat = Nan::To<Object>(value).ToLocalChecked();

#if NODE_MAJOR_VERSION >= 8
  if (!mat->InstanceOf(ctx, _DOMMatrix.Get(Isolate::GetCurrent())).ToChecked()) {
    return Nan::ThrowTypeError("Expected DOMMatrix");
  }
#endif

  cairo_matrix_t matrix;
  parse_matrix_from_object(matrix, mat);

  cairo_transform(context->context(), &matrix);
}

/*
 * Get current fill style.
 */

NAN_GETTER(Context2d::GetFillStyle) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Isolate *iso = Isolate::GetCurrent();
  Local<Value> style;

  if (context->_fillStyle.IsEmpty())
    style = context->_getFillColor();
  else
    style = context->_fillStyle.Get(iso);

  info.GetReturnValue().Set(style);
}

/*
 * Set current fill style.
 */

NAN_SETTER(Context2d::SetFillStyle) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());

  if (value->IsString()) {
    MaybeLocal<String> mstr = Nan::To<String>(value);
    if (mstr.IsEmpty()) return;
    Local<String> str = mstr.ToLocalChecked();
    context->_fillStyle.Reset();
    context->_setFillColor(str);
  } else if (value->IsObject()) {
    Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();
    if (Nan::New(Gradient::constructor)->HasInstance(obj)) {
      context->_fillStyle.Reset(value);
      Gradient *grad = Nan::ObjectWrap::Unwrap<Gradient>(obj);
      context->state->fillGradient = grad->pattern();
    } else if (Nan::New(Pattern::constructor)->HasInstance(obj)) {
      context->_fillStyle.Reset(value);
      Pattern *pattern = Nan::ObjectWrap::Unwrap<Pattern>(obj);
      context->state->fillPattern = pattern->pattern();
    }
  }
}

/*
 * Get current stroke style.
 */

NAN_GETTER(Context2d::GetStrokeStyle) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Local<Value> style;

  if (context->_strokeStyle.IsEmpty())
    style = context->_getStrokeColor();
  else
    style = context->_strokeStyle.Get(Isolate::GetCurrent());

  info.GetReturnValue().Set(style);
}

/*
 * Set current stroke style.
 */

NAN_SETTER(Context2d::SetStrokeStyle) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());

  if (value->IsString()) {
    MaybeLocal<String> mstr = Nan::To<String>(value);
    if (mstr.IsEmpty()) return;
    Local<String> str = mstr.ToLocalChecked();
    context->_strokeStyle.Reset();
    context->_setStrokeColor(str);
  } else if (value->IsObject()) {
    Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();
    if (Nan::New(Gradient::constructor)->HasInstance(obj)) {
      context->_strokeStyle.Reset(value);
      Gradient *grad = Nan::ObjectWrap::Unwrap<Gradient>(obj);
      context->state->strokeGradient = grad->pattern();
    } else if (Nan::New(Pattern::constructor)->HasInstance(obj)) {
      context->_strokeStyle.Reset(value);
      Pattern *pattern = Nan::ObjectWrap::Unwrap<Pattern>(obj);
      context->state->strokePattern = pattern->pattern();
    }
  }
}

/*
 * Get miter limit.
 */

NAN_GETTER(Context2d::GetMiterLimit) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(cairo_get_miter_limit(context->context())));
}

/*
 * Set miter limit.
 */

NAN_SETTER(Context2d::SetMiterLimit) {
  double n = Nan::To<double>(value).FromMaybe(0);
  if (n > 0) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_miter_limit(context->context(), n);
  }
}

/*
 * Get line width.
 */

NAN_GETTER(Context2d::GetLineWidth) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  info.GetReturnValue().Set(Nan::New<Number>(cairo_get_line_width(context->context())));
}

/*
 * Set line width.
 */

NAN_SETTER(Context2d::SetLineWidth) {
  double n = Nan::To<double>(value).FromMaybe(0);
  if (n > 0 && n != std::numeric_limits<double>::infinity()) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_set_line_width(context->context(), n);
  }
}

/*
 * Get line join.
 */

NAN_GETTER(Context2d::GetLineJoin) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *join;
  switch (cairo_get_line_join(context->context())) {
    case CAIRO_LINE_JOIN_BEVEL: join = "bevel"; break;
    case CAIRO_LINE_JOIN_ROUND: join = "round"; break;
    default: join = "miter";
  }
  info.GetReturnValue().Set(Nan::New(join).ToLocalChecked());
}

/*
 * Set line join.
 */

NAN_SETTER(Context2d::SetLineJoin) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  Nan::Utf8String type(Nan::To<String>(value).ToLocalChecked());
  if (0 == strcmp("round", *type)) {
    cairo_set_line_join(ctx, CAIRO_LINE_JOIN_ROUND);
  } else if (0 == strcmp("bevel", *type)) {
    cairo_set_line_join(ctx, CAIRO_LINE_JOIN_BEVEL);
  } else {
    cairo_set_line_join(ctx, CAIRO_LINE_JOIN_MITER);
  }
}

/*
 * Get line cap.
 */

NAN_GETTER(Context2d::GetLineCap) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  const char *cap;
  switch (cairo_get_line_cap(context->context())) {
    case CAIRO_LINE_CAP_ROUND: cap = "round"; break;
    case CAIRO_LINE_CAP_SQUARE: cap = "square"; break;
    default: cap = "butt";
  }
  info.GetReturnValue().Set(Nan::New(cap).ToLocalChecked());
}

/*
 * Set line cap.
 */

NAN_SETTER(Context2d::SetLineCap) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  Nan::Utf8String type(Nan::To<String>(value).ToLocalChecked());
  if (0 == strcmp("round", *type)) {
    cairo_set_line_cap(ctx, CAIRO_LINE_CAP_ROUND);
  } else if (0 == strcmp("square", *type)) {
    cairo_set_line_cap(ctx, CAIRO_LINE_CAP_SQUARE);
  } else {
    cairo_set_line_cap(ctx, CAIRO_LINE_CAP_BUTT);
  }
}

/*
 * Check if the given point is within the current path.
 */

NAN_METHOD(Context2d::IsPointInPath) {
  if (info[0]->IsNumber() && info[1]->IsNumber()) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    cairo_t *ctx = context->context();
    double x = Nan::To<double>(info[0]).FromMaybe(0)
         , y = Nan::To<double>(info[1]).FromMaybe(0);
    context->setFillRule(info[2]);
    info.GetReturnValue().Set(Nan::New<Boolean>(cairo_in_fill(ctx, x, y) || cairo_in_stroke(ctx, x, y)));
    return;
  }
  info.GetReturnValue().Set(Nan::False());
}

/*
 * Set shadow color.
 */

NAN_SETTER(Context2d::SetShadowColor) {
  short ok;
  Nan::Utf8String str(Nan::To<String>(value).ToLocalChecked());
  uint32_t rgba = rgba_from_string(*str, &ok);
  if (ok) {
    Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
    context->state->shadow = rgba_create(rgba);
  }
}

/*
 * Get shadow color.
 */

NAN_GETTER(Context2d::GetShadowColor) {
  char buf[64];
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  rgba_to_string(context->state->shadow, buf, sizeof(buf));
  info.GetReturnValue().Set(Nan::New<String>(buf).ToLocalChecked());
}

/*
 * Set fill color, used internally for fillStyle=
 */

void Context2d::_setFillColor(Local<Value> arg) {
  short ok;
  Nan::Utf8String str(arg);
  uint32_t rgba = rgba_from_string(*str, &ok);
  if (!ok) return;
  state->fillPattern = state->fillGradient = NULL;
  state->fill = rgba_create(rgba);
}

/*
 * Get fill color.
 */

Local<Value> Context2d::_getFillColor() {
  char buf[64];
  rgba_to_string(state->fill, buf, sizeof(buf));
  return Nan::New<String>(buf).ToLocalChecked();
}

/*
 * Set stroke color, used internally for strokeStyle=
 */

void Context2d::_setStrokeColor(Local<Value> arg) {
  short ok;
  Nan::Utf8String str(arg);
  uint32_t rgba = rgba_from_string(*str, &ok);
  if (!ok) return;
  state->strokePattern = state->strokeGradient = NULL;
  state->stroke = rgba_create(rgba);
}

/*
 * Get stroke color.
 */

Local<Value> Context2d::_getStrokeColor() {
  char buf[64];
  rgba_to_string(state->stroke, buf, sizeof(buf));
  return Nan::New<String>(buf).ToLocalChecked();
}

NAN_METHOD(Context2d::CreatePattern) {
  Local<Value> image = info[0];
  Local<Value> repetition = info[1];

  if (!Nan::To<bool>(repetition).FromMaybe(false))
    repetition = Nan::New("repeat").ToLocalChecked();

  const int argc = 2;
  Local<Value> argv[argc] = { image, repetition };

  Local<Function> ctor = Nan::GetFunction(Nan::New(Pattern::constructor)).ToLocalChecked();
  Local<Object> instance = Nan::NewInstance(ctor, argc, argv).ToLocalChecked();

  info.GetReturnValue().Set(instance);
}

NAN_METHOD(Context2d::CreateLinearGradient) {
  const int argc = 4;
  Local<Value> argv[argc] = { info[0], info[1], info[2], info[3] };

  Local<Function> ctor = Nan::GetFunction(Nan::New(Gradient::constructor)).ToLocalChecked();
  Local<Object> instance = Nan::NewInstance(ctor, argc, argv).ToLocalChecked();

  info.GetReturnValue().Set(instance);
}

NAN_METHOD(Context2d::CreateRadialGradient) {
  const int argc = 6;
  Local<Value> argv[argc] = { info[0], info[1], info[2], info[3], info[4], info[5] };

  Local<Function> ctor = Nan::GetFunction(Nan::New(Gradient::constructor)).ToLocalChecked();
  Local<Object> instance = Nan::NewInstance(ctor, argc, argv).ToLocalChecked();

  info.GetReturnValue().Set(instance);
}

/*
 * Bezier curve.
 */

NAN_METHOD(Context2d::BezierCurveTo) {
  double args[6];
  if(!checkArgs(info, args, 6))
    return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_curve_to(context->context()
    , args[0]
    , args[1]
    , args[2]
    , args[3]
    , args[4]
    , args[5]);
}

/*
 * Quadratic curve approximation from libsvg-cairo.
 */

NAN_METHOD(Context2d::QuadraticCurveTo) {
  double args[4];
  if(!checkArgs(info, args, 4))
    return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  double x, y
    , x1 = args[0]
    , y1 = args[1]
    , x2 = args[2]
    , y2 = args[3];

  cairo_get_current_point(ctx, &x, &y);

  if (0 == x && 0 == y) {
    x = x1;
    y = y1;
  }

  cairo_curve_to(ctx
    , x  + 2.0 / 3.0 * (x1 - x),  y  + 2.0 / 3.0 * (y1 - y)
    , x2 + 2.0 / 3.0 * (x1 - x2), y2 + 2.0 / 3.0 * (y1 - y2)
    , x2
    , y2);
}

/*
 * Save state.
 */

NAN_METHOD(Context2d::Save) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->save();
}

/*
 * Restore state.
 */

NAN_METHOD(Context2d::Restore) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->restore();
}

/*
 * Creates a new subpath.
 */

NAN_METHOD(Context2d::BeginPath) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_new_path(context->context());
}

/*
 * Marks the subpath as closed.
 */

NAN_METHOD(Context2d::ClosePath) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_close_path(context->context());
}

/*
 * Rotate transformation.
 */

NAN_METHOD(Context2d::Rotate) {
  double args[1];
  if(!checkArgs(info, args, 1))
    return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_rotate(context->context(), args[0]);
}

/*
 * Modify the CTM.
 */

NAN_METHOD(Context2d::Transform) {
  double args[6];
  if(!checkArgs(info, args, 6))
    return;

  cairo_matrix_t matrix;
  cairo_matrix_init(&matrix
    , args[0]
    , args[1]
    , args[2]
    , args[3]
    , args[4]
    , args[5]);

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_transform(context->context(), &matrix);
}

/*
 * Get the CTM
 */

NAN_METHOD(Context2d::GetTransform) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Local<Object> instance = get_current_transform(context);

  info.GetReturnValue().Set(instance);
}

/*
 * Reset the CTM, used internally by setTransform().
 */

NAN_METHOD(Context2d::ResetTransform) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_identity_matrix(context->context());
}

/*
 * Reset transform matrix to identity, then apply the given args.
 */

NAN_METHOD(Context2d::SetTransform) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  if (info.Length() == 1) {
    Local<Object> mat = Nan::To<Object>(info[0]).ToLocalChecked();

    #if NODE_MAJOR_VERSION >= 8
      Local<Context> ctx = Nan::GetCurrentContext();
      if (!mat->InstanceOf(ctx, _DOMMatrix.Get(Isolate::GetCurrent())).ToChecked()) {
        return Nan::ThrowTypeError("Expected DOMMatrix");
      }
    #endif

    cairo_matrix_t matrix;
    parse_matrix_from_object(matrix, mat);

    cairo_set_matrix(context->context(), &matrix);
  } else {
    cairo_identity_matrix(context->context());
    Context2d::Transform(info);
  }
}

/*
 * Translate transformation.
 */

NAN_METHOD(Context2d::Translate) {
  double args[2];
  if(!checkArgs(info, args, 2))
    return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_translate(context->context(), args[0], args[1]);
}

/*
 * Scale transformation.
 */

NAN_METHOD(Context2d::Scale) {
  double args[2];
  if(!checkArgs(info, args, 2))
    return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_scale(context->context(), args[0], args[1]);
}

/*
 * Use path as clipping region.
 */

NAN_METHOD(Context2d::Clip) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->setFillRule(info[0]);
  cairo_t *ctx = context->context();
  cairo_clip_preserve(ctx);
}

/*
 * Fill the path.
 */

NAN_METHOD(Context2d::Fill) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->setFillRule(info[0]);
  context->fill(true);
}

/*
 * Stroke the path.
 */

NAN_METHOD(Context2d::Stroke) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->stroke(true);
}

/*
 * Helper for fillText/strokeText
 */

double
get_text_scale(PangoLayout *layout, double maxWidth) {

  PangoRectangle logical_rect;
  pango_layout_get_pixel_extents(layout, NULL, &logical_rect);

  if (logical_rect.width > maxWidth) {
    return maxWidth / logical_rect.width;
  } else {
    return 1.0;
  }
}

void
paintText(const Nan::FunctionCallbackInfo<Value> &info, bool stroke) {
  int argsNum = info.Length() >= 4 ? 3 : 2;

  if (argsNum == 3 && info[3]->IsUndefined())
    argsNum = 2;

  double args[3];
  if(!checkArgs(info, args, argsNum, 1))
    return;

  Nan::Utf8String str(Nan::To<String>(info[0]).ToLocalChecked());
  double x = args[0];
  double y = args[1];
  double scaled_by = 1;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  PangoLayout *layout = context->layout();

  pango_layout_set_text(layout, *str, -1);
  pango_cairo_update_layout(context->context(), layout);

  if (argsNum == 3) {
    scaled_by = get_text_scale(layout, args[2]);
    cairo_save(context->context());
    cairo_scale(context->context(), scaled_by, 1);
  }

  context->savePath();
  if (context->state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    if (stroke == true) { context->stroke(); } else { context->fill(); }
    context->setTextPath(x / scaled_by, y);
  } else if (context->state->textDrawingMode == TEXT_DRAW_PATHS) {
    context->setTextPath(x / scaled_by, y);
    if (stroke == true) { context->stroke(); } else { context->fill(); }
  }
  context->restorePath();
  if (argsNum == 3) {
    cairo_restore(context->context());
  }
}

/*
 * Fill text at (x, y).
 */

NAN_METHOD(Context2d::FillText) {
  paintText(info, false);
}

/*
 * Stroke text at (x ,y).
 */

NAN_METHOD(Context2d::StrokeText) {
  paintText(info, true);
}

/*
 * Gets the baseline adjustment in device pixels
 */
inline double getBaselineAdjustment(PangoLayout* layout, short baseline) {
  PangoRectangle logical_rect;
  pango_layout_line_get_extents(pango_layout_get_line(layout, 0), NULL, &logical_rect);

  double scale = 1.0 / PANGO_SCALE;
  double ascent = scale * pango_layout_get_baseline(layout);
  double descent = scale * logical_rect.height - ascent;

  switch (baseline) {
  case TEXT_BASELINE_ALPHABETIC:
    return ascent;
  case TEXT_BASELINE_MIDDLE:
    return (ascent + descent) / 2.0;
  case TEXT_BASELINE_BOTTOM:
    return ascent + descent;
  default:
    return 0;
  }
}

/*
 * Set text path for the string in the layout at (x, y).
 * This function is called by paintText and won't behave correctly
 * if is not called from there.
 * it needs pango_layout_set_text and pango_cairo_update_layout to be called before
 */

void
Context2d::setTextPath(double x, double y) {
  PangoRectangle logical_rect;

  switch (state->textAlignment) {
    // center
    case 0:
      pango_layout_get_pixel_extents(_layout, NULL, &logical_rect);
      x -= logical_rect.width / 2;
      break;
    // right
    case 1:
      pango_layout_get_pixel_extents(_layout, NULL, &logical_rect);
      x -= logical_rect.width;
      break;
  }

  y -= getBaselineAdjustment(_layout, state->textBaseline);

  cairo_move_to(_context, x, y);
  if (state->textDrawingMode == TEXT_DRAW_PATHS) {
    pango_cairo_layout_path(_context, _layout);
  } else if (state->textDrawingMode == TEXT_DRAW_GLYPHS) {
    pango_cairo_show_layout(_context, _layout);
  }
}

/*
 * Adds a point to the current subpath.
 */

NAN_METHOD(Context2d::LineTo) {
  double args[2];
  if(!checkArgs(info, args, 2))
    return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_line_to(context->context(), args[0], args[1]);
}

/*
 * Creates a new subpath at the given point.
 */

NAN_METHOD(Context2d::MoveTo) {
  double args[2];
  if(!checkArgs(info, args, 2))
    return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_move_to(context->context(), args[0], args[1]);
}

/*
 * Get font.
 */

NAN_GETTER(Context2d::GetFont) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Isolate *iso = Isolate::GetCurrent();
  Local<Value> font;

  if (context->_font.IsEmpty())
    font = Nan::New("10px sans-serif").ToLocalChecked();
  else
    font = context->_font.Get(iso);

  info.GetReturnValue().Set(font);
}

/*
 * Set font:
 *   - weight
 *   - style
 *   - size
 *   - unit
 *   - family
 */

NAN_SETTER(Context2d::SetFont) {
  if (!value->IsString()) return;

  Isolate *iso = Isolate::GetCurrent();
  Local<Context> ctx = Nan::GetCurrentContext();

  Local<String> str = Nan::To<String>(value).ToLocalChecked();
  if (!str->Length()) return;

  const int argc = 1;
  Local<Value> argv[argc] = { value };

  Local<Value> mparsed = Nan::Call(_parseFont.Get(iso), ctx->Global(), argc, argv).ToLocalChecked();
  // parseFont returns undefined for invalid CSS font strings
  if (mparsed->IsUndefined()) return;
  Local<Object> font = Nan::To<Object>(mparsed).ToLocalChecked();

  Nan::Utf8String weight(Nan::Get(font, Nan::New("weight").ToLocalChecked()).ToLocalChecked());
  Nan::Utf8String style(Nan::Get(font, Nan::New("style").ToLocalChecked()).ToLocalChecked());
  double size = Nan::To<double>(Nan::Get(font, Nan::New("size").ToLocalChecked()).ToLocalChecked()).FromMaybe(0);
  Nan::Utf8String unit(Nan::Get(font, Nan::New("unit").ToLocalChecked()).ToLocalChecked());
  Nan::Utf8String family(Nan::Get(font, Nan::New("family").ToLocalChecked()).ToLocalChecked());

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());

  PangoFontDescription *desc = pango_font_description_copy(context->state->fontDescription);
  pango_font_description_free(context->state->fontDescription);

  pango_font_description_set_style(desc, Canvas::GetStyleFromCSSString(*style));
  pango_font_description_set_weight(desc, Canvas::GetWeightFromCSSString(*weight));

  if (strlen(*family) > 0) {
    // See #1643 - Pango understands "sans" whereas CSS uses "sans-serif"
    std::string s1(*family);
    std::string s2("sans-serif");
    if (streq_casein(s1, s2)) {
      pango_font_description_set_family(desc, "sans");
    } else {
      pango_font_description_set_family(desc, *family);
    }
  }

  PangoFontDescription *sys_desc = Canvas::ResolveFontDescription(desc);
  pango_font_description_free(desc);

  if (size > 0) pango_font_description_set_absolute_size(sys_desc, size * PANGO_SCALE);

  context->state->fontDescription = sys_desc;
  pango_layout_set_font_description(context->_layout, sys_desc);

  context->_font.Reset(value);
}

/*
 * Get text baseline.
 */

NAN_GETTER(Context2d::GetTextBaseline) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Isolate *iso = Isolate::GetCurrent();
  Local<Value> font;

  if (context->_textBaseline.IsEmpty())
    font = Nan::New("alphabetic").ToLocalChecked();
  else
    font = context->_textBaseline.Get(iso);

  info.GetReturnValue().Set(font);
}

/*
 * Set text baseline.
 */

NAN_SETTER(Context2d::SetTextBaseline) {
  if (!value->IsString()) return;

  Nan::Utf8String opStr(Nan::To<String>(value).ToLocalChecked());
  const std::map<std::string, int32_t> modes = {
    {"alphabetic", 0},
    {"top", 1},
    {"bottom", 2},
    {"middle", 3},
    {"ideographic", 4},
    {"hanging", 5}
  };
  auto op = modes.find(*opStr);
  if (op == modes.end()) return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->textBaseline = op->second;
  context->_textBaseline.Reset(value);
}

/*
 * Get text align.
 */

NAN_GETTER(Context2d::GetTextAlign) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  Isolate *iso = Isolate::GetCurrent();
  Local<Value> font;

  if (context->_textAlign.IsEmpty())
    font = Nan::New("start").ToLocalChecked();
  else
    font = context->_textAlign.Get(iso);

  info.GetReturnValue().Set(font);
}

/*
 * Set text align.
 */

NAN_SETTER(Context2d::SetTextAlign) {
  if (!value->IsString()) return;

  Nan::Utf8String opStr(Nan::To<String>(value).ToLocalChecked());
  const std::map<std::string, int32_t> modes = {
    {"center", 0},
    {"left", -1},
    {"start", -1},
    {"right", 1},
    {"end", 1}
  };
  auto op = modes.find(*opStr);
  if (op == modes.end()) return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  context->state->textAlignment = op->second;
  context->_textAlign.Reset(value);
}

/*
 * Return the given text extents.
 * TODO: Support for:
 * hangingBaseline, ideographicBaseline,
 * fontBoundingBoxAscent, fontBoundingBoxDescent
 */

NAN_METHOD(Context2d::MeasureText) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  Nan::Utf8String str(Nan::To<String>(info[0]).ToLocalChecked());
  Local<Object> obj = Nan::New<Object>();

  PangoRectangle _ink_rect, _logical_rect;
  float_rectangle ink_rect, logical_rect;
  PangoFontMetrics *metrics;
  PangoLayout *layout = context->layout();

  pango_layout_set_text(layout, *str, -1);
  pango_cairo_update_layout(ctx, layout);

  // Normally you could use pango_layout_get_pixel_extents and be done, or use
  // pango_extents_to_pixels, but both of those round the pixels, so we have to
  // divide by PANGO_SCALE manually
  pango_layout_get_extents(layout, &_ink_rect, &_logical_rect);

  float inverse_pango_scale = 1. / PANGO_SCALE;

  logical_rect.x = _logical_rect.x * inverse_pango_scale;
  logical_rect.y = _logical_rect.y * inverse_pango_scale;
  logical_rect.width = _logical_rect.width * inverse_pango_scale;
  logical_rect.height = _logical_rect.height * inverse_pango_scale;

  ink_rect.x = _ink_rect.x * inverse_pango_scale;
  ink_rect.y = _ink_rect.y * inverse_pango_scale;
  ink_rect.width = _ink_rect.width * inverse_pango_scale;
  ink_rect.height = _ink_rect.height * inverse_pango_scale;

  metrics = PANGO_LAYOUT_GET_METRICS(layout);

  double x_offset;
  switch (context->state->textAlignment) {
    case 0: // center
      x_offset = logical_rect.width / 2;
      break;
    case 1: // right
      x_offset = logical_rect.width;
      break;
    default: // left
      x_offset = 0.0;
  }

  cairo_matrix_t matrix;
  cairo_get_matrix(ctx, &matrix);
  double y_offset = getBaselineAdjustment(layout, context->state->textBaseline);

  Nan::Set(obj,
           Nan::New<String>("width").ToLocalChecked(),
           Nan::New<Number>(logical_rect.width)).Check();
  Nan::Set(obj,
           Nan::New<String>("actualBoundingBoxLeft").ToLocalChecked(),
           Nan::New<Number>(x_offset - PANGO_LBEARING(ink_rect))).Check();
  Nan::Set(obj,
           Nan::New<String>("actualBoundingBoxRight").ToLocalChecked(),
           Nan::New<Number>(x_offset + PANGO_RBEARING(ink_rect))).Check();
  Nan::Set(obj,
           Nan::New<String>("actualBoundingBoxAscent").ToLocalChecked(),
           Nan::New<Number>(y_offset + PANGO_ASCENT(ink_rect))).Check();
  Nan::Set(obj,
           Nan::New<String>("actualBoundingBoxDescent").ToLocalChecked(),
           Nan::New<Number>(PANGO_DESCENT(ink_rect) - y_offset)).Check();
  Nan::Set(obj,
           Nan::New<String>("emHeightAscent").ToLocalChecked(),
           Nan::New<Number>(-(PANGO_ASCENT(logical_rect) - y_offset))).Check();
  Nan::Set(obj,
           Nan::New<String>("emHeightDescent").ToLocalChecked(),
           Nan::New<Number>(PANGO_DESCENT(logical_rect) - y_offset)).Check();
  Nan::Set(obj,
           Nan::New<String>("alphabeticBaseline").ToLocalChecked(),
           Nan::New<Number>(-(pango_font_metrics_get_ascent(metrics) * inverse_pango_scale - y_offset))).Check();

  pango_font_metrics_unref(metrics);

  info.GetReturnValue().Set(obj);
}

/*
 * Set line dash
 * ref: http://www.w3.org/TR/2dcontext/#dom-context-2d-setlinedash
 */

NAN_METHOD(Context2d::SetLineDash) {
  if (!info[0]->IsArray()) return;
  Local<Array> dash = Local<Array>::Cast(info[0]);
  uint32_t dashes = dash->Length() & 1 ? dash->Length() * 2 : dash->Length();
  uint32_t zero_dashes = 0;
  std::vector<double> a(dashes);
  for (uint32_t i=0; i<dashes; i++) {
    Local<Value> d = Nan::Get(dash, i % dash->Length()).ToLocalChecked();
    if (!d->IsNumber()) return;
    a[i] = Nan::To<double>(d).FromMaybe(0);
    if (a[i] == 0) zero_dashes++;
    if (a[i] < 0 || !std::isfinite(a[i])) return;
  }

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  double offset;
  cairo_get_dash(ctx, NULL, &offset);
  if (zero_dashes == dashes) {
    std::vector<double> b(0);
    cairo_set_dash(ctx, b.data(), 0, offset);
  } else {
    cairo_set_dash(ctx, a.data(), dashes, offset);
  }
}

/*
 * Get line dash
 * ref: http://www.w3.org/TR/2dcontext/#dom-context-2d-setlinedash
 */
NAN_METHOD(Context2d::GetLineDash) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  int dashes = cairo_get_dash_count(ctx);
  std::vector<double> a(dashes);
  cairo_get_dash(ctx, a.data(), NULL);

  Local<Array> dash = Nan::New<Array>(dashes);
  for (int i=0; i<dashes; i++) {
    Nan::Set(dash, Nan::New<Number>(i), Nan::New<Number>(a[i])).Check();
  }

  info.GetReturnValue().Set(dash);
}

/*
 * Set line dash offset
 * ref: http://www.w3.org/TR/2dcontext/#dom-context-2d-setlinedash
 */
NAN_SETTER(Context2d::SetLineDashOffset) {
  double offset = Nan::To<double>(value).FromMaybe(0);
  if (!std::isfinite(offset)) return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  int dashes = cairo_get_dash_count(ctx);
  std::vector<double> a(dashes);
  cairo_get_dash(ctx, a.data(), NULL);
  cairo_set_dash(ctx, a.data(), dashes, offset);
}

/*
 * Get line dash offset
 * ref: http://www.w3.org/TR/2dcontext/#dom-context-2d-setlinedash
 */
NAN_GETTER(Context2d::GetLineDashOffset) {
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  double offset;
  cairo_get_dash(ctx, NULL, &offset);

  info.GetReturnValue().Set(Nan::New<Number>(offset));
}

/*
 * Fill the rectangle defined by x, y, width and height.
 */

NAN_METHOD(Context2d::FillRect) {
  RECT_ARGS;
  if (0 == width || 0 == height) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  context->fill();
  context->restorePath();
}

/*
 * Stroke the rectangle defined by x, y, width and height.
 */

NAN_METHOD(Context2d::StrokeRect) {
  RECT_ARGS;
  if (0 == width && 0 == height) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  context->stroke();
  context->restorePath();
}

/*
 * Clears all pixels defined by x, y, width and height.
 */

NAN_METHOD(Context2d::ClearRect) {
  RECT_ARGS;
  if (0 == width || 0 == height) return;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  cairo_save(ctx);
  context->savePath();
  cairo_rectangle(ctx, x, y, width, height);
  cairo_set_operator(ctx, CAIRO_OPERATOR_CLEAR);
  cairo_fill(ctx);
  context->restorePath();
  cairo_restore(ctx);
}

/*
 * Adds a rectangle subpath.
 */

NAN_METHOD(Context2d::Rect) {
  RECT_ARGS;
  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();
  if (width == 0) {
    cairo_move_to(ctx, x, y);
    cairo_line_to(ctx, x, y + height);
  } else if (height == 0) {
    cairo_move_to(ctx, x, y);
    cairo_line_to(ctx, x + width, y);
  } else {
    cairo_rectangle(ctx, x, y, width, height);
  }
}

/*
 * Adds an arc at x, y with the given radis and start/end angles.
 */

NAN_METHOD(Context2d::Arc) {
  if (!info[0]->IsNumber()
    || !info[1]->IsNumber()
    || !info[2]->IsNumber()
    || !info[3]->IsNumber()
    || !info[4]->IsNumber()) return;

  bool anticlockwise = Nan::To<bool>(info[5]).FromMaybe(false);

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  if (anticlockwise && M_PI * 2 != Nan::To<double>(info[4]).FromMaybe(0)) {
    cairo_arc_negative(ctx
      , Nan::To<double>(info[0]).FromMaybe(0)
      , Nan::To<double>(info[1]).FromMaybe(0)
      , Nan::To<double>(info[2]).FromMaybe(0)
      , Nan::To<double>(info[3]).FromMaybe(0)
      , Nan::To<double>(info[4]).FromMaybe(0));
  } else {
    cairo_arc(ctx
      , Nan::To<double>(info[0]).FromMaybe(0)
      , Nan::To<double>(info[1]).FromMaybe(0)
      , Nan::To<double>(info[2]).FromMaybe(0)
      , Nan::To<double>(info[3]).FromMaybe(0)
      , Nan::To<double>(info[4]).FromMaybe(0));
  }
}

/*
 * Adds an arcTo point (x0,y0) to (x1,y1) with the given radius.
 *
 * Implementation influenced by WebKit.
 */

NAN_METHOD(Context2d::ArcTo) {
  double args[5];
  if(!checkArgs(info, args, 5))
    return;

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  // Current path point
  double x, y;
  cairo_get_current_point(ctx, &x, &y);
  Point<float> p0(x, y);

  // Point (x0,y0)
  Point<float> p1(args[0], args[1]);

  // Point (x1,y1)
  Point<float> p2(args[2], args[3]);

  float radius = args[4];

  if ((p1.x == p0.x && p1.y == p0.y)
    || (p1.x == p2.x && p1.y == p2.y)
    || radius == 0.f) {
    cairo_line_to(ctx, p1.x, p1.y);
    return;
  }

  Point<float> p1p0((p0.x - p1.x),(p0.y - p1.y));
  Point<float> p1p2((p2.x - p1.x),(p2.y - p1.y));
  float p1p0_length = sqrtf(p1p0.x * p1p0.x + p1p0.y * p1p0.y);
  float p1p2_length = sqrtf(p1p2.x * p1p2.x + p1p2.y * p1p2.y);

  double cos_phi = (p1p0.x * p1p2.x + p1p0.y * p1p2.y) / (p1p0_length * p1p2_length);
  // all points on a line logic
  if (-1 == cos_phi) {
    cairo_line_to(ctx, p1.x, p1.y);
    return;
  }

  if (1 == cos_phi) {
    // add infinite far away point
    unsigned int max_length = 65535;
    double factor_max = max_length / p1p0_length;
    Point<float> ep((p0.x + factor_max * p1p0.x), (p0.y + factor_max * p1p0.y));
    cairo_line_to(ctx, ep.x, ep.y);
    return;
  }

  float tangent = radius / tan(acos(cos_phi) / 2);
  float factor_p1p0 = tangent / p1p0_length;
  Point<float> t_p1p0((p1.x + factor_p1p0 * p1p0.x), (p1.y + factor_p1p0 * p1p0.y));

  Point<float> orth_p1p0(p1p0.y, -p1p0.x);
  float orth_p1p0_length = sqrt(orth_p1p0.x * orth_p1p0.x + orth_p1p0.y * orth_p1p0.y);
  float factor_ra = radius / orth_p1p0_length;

  double cos_alpha = (orth_p1p0.x * p1p2.x + orth_p1p0.y * p1p2.y) / (orth_p1p0_length * p1p2_length);
  if (cos_alpha < 0.f)
      orth_p1p0 = Point<float>(-orth_p1p0.x, -orth_p1p0.y);

  Point<float> p((t_p1p0.x + factor_ra * orth_p1p0.x), (t_p1p0.y + factor_ra * orth_p1p0.y));

  orth_p1p0 = Point<float>(-orth_p1p0.x, -orth_p1p0.y);
  float sa = acos(orth_p1p0.x / orth_p1p0_length);
  if (orth_p1p0.y < 0.f)
      sa = 2 * M_PI - sa;

  bool anticlockwise = false;

  float factor_p1p2 = tangent / p1p2_length;
  Point<float> t_p1p2((p1.x + factor_p1p2 * p1p2.x), (p1.y + factor_p1p2 * p1p2.y));
  Point<float> orth_p1p2((t_p1p2.x - p.x),(t_p1p2.y - p.y));
  float orth_p1p2_length = sqrtf(orth_p1p2.x * orth_p1p2.x + orth_p1p2.y * orth_p1p2.y);
  float ea = acos(orth_p1p2.x / orth_p1p2_length);

  if (orth_p1p2.y < 0) ea = 2 * M_PI - ea;
  if ((sa > ea) && ((sa - ea) < M_PI)) anticlockwise = true;
  if ((sa < ea) && ((ea - sa) > M_PI)) anticlockwise = true;

  cairo_line_to(ctx, t_p1p0.x, t_p1p0.y);

  if (anticlockwise && M_PI * 2 != radius) {
    cairo_arc_negative(ctx
      , p.x
      , p.y
      , radius
      , sa
      , ea);
  } else {
    cairo_arc(ctx
      , p.x
      , p.y
      , radius
      , sa
      , ea);
  }
}

/*
 * Adds an ellipse to the path which is centered at (x, y) position with the
 * radii radiusX and radiusY starting at startAngle and ending at endAngle
 * going in the given direction by anticlockwise (defaulting to clockwise).
 */

NAN_METHOD(Context2d::Ellipse) {
  double args[7];
  if(!checkArgs(info, args, 7))
    return;

  double radiusX = args[2];
  double radiusY = args[3];

  if (radiusX == 0 || radiusY == 0) return;

  double x = args[0];
  double y = args[1];
  double rotation = args[4];
  double startAngle = args[5];
  double endAngle = args[6];
  bool anticlockwise = Nan::To<bool>(info[7]).FromMaybe(false);

  Context2d *context = Nan::ObjectWrap::Unwrap<Context2d>(info.This());
  cairo_t *ctx = context->context();

  // See https://www.cairographics.org/cookbook/ellipses/
  double xRatio = radiusX / radiusY;

  cairo_matrix_t save_matrix;
  cairo_get_matrix(ctx, &save_matrix);
  cairo_translate(ctx, x, y);
  cairo_rotate(ctx, rotation);
  cairo_scale(ctx, xRatio, 1.0);
  cairo_translate(ctx, -x, -y);
  if (anticlockwise && M_PI * 2 != args[4]) {
    cairo_arc_negative(ctx,
      x,
      y,
      radiusY,
      startAngle,
      endAngle);
  } else {
    cairo_arc(ctx,
      x,
      y,
      radiusY,
      startAngle,
      endAngle);
  }
  cairo_set_matrix(ctx, &save_matrix);
}
