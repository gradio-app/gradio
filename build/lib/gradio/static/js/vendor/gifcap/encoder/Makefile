CC=emcc
CFLAGS=-O2 \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s RESERVED_FUNCTION_POINTERS=20 \
	-s ALLOW_TABLE_GROWTH=1 \
	-Ivendor/libimagequant \
	-Ivendor/gifsicle/src \
	-Ivendor/gifsicle/include
LIBS=vendor/libimagequant/*.o \
	vendor/gifsicle/src/giffunc.o \
	vendor/gifsicle/src/fmalloc.o \
	vendor/gifsicle/src/support.o \
	vendor/gifsicle/src/gifwrite.o \
	vendor/gifsicle/src/gifread.o

encoder.js: encoder.c vendor/libimagequant/libimagequant.o vendor/gifsicle/gifsicle.o
	$(CC) $(CFLAGS) -o $@ encoder.c $(LIBS)

vendor/libimagequant/libimagequant.o:
	cd vendor/libimagequant && make static

vendor/gifsicle/gifsicle.o:
	cd vendor/gifsicle && make

.PHONY: clean

clean:
	cd vendor/libimagequant && make clean
	cd vendor/gifsicle && make clean
	rm -f encoder.js encoder.wasm