// Copyright (c) 2010 LearnBoost <tj@learnboost.com>

#pragma once

#include "cairo.h"
#include "Canvas.h"
#include "color.h"
#include "nan.h"
#include <pango/pangocairo.h>

typedef enum {
  TEXT_DRAW_PATHS,
  TEXT_DRAW_GLYPHS
} canvas_draw_mode_t;

/*
 * State struct.
 *
 * Used in conjunction with Save() / Restore() since
 * cairo's gstate maintains only a single source pattern at a time.
 */

typedef struct {
  rgba_t fill;
  rgba_t stroke;
  cairo_filter_t patternQuality;
  cairo_pattern_t *fillPattern;
  cairo_pattern_t *strokePattern;
  cairo_pattern_t *fillGradient;
  cairo_pattern_t *strokeGradient;
  float globalAlpha;
  short textAlignment;
  short textBaseline;
  rgba_t shadow;
  int shadowBlur;
  double shadowOffsetX;
  double shadowOffsetY;
  canvas_draw_mode_t textDrawingMode;
  PangoFontDescription *fontDescription;
  bool imageSmoothingEnabled;
} canvas_state_t;

/*
 * Equivalent to a PangoRectangle but holds floats instead of ints
 * (software pixels are stored here instead of pango units)
 *
 * Should be compatible with PANGO_ASCENT, PANGO_LBEARING, etc.
 */

typedef struct {
  float x;
  float y;
  float width;
  float height;
} float_rectangle;

void state_assign_fontFamily(canvas_state_t *state, const char *str);

class Context2d: public Nan::ObjectWrap {
  public:
    short stateno;
    canvas_state_t *states[CANVAS_MAX_STATES];
    canvas_state_t *state;
    Context2d(Canvas *canvas);
    static Nan::Persistent<v8::Function> _DOMMatrix;
    static Nan::Persistent<v8::Function> _parseFont;
    static Nan::Persistent<v8::FunctionTemplate> constructor;
    static void Initialize(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target);
    static NAN_METHOD(New);
    static NAN_METHOD(SaveExternalModules);
    static NAN_METHOD(DrawImage);
    static NAN_METHOD(PutImageData);
    static NAN_METHOD(Save);
    static NAN_METHOD(Restore);
    static NAN_METHOD(Rotate);
    static NAN_METHOD(Translate);
    static NAN_METHOD(Scale);
    static NAN_METHOD(Transform);
    static NAN_METHOD(GetTransform);
    static NAN_METHOD(ResetTransform);
    static NAN_METHOD(SetTransform);
    static NAN_METHOD(IsPointInPath);
    static NAN_METHOD(BeginPath);
    static NAN_METHOD(ClosePath);
    static NAN_METHOD(AddPage);
    static NAN_METHOD(Clip);
    static NAN_METHOD(Fill);
    static NAN_METHOD(Stroke);
    static NAN_METHOD(FillText);
    static NAN_METHOD(StrokeText);
    static NAN_METHOD(SetFont);
    static NAN_METHOD(SetFillColor);
    static NAN_METHOD(SetStrokeColor);
    static NAN_METHOD(SetStrokePattern);
    static NAN_METHOD(SetTextAlignment);
    static NAN_METHOD(SetLineDash);
    static NAN_METHOD(GetLineDash);
    static NAN_METHOD(MeasureText);
    static NAN_METHOD(BezierCurveTo);
    static NAN_METHOD(QuadraticCurveTo);
    static NAN_METHOD(LineTo);
    static NAN_METHOD(MoveTo);
    static NAN_METHOD(FillRect);
    static NAN_METHOD(StrokeRect);
    static NAN_METHOD(ClearRect);
    static NAN_METHOD(Rect);
    static NAN_METHOD(Arc);
    static NAN_METHOD(ArcTo);
    static NAN_METHOD(Ellipse);
    static NAN_METHOD(GetImageData);
    static NAN_METHOD(CreateImageData);
    static NAN_METHOD(GetStrokeColor);
    static NAN_METHOD(CreatePattern);
    static NAN_METHOD(CreateLinearGradient);
    static NAN_METHOD(CreateRadialGradient);
    static NAN_GETTER(GetFormat);
    static NAN_GETTER(GetPatternQuality);
    static NAN_GETTER(GetImageSmoothingEnabled);
    static NAN_GETTER(GetGlobalCompositeOperation);
    static NAN_GETTER(GetGlobalAlpha);
    static NAN_GETTER(GetShadowColor);
    static NAN_GETTER(GetMiterLimit);
    static NAN_GETTER(GetLineCap);
    static NAN_GETTER(GetLineJoin);
    static NAN_GETTER(GetLineWidth);
    static NAN_GETTER(GetLineDashOffset);
    static NAN_GETTER(GetShadowOffsetX);
    static NAN_GETTER(GetShadowOffsetY);
    static NAN_GETTER(GetShadowBlur);
    static NAN_GETTER(GetAntiAlias);
    static NAN_GETTER(GetTextDrawingMode);
    static NAN_GETTER(GetQuality);
    static NAN_GETTER(GetCurrentTransform);
    static NAN_GETTER(GetFillStyle);
    static NAN_GETTER(GetStrokeStyle);
    static NAN_GETTER(GetFont);
    static NAN_GETTER(GetTextBaseline);
    static NAN_GETTER(GetTextAlign);
    static NAN_SETTER(SetPatternQuality);
    static NAN_SETTER(SetImageSmoothingEnabled);
    static NAN_SETTER(SetGlobalCompositeOperation);
    static NAN_SETTER(SetGlobalAlpha);
    static NAN_SETTER(SetShadowColor);
    static NAN_SETTER(SetMiterLimit);
    static NAN_SETTER(SetLineCap);
    static NAN_SETTER(SetLineJoin);
    static NAN_SETTER(SetLineWidth);
    static NAN_SETTER(SetLineDashOffset);
    static NAN_SETTER(SetShadowOffsetX);
    static NAN_SETTER(SetShadowOffsetY);
    static NAN_SETTER(SetShadowBlur);
    static NAN_SETTER(SetAntiAlias);
    static NAN_SETTER(SetTextDrawingMode);
    static NAN_SETTER(SetQuality);
    static NAN_SETTER(SetCurrentTransform);
    static NAN_SETTER(SetFillStyle);
    static NAN_SETTER(SetStrokeStyle);
    static NAN_SETTER(SetFont);
    static NAN_SETTER(SetTextBaseline);
    static NAN_SETTER(SetTextAlign);
    inline void setContext(cairo_t *ctx) { _context = ctx; }
    inline cairo_t *context(){ return _context; }
    inline Canvas *canvas(){ return _canvas; }
    inline bool hasShadow();
    void inline setSourceRGBA(rgba_t color);
    void inline setSourceRGBA(cairo_t *ctx, rgba_t color);
    void setTextPath(double x, double y);
    void blur(cairo_surface_t *surface, int radius);
    void shadow(void (fn)(cairo_t *cr));
    void shadowStart();
    void shadowApply();
    void savePath();
    void restorePath();
    void saveState();
    void restoreState();
    void inline setFillRule(v8::Local<v8::Value> value);
    void fill(bool preserve = false);
    void stroke(bool preserve = false);
    void save();
    void restore();
    void setFontFromState();
    void resetState(bool init = false);
    inline PangoLayout *layout(){ return _layout; }

  private:
    ~Context2d();
    void _resetPersistentHandles();
    v8::Local<v8::Value> _getFillColor();
    v8::Local<v8::Value> _getStrokeColor();
    void _setFillColor(v8::Local<v8::Value> arg);
    void _setFillPattern(v8::Local<v8::Value> arg);
    void _setStrokeColor(v8::Local<v8::Value> arg);
    void _setStrokePattern(v8::Local<v8::Value> arg);
    Nan::Persistent<v8::Value> _fillStyle;
    Nan::Persistent<v8::Value> _strokeStyle;
    Nan::Persistent<v8::Value> _font;
    Nan::Persistent<v8::Value> _textBaseline;
    Nan::Persistent<v8::Value> _textAlign;
    Canvas *_canvas;
    cairo_t *_context;
    cairo_path_t *_path;
    PangoLayout *_layout;
};
