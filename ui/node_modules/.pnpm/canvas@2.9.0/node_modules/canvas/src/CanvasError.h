#pragma once

#include <string>

class CanvasError {
  public:
    std::string message;
    std::string syscall;
    std::string path;
    int cerrno = 0;
    void set(const char* iMessage = NULL, const char* iSyscall = NULL, int iErrno = 0, const char* iPath = NULL) {
      if (iMessage) message.assign(iMessage);
      if (iSyscall) syscall.assign(iSyscall);
      cerrno = iErrno;
      if (iPath) path.assign(iPath);
    }
    void reset() {
      message.clear();
      syscall.clear();
      path.clear();
      cerrno = 0;
    }
};
