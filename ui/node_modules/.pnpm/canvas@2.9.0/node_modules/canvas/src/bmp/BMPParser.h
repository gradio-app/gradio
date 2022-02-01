#pragma once

#ifdef ERROR
#define ERROR_ ERROR
#undef ERROR
#endif

#include <stdint.h> // node < 7 uses libstdc++ on macOS which lacks complete c++11
#include <string>

namespace BMPParser{
  enum Status{
    EMPTY,
    OK,
    ERROR,
  };

  class Parser{
  public:
    Parser()=default;
    ~Parser();
    void parse(uint8_t *buf, int bufSize, uint8_t *format=nullptr);
    void clearImgd();
    int32_t getWidth() const;
    int32_t getHeight() const;
    uint8_t *getImgd() const;
    Status getStatus() const;
    std::string getErrMsg() const;

  private:
    Status status = Status::EMPTY;
    uint8_t *data = nullptr;
    uint8_t *ptr = nullptr;
    int len = 0;
    int32_t w = 0;
    int32_t h = 0;
    uint8_t *imgd = nullptr;
    std::string err = "";
    std::string op = "";

    template <typename T, bool check=true> inline T get();
    template <typename T, bool check=true> inline T get(uint8_t* pointer);
    std::string getStr(int len, bool reverse=false);
    inline void skip(int len);
    void calcMaskShift(uint32_t& shift, uint32_t& mask, double& multp);

    void setOp(std::string val);
    std::string getOp() const;

    void setErrUnsupported(std::string msg);
    void setErrUnknown(std::string msg);
    void setErr(std::string msg);
    std::string getErr() const;
  };
}

#ifdef ERROR_
#define ERROR ERROR_
#undef ERROR_
#endif
