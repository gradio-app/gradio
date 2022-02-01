#pragma once

#include <cairo.h>
#include "closure.h"
#include <cmath> // round
#include <cstdlib>
#include <cstring>
#include <png.h>
#include <pngconf.h>

#if defined(__GNUC__) && (__GNUC__ > 2) && defined(__OPTIMIZE__)
#define likely(expr) (__builtin_expect (!!(expr), 1))
#define unlikely(expr) (__builtin_expect (!!(expr), 0))
#else
#define likely(expr) (expr)
#define unlikely(expr) (expr)
#endif

static void canvas_png_flush(png_structp png_ptr) {
    /* Do nothing; fflush() is said to be just a waste of energy. */
    (void) png_ptr;   /* Stifle compiler warning */
}

/* Converts native endian xRGB => RGBx bytes */
static void canvas_convert_data_to_bytes(png_structp png, png_row_infop row_info, png_bytep data) {
    unsigned int i;

    for (i = 0; i < row_info->rowbytes; i += 4) {
        uint8_t *b = &data[i];
        uint32_t pixel;

        memcpy(&pixel, b, sizeof (uint32_t));

        b[0] = (pixel & 0xff0000) >> 16;
        b[1] = (pixel & 0x00ff00) >>  8;
        b[2] = (pixel & 0x0000ff) >>  0;
        b[3] = 0;
    }
}

/* Unpremultiplies data and converts native endian ARGB => RGBA bytes */
static void canvas_unpremultiply_data(png_structp png, png_row_infop row_info, png_bytep data) {
    unsigned int i;

    for (i = 0; i < row_info->rowbytes; i += 4) {
        uint8_t *b = &data[i];
        uint32_t pixel;
        uint8_t  alpha;

        memcpy(&pixel, b, sizeof (uint32_t));
        alpha = (pixel & 0xff000000) >> 24;
        if (alpha == 0) {
            b[0] = b[1] = b[2] = b[3] = 0;
        } else {
            b[0] = (((pixel & 0xff0000) >> 16) * 255 + alpha / 2) / alpha;
            b[1] = (((pixel & 0x00ff00) >>  8) * 255 + alpha / 2) / alpha;
            b[2] = (((pixel & 0x0000ff) >>  0) * 255 + alpha / 2) / alpha;
            b[3] = alpha;
        }
    }
}

/* Converts RGB16_565 format data to RGBA32 */
static void canvas_convert_565_to_888(png_structp png, png_row_infop row_info, png_bytep data) {
  // Loop in reverse to unpack in-place.
  for (ptrdiff_t col = row_info->width - 1; col >= 0; col--) {
    uint8_t* src = &data[col * sizeof(uint16_t)];
    uint8_t* dst = &data[col * 3];
    uint16_t pixel;

    memcpy(&pixel, src, sizeof(uint16_t));

    // Convert and rescale to the full 0-255 range
    // See http://stackoverflow.com/a/29326693
    const uint8_t red5 = (pixel & 0xF800) >> 11;
    const uint8_t green6 = (pixel & 0x7E0) >> 5;
    const uint8_t blue5 = (pixel & 0x001F);

    dst[0] = ((red5 * 255 + 15) / 31);
    dst[1] = ((green6 * 255 + 31) / 63);
    dst[2] = ((blue5 * 255 + 15) / 31);
  }
}

struct canvas_png_write_closure_t {
    cairo_write_func_t write_func;
    PngClosure* closure;
};

#ifdef PNG_SETJMP_SUPPORTED
bool setjmp_wrapper(png_structp png) {
    return setjmp(png_jmpbuf(png));
}
#endif

static cairo_status_t canvas_write_png(cairo_surface_t *surface, png_rw_ptr write_func, canvas_png_write_closure_t *closure) {
    unsigned int i;
    cairo_status_t status = CAIRO_STATUS_SUCCESS;
    uint8_t *data;
    png_structp png;
    png_infop info;
    png_bytep *volatile rows = NULL;
    png_color_16 white;
    int png_color_type;
    int bpc;
    unsigned int width = cairo_image_surface_get_width(surface);
    unsigned int height = cairo_image_surface_get_height(surface);

    data = cairo_image_surface_get_data(surface);
    if (data == NULL) {
        status = CAIRO_STATUS_SURFACE_TYPE_MISMATCH;
        return status;
    }
    cairo_surface_flush(surface);

    if (width == 0 || height == 0) {
        status = CAIRO_STATUS_WRITE_ERROR;
        return status;
    }

    rows = (png_bytep *) malloc(height * sizeof (png_byte*));
    if (unlikely(rows == NULL)) {
        status = CAIRO_STATUS_NO_MEMORY;
        return status;
    }

    int stride = cairo_image_surface_get_stride(surface);
    for (i = 0; i < height; i++) {
        rows[i] = (png_byte *) data + i * stride;
    }

#ifdef PNG_USER_MEM_SUPPORTED
     png = png_create_write_struct_2(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL, NULL, NULL, NULL);
#else
    png = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
#endif

    if (unlikely(png == NULL)) {
        status = CAIRO_STATUS_NO_MEMORY;
        free(rows);
        return status;
    }

    info = png_create_info_struct (png);
    if (unlikely(info == NULL)) {
        status = CAIRO_STATUS_NO_MEMORY;
        png_destroy_write_struct(&png, &info);
        free(rows);
        return status;

    }

#ifdef PNG_SETJMP_SUPPORTED
    if (setjmp_wrapper(png)) {
        png_destroy_write_struct(&png, &info);
        free(rows);
        return status;
    }
#endif

    png_set_write_fn(png, closure, write_func, canvas_png_flush);
    png_set_compression_level(png, closure->closure->compressionLevel);
    png_set_filter(png, 0, closure->closure->filters);
    if (closure->closure->resolution != 0) {
        uint32_t res = static_cast<uint32_t>(round(static_cast<double>(closure->closure->resolution) * 39.3701));
        png_set_pHYs(png, info, res, res, PNG_RESOLUTION_METER);
    }

    cairo_format_t format = cairo_image_surface_get_format(surface);

    switch (format) {
    case CAIRO_FORMAT_ARGB32:
        bpc = 8;
        png_color_type = PNG_COLOR_TYPE_RGB_ALPHA;
        break;
#ifdef CAIRO_FORMAT_RGB30
    case CAIRO_FORMAT_RGB30:
        bpc = 10;
        png_color_type = PNG_COLOR_TYPE_RGB;
        break;
#endif
    case CAIRO_FORMAT_RGB24:
        bpc = 8;
        png_color_type = PNG_COLOR_TYPE_RGB;
        break;
    case CAIRO_FORMAT_A8:
        bpc = 8;
        png_color_type = PNG_COLOR_TYPE_GRAY;
        break;
    case CAIRO_FORMAT_A1:
        bpc = 1;
        png_color_type = PNG_COLOR_TYPE_GRAY;
#ifndef WORDS_BIGENDIAN
        png_set_packswap(png);
#endif
        break;
    case CAIRO_FORMAT_RGB16_565:
        bpc = 8; // 565 gets upconverted to 888
        png_color_type = PNG_COLOR_TYPE_RGB;
        break;
    case CAIRO_FORMAT_INVALID:
    default:
        status = CAIRO_STATUS_INVALID_FORMAT;
        png_destroy_write_struct(&png, &info);
        free(rows);
        return status;
    }

    if ((format == CAIRO_FORMAT_A8 || format == CAIRO_FORMAT_A1) &&
      closure->closure->palette != NULL) {
      png_color_type = PNG_COLOR_TYPE_PALETTE;
    }

    png_set_IHDR(png, info, width, height, bpc, png_color_type, PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_DEFAULT, PNG_FILTER_TYPE_DEFAULT);

    if (png_color_type == PNG_COLOR_TYPE_PALETTE) {
      size_t nColors = closure->closure->nPaletteColors;
      uint8_t* colors = closure->closure->palette;
      uint8_t backgroundIndex = closure->closure->backgroundIndex;
      png_colorp pngPalette = (png_colorp)png_malloc(png, nColors * sizeof(png_colorp));
      png_bytep transparency = (png_bytep)png_malloc(png, nColors * sizeof(png_bytep));
      for (i = 0; i < nColors; i++) {
        pngPalette[i].red = colors[4 * i];
        pngPalette[i].green = colors[4 * i + 1];
        pngPalette[i].blue = colors[4 * i + 2];
        transparency[i] = colors[4 * i + 3];
      }
      png_set_PLTE(png, info, pngPalette, nColors);
      png_set_tRNS(png, info, transparency, nColors, NULL);
      png_set_packing(png); // pack pixels
      // have libpng free palette and trans:
      png_data_freer(png, info, PNG_DESTROY_WILL_FREE_DATA, PNG_FREE_PLTE | PNG_FREE_TRNS);
      png_color_16 bkg;
      bkg.index = backgroundIndex;
      png_set_bKGD(png, info, &bkg);
    }

    if (png_color_type != PNG_COLOR_TYPE_PALETTE) {
      white.gray = (1 << bpc) - 1;
      white.red = white.blue = white.green = white.gray;
      png_set_bKGD(png, info, &white);
    }

    /* We have to call png_write_info() before setting up the write
     * transformation, since it stores data internally in 'png'
     * that is needed for the write transformation functions to work.
     */
    png_write_info(png, info);
    if (png_color_type == PNG_COLOR_TYPE_RGB_ALPHA) {
        png_set_write_user_transform_fn(png, canvas_unpremultiply_data);
    } else if (format == CAIRO_FORMAT_RGB16_565) {
        png_set_write_user_transform_fn(png, canvas_convert_565_to_888);
    } else if (png_color_type == PNG_COLOR_TYPE_RGB) {
        png_set_write_user_transform_fn(png, canvas_convert_data_to_bytes);
        png_set_filler(png, 0, PNG_FILLER_AFTER);
    }

    png_write_image(png, rows);
    png_write_end(png, info);

    png_destroy_write_struct(&png, &info);
    free(rows);
    return status;
}

static void canvas_stream_write_func(png_structp png, png_bytep data, png_size_t size) {
    cairo_status_t status;
    struct canvas_png_write_closure_t *png_closure;

    png_closure = (struct canvas_png_write_closure_t *) png_get_io_ptr(png);
    status = png_closure->write_func(png_closure->closure, data, size);
    if (unlikely(status)) {
        cairo_status_t *error = (cairo_status_t *) png_get_error_ptr(png);
        if (*error == CAIRO_STATUS_SUCCESS) {
            *error = status;
        }
        png_error(png, NULL);
    }
}

static cairo_status_t canvas_write_to_png_stream(cairo_surface_t *surface, cairo_write_func_t write_func, PngClosure* closure) {
    struct canvas_png_write_closure_t png_closure;

    if (cairo_surface_status(surface)) {
        return cairo_surface_status(surface);
    }

    png_closure.write_func = write_func;
    png_closure.closure = closure;

    return canvas_write_png(surface, canvas_stream_write_func, &png_closure);
}
