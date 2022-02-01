#include "closure.h"

#ifdef HAVE_JPEG
void JpegClosure::init_destination(j_compress_ptr cinfo) {
  JpegClosure* closure = (JpegClosure*)cinfo->client_data;
  closure->vec.resize(PAGE_SIZE);
  closure->jpeg_dest_mgr->next_output_byte = &closure->vec[0];
  closure->jpeg_dest_mgr->free_in_buffer = closure->vec.size();
}

boolean JpegClosure::empty_output_buffer(j_compress_ptr cinfo) {
  JpegClosure* closure = (JpegClosure*)cinfo->client_data;
  size_t currentSize = closure->vec.size();
  closure->vec.resize(currentSize * 1.5);
  closure->jpeg_dest_mgr->next_output_byte = &closure->vec[currentSize];
  closure->jpeg_dest_mgr->free_in_buffer = closure->vec.size() - currentSize;
  return true;
}

void JpegClosure::term_destination(j_compress_ptr cinfo) {
  JpegClosure* closure = (JpegClosure*)cinfo->client_data;
  size_t finalSize = closure->vec.size() - closure->jpeg_dest_mgr->free_in_buffer;
  closure->vec.resize(finalSize);
}
#endif

