#include "BMPParser.h"

#include <cassert>

using namespace std;
using namespace BMPParser;

#define MAX_IMG_SIZE 10000

#define E(cond, msg) if(cond) return setErr(msg)
#define EU(cond, msg) if(cond) return setErrUnsupported(msg)
#define EX(cond, msg) if(cond) return setErrUnknown(msg)

#define I1() get<char>()
#define U1() get<uint8_t>()
#define I2() get<int16_t>()
#define U2() get<uint16_t>()
#define I4() get<int32_t>()
#define U4() get<uint32_t>()

#define I1UC() get<char, false>()
#define U1UC() get<uint8_t, false>()
#define I2UC() get<int16_t, false>()
#define U2UC() get<uint16_t, false>()
#define I4UC() get<int32_t, false>()
#define U4UC() get<uint32_t, false>()

#define CHECK_OVERRUN(ptr, size, type) \
  if((ptr) + (size) - data > len){ \
    setErr("unexpected end of file"); \
    return type(); \
  }

Parser::~Parser(){
  data = nullptr;
  ptr = nullptr;

  if(imgd){
    delete[] imgd;
    imgd = nullptr;
  }
}

void Parser::parse(uint8_t *buf, int bufSize, uint8_t *format){
  assert(status == Status::EMPTY);

  data = ptr = buf;
  len = bufSize;

  // Start parsing file header
  setOp("file header");

  // File header signature
  string fhSig = getStr(2);
  string temp = "file header signature";
  EU(fhSig == "BA", temp + " \"BA\"");
  EU(fhSig == "CI", temp + " \"CI\"");
  EU(fhSig == "CP", temp + " \"CP\"");
  EU(fhSig == "IC", temp + " \"IC\"");
  EU(fhSig == "PT", temp + " \"PT\"");
  EX(fhSig != "BM", temp); // BM

  // Length of the file should not be larger than `len`
  E(U4() > static_cast<uint32_t>(len), "inconsistent file size");

  // Skip unused values
  skip(4);

  // Offset where the pixel array (bitmap data) can be found
  auto imgdOffset = U4();

  // Start parsing DIB header
  setOp("DIB header");

  // Prepare some variables in case they are needed
  uint32_t compr = 0;
  uint32_t redShift = 0, greenShift = 0, blueShift = 0, alphaShift = 0;
  uint32_t redMask = 0, greenMask = 0, blueMask = 0, alphaMask = 0;
  double redMultp = 0, greenMultp = 0, blueMultp = 0, alphaMultp = 0;

  /**
   * Type of the DIB (device-independent bitmap) header
   * is determined by its size. Most BMP files use BITMAPINFOHEADER.
   */
  auto dibSize = U4();
  temp = "DIB header";
  EU(dibSize == 64, temp + " \"OS22XBITMAPHEADER\"");
  EU(dibSize == 16, temp + " \"OS22XBITMAPHEADER\"");

  uint32_t infoHeader = dibSize == 40 ? 1 :
                        dibSize == 52 ? 2 :
                        dibSize == 56 ? 3 :
                        dibSize == 108 ? 4 :
                        dibSize == 124 ? 5 : 0;

  // BITMAPCOREHEADER, BITMAP*INFOHEADER, BITMAP*HEADER
  auto isDibValid = dibSize == 12 || infoHeader;
  EX(!isDibValid, temp);

  // Image width
  w = dibSize == 12 ? U2() : I4();
  E(!w, "image width is 0");
  E(w < 0, "negative image width");
  E(w > MAX_IMG_SIZE, "too large image width");

  // Image height (specification allows negative values)
  h = dibSize == 12 ? U2() : I4();
  E(!h, "image height is 0");
  E(h > MAX_IMG_SIZE, "too large image height");

  bool isHeightNegative = h < 0;
  if(isHeightNegative) h = -h;

  // Number of color planes (must be 1)
  E(U2() != 1, "number of color planes must be 1");

  // Bits per pixel (color depth)
  auto bpp = U2();
  auto isBppValid = bpp == 1 || bpp == 4 || bpp == 8 || bpp == 16 || bpp == 24 || bpp == 32;
  EU(!isBppValid, "color depth");

  // Calculate image data size and padding
  uint32_t expectedImgdSize = (((w * bpp + 31) >> 5) << 2) * h;
  uint32_t rowPadding = (-w * bpp & 31) >> 3;
  uint32_t imgdSize = 0;

  // Color palette data
  uint8_t* paletteStart = nullptr;
  uint32_t palColNum = 0;

  if(infoHeader){
    // Compression type
    compr = U4();
    temp = "compression type";
    EU(compr == 1, temp + " \"BI_RLE8\"");
    EU(compr == 2, temp + " \"BI_RLE4\"");
    EU(compr == 4, temp + " \"BI_JPEG\"");
    EU(compr == 5, temp + " \"BI_PNG\"");
    EU(compr == 6, temp + " \"BI_ALPHABITFIELDS\"");
    EU(compr == 11, temp + " \"BI_CMYK\"");
    EU(compr == 12, temp + " \"BI_CMYKRLE8\"");
    EU(compr == 13, temp + " \"BI_CMYKRLE4\"");

    // BI_RGB and BI_BITFIELDS
    auto isComprValid = compr == 0 || compr == 3;
    EX(!isComprValid, temp);

    // Ensure that BI_BITFIELDS appears only with 16-bit or 32-bit color
    E(compr == 3 && !(bpp == 16 || bpp == 32), "compression BI_BITFIELDS can be used only with 16-bit and 32-bit color depth");

    // Size of the image data
    imgdSize = U4();

    // Horizontal and vertical resolution (ignored)
    skip(8);

    // Number of colors in the palette or 0 if no palette is present
    palColNum = U4();
    EU(palColNum && bpp > 8, "color palette and bit depth combination");
    if(palColNum) paletteStart = data + dibSize + 14;

    // Number of important colors used or 0 if all colors are important (generally ignored)
    skip(4);

    if(infoHeader >= 2){
      // If BI_BITFIELDS are used, calculate masks, otherwise ignore them
      if(compr == 3){
        calcMaskShift(redShift, redMask, redMultp);
        calcMaskShift(greenShift, greenMask, greenMultp);
        calcMaskShift(blueShift, blueMask, blueMultp);
        if(infoHeader >= 3) calcMaskShift(alphaShift, alphaMask, alphaMultp);
        if(status == Status::ERROR) return;
      }else{
        skip(16);
      }

      // Ensure that the color space is LCS_WINDOWS_COLOR_SPACE or sRGB
      if(infoHeader >= 4 && !palColNum){
        string colSpace = getStr(4, 1);
        EU(colSpace != "Win " && colSpace != "sRGB", "color space \"" + colSpace + "\"");
      }
    }
  }

  // Skip to the image data (there may be other chunks between, but they are optional)
  E(ptr - data > imgdOffset, "image data overlaps with another structure");
  ptr = data + imgdOffset;

  // Start parsing image data
  setOp("image data");

  if(!imgdSize){
    // Value 0 is allowed only for BI_RGB compression type
    E(compr != 0, "missing image data size");
    imgdSize = expectedImgdSize;
  }else{
    E(imgdSize < expectedImgdSize, "invalid image data size");
  }

  // Ensure that all image data is present
  E(ptr - data + imgdSize > len, "not enough image data");

  // Direction of reading rows
  int yStart = h - 1;
  int yEnd = -1;
  int dy = isHeightNegative ? 1 : -1;

  // In case of negative height, read rows backward
  if(isHeightNegative){
    yStart = 0;
    yEnd = h;
  }

  // Allocate output image data array
  int buffLen = w * h << 2;
  imgd = new (nothrow) uint8_t[buffLen];
  E(!imgd, "unable to allocate memory");

  // Prepare color values
  uint8_t color[4] = {0};
  uint8_t &red = color[0];
  uint8_t &green = color[1];
  uint8_t &blue = color[2];
  uint8_t &alpha = color[3];

  // Check if pre-multiplied alpha is used
  bool premul = format ? format[4] : 0;

  // Main loop
  for(int y = yStart; y != yEnd; y += dy){
    // Use in-byte offset for bpp < 8
    uint8_t colOffset = 0;
    uint8_t cval = 0;
    uint32_t val = 0;

    for(int x = 0; x != w; x++){
      // Index in the output image data
      int i = (x + y * w) << 2;

      switch(compr){
        case 0: // BI_RGB
          switch(bpp){
            case 1:
              if(colOffset) ptr--;
              cval = (U1UC() >> (7 - colOffset)) & 1;

              if(palColNum){
                uint8_t* entry = paletteStart + (cval << 2);
                blue = get<uint8_t>(entry);
                green = get<uint8_t>(entry + 1);
                red = get<uint8_t>(entry + 2);
                if(status == Status::ERROR) return;
              }else{
                red = green = blue = cval ? 255 : 0;
              }

              alpha = 255;
              colOffset = (colOffset + 1) & 7;
              break;

            case 4:
              if(colOffset) ptr--;
              cval = (U1UC() >> (4 - colOffset)) & 15;

              if(palColNum){
                uint8_t* entry = paletteStart + (cval << 2);
                blue = get<uint8_t>(entry);
                green = get<uint8_t>(entry + 1);
                red = get<uint8_t>(entry + 2);
                if(status == Status::ERROR) return;
              }else{
                red = green = blue = cval << 4;
              }

              alpha = 255;
              colOffset = (colOffset + 4) & 7;
              break;

            case 8:
              cval = U1UC();

              if(palColNum){
                uint8_t* entry = paletteStart + (cval << 2);
                blue = get<uint8_t>(entry);
                green = get<uint8_t>(entry + 1);
                red = get<uint8_t>(entry + 2);
                if(status == Status::ERROR) return;
              }else{
                red = green = blue = cval;
              }

              alpha = 255;
              break;

            case 16:
              // RGB555
              val = U1UC();
              val |= U1UC() << 8;
              red = (val >> 10) << 3;
              green = (val >> 5) << 3;
              blue = val << 3;
              alpha = 255;
              break;

            case 24:
              blue = U1UC();
              green = U1UC();
              red = U1UC();
              alpha = 255;
              break;

            case 32:
              blue = U1UC();
              green = U1UC();
              red = U1UC();

              if(infoHeader >= 3){
                alpha = U1UC();
              }else{
                alpha = 255;
                skip(1);
              }
              break;
          }
          break;

        case 3: // BI_BITFIELDS
          uint32_t col = bpp == 16 ? U2UC() : U4UC();
          red = ((col >> redShift) & redMask) * redMultp + .5;
          green = ((col >> greenShift) & greenMask) * greenMultp + .5;
          blue = ((col >> blueShift) & blueMask) * blueMultp + .5;
          alpha = alphaMask ? ((col >> alphaShift) & alphaMask) * alphaMultp + .5 : 255;
          break;
      }

      /**
       * Pixel format:
       *  red,
       *  green,
       *  blue,
       *  alpha,
       *  is alpha pre-multiplied
       * Default is [0, 1, 2, 3, 0]
       */

      if(premul && alpha != 255){
        double a = alpha / 255.;
        red = static_cast<uint8_t>(red * a + .5);
        green = static_cast<uint8_t>(green * a + .5);
        blue = static_cast<uint8_t>(blue * a + .5);
      }

      if(format){
        imgd[i] = color[format[0]];
        imgd[i + 1] = color[format[1]];
        imgd[i + 2] = color[format[2]];
        imgd[i + 3] = color[format[3]];
      }else{
        imgd[i] = red;
        imgd[i + 1] = green;
        imgd[i + 2] = blue;
        imgd[i + 3] = alpha;
      }
    }

    // Skip unused bytes in the current row
    skip(rowPadding);
  }

  if(status == Status::ERROR) return;
  status = Status::OK;
};

void Parser::clearImgd(){ imgd = nullptr; }
int32_t Parser::getWidth() const{ return w; }
int32_t Parser::getHeight() const{ return h; }
uint8_t *Parser::getImgd() const{ return imgd; }
Status Parser::getStatus() const{ return status; }

string Parser::getErrMsg() const{
  return "Error while processing " + getOp() + " - " + err;
}

template <typename T, bool check> inline T Parser::get(){
  if(check)
    CHECK_OVERRUN(ptr, sizeof(T), T);
  T val = *(T*)ptr;
  ptr += sizeof(T);
  return val;
}

template <typename T, bool check> inline T Parser::get(uint8_t* pointer){
  if(check)
    CHECK_OVERRUN(pointer, sizeof(T), T);
  T val = *(T*)pointer;
  return val;
}

string Parser::getStr(int size, bool reverse){
  CHECK_OVERRUN(ptr, size, string);
  string val = "";

  while(size--){
    if(reverse) val = string(1, static_cast<char>(*ptr++)) + val;
    else val += static_cast<char>(*ptr++);
  }

  return val;
}

inline void Parser::skip(int size){
  CHECK_OVERRUN(ptr, size, void);
  ptr += size;
}

void Parser::calcMaskShift(uint32_t& shift, uint32_t& mask, double& multp){
  mask = U4();
  shift = 0;

  if(mask == 0) return;

  while(~mask & 1){
    mask >>= 1;
    shift++;
  }

  E(mask & (mask + 1), "invalid color mask");

  multp = 255. / mask;
}

void Parser::setOp(string val){
  if(status != Status::EMPTY) return;
  op = val;
}

string Parser::getOp() const{
  return op;
}

void Parser::setErrUnsupported(string msg){
  setErr("unsupported " + msg);
}

void Parser::setErrUnknown(string msg){
  setErr("unknown " + msg);
}

void Parser::setErr(string msg){
  if(status != Status::EMPTY) return;
  err = msg;
  status = Status::ERROR;
}

string Parser::getErr() const{
  return err;
}
