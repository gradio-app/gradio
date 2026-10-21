// Experimental, worker-local Metal submission governor. No framework hooks.
#import <Foundation/Foundation.h>
#import <Metal/Metal.h>
#import <objc/runtime.h>
#include <pthread.h>
#include <time.h>
#include <unistd.h>

static double rate = 1.0, deadline = 0;
static unsigned long long budget = 0, submissions = 0;
static pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
static IMP originalCommit, originalWait, originalBuffer, originalBytes, originalNoCopy, originalHeap;
static double now(void) {
    struct timespec t; clock_gettime(CLOCK_MONOTONIC, &t);
    return t.tv_sec + t.tv_nsec / 1e9;
}
static void settle(void) {
    while (1) {
        pthread_mutex_lock(&lock);
        double remaining = deadline - now();
        pthread_mutex_unlock(&lock);
        if (remaining <= 0) return;
        struct timespec t = {(time_t)remaining, (long)((remaining - (time_t)remaining)*1e9)};
        nanosleep(&t, NULL);
    }
}
static void commit(id<MTLCommandBuffer> buffer, SEL sel) {
    settle();
    [buffer addCompletedHandler:^(id<MTLCommandBuffer> done) {
        double elapsed = done.GPUEndTime - done.GPUStartTime;
        if (elapsed > 0 && rate < 1) {
            pthread_mutex_lock(&lock);
            deadline = fmax(deadline, now()) + elapsed * (1.0/rate - 1.0);
            pthread_mutex_unlock(&lock);
        }
    }];
    __atomic_add_fetch(&submissions, 1, __ATOMIC_RELAXED);
    ((void (*)(id, SEL))originalCommit)(buffer, sel);
}
static void waitCompleted(id buffer, SEL sel) {
    ((void (*)(id, SEL))originalWait)(buffer, sel);
    settle();
}
// These selectors return retained objects. Preserve that ownership across IMP calls.
typedef id (*BufferLengthFn)(id, SEL, NSUInteger, MTLResourceOptions) __attribute__((ns_returns_retained));
typedef id (*BufferBytesFn)(id, SEL, const void *, NSUInteger, MTLResourceOptions) __attribute__((ns_returns_retained));
typedef id (*BufferNoCopyFn)(id, SEL, void *, NSUInteger, MTLResourceOptions, void (^)(void *, NSUInteger)) __attribute__((ns_returns_retained));
typedef id (*HeapFn)(id, SEL, MTLHeapDescriptor *) __attribute__((ns_returns_retained));
static bool fits(id<MTLDevice> device, NSUInteger length) {
    return !budget || (length <= budget && device.currentAllocatedSize <= budget-length);
}
static id newBuffer(id<MTLDevice> device, SEL sel, NSUInteger length, MTLResourceOptions options) __attribute__((ns_returns_retained));
static id newBuffer(id<MTLDevice> device, SEL sel, NSUInteger length, MTLResourceOptions options) {
    if (!fits(device, length)) return nil;
    return ((BufferLengthFn)originalBuffer)(device, sel, length, options);
}
static id newBytes(id<MTLDevice> device, SEL sel, const void *bytes, NSUInteger length, MTLResourceOptions options) __attribute__((ns_returns_retained));
static id newBytes(id<MTLDevice> device, SEL sel, const void *bytes, NSUInteger length, MTLResourceOptions options) {
    if (!fits(device, length)) return nil;
    return ((BufferBytesFn)originalBytes)(device, sel, bytes, length, options);
}
static id newNoCopy(id<MTLDevice> device, SEL sel, void *bytes, NSUInteger length, MTLResourceOptions options, void (^deallocator)(void *, NSUInteger)) __attribute__((ns_returns_retained));
static id newNoCopy(id<MTLDevice> device, SEL sel, void *bytes, NSUInteger length, MTLResourceOptions options, void (^deallocator)(void *, NSUInteger)) {
    if (!fits(device, length)) return nil;
    return ((BufferNoCopyFn)originalNoCopy)(device, sel, bytes, length, options, deallocator);
}
static id newHeap(id<MTLDevice> device, SEL sel, MTLHeapDescriptor *descriptor) __attribute__((ns_returns_retained));
static id newHeap(id<MTLDevice> device, SEL sel, MTLHeapDescriptor *descriptor) {
    if (!fits(device, descriptor.size)) return nil;
    return ((HeapFn)originalHeap)(device, sel, descriptor);
}
static IMP replace(Class cls, SEL sel, IMP replacement) {
    Method method = class_getInstanceMethod(cls, sel);
    if (!method) return NULL;
    IMP original = method_getImplementation(method);
    if (!class_addMethod(cls, sel, replacement, method_getTypeEncoding(method)))
        method_setImplementation(class_getInstanceMethod(cls, sel), replacement);
    return original;
}
__attribute__((constructor)) static void install(void) {
    @autoreleasepool {
        const char *setting = getenv("GRADIO_METAL_RATE");
        if (!setting) return;
        rate = atof(setting);
        if (!(rate > 0 && rate <= 1)) { fprintf(stderr, "Invalid GRADIO_METAL_RATE\n"); _exit(78); }
        const char *memory = getenv("GRADIO_METAL_MEMORY_BYTES");
        if (memory) budget = strtoull(memory, NULL, 10);
        id<MTLDevice> device = MTLCreateSystemDefaultDevice();
        if (!device) { fprintf(stderr, "Metal device unavailable\n"); _exit(78); }
        id<MTLCommandQueue> queue = [device newCommandQueue];
        id<MTLCommandBuffer> buffer = [queue commandBuffer];
        Class cls = object_getClass(buffer);
        originalCommit = replace(cls, @selector(commit), (IMP)commit);
        originalWait = replace(cls, @selector(waitUntilCompleted), (IMP)waitCompleted);
        originalBuffer = replace(object_getClass(device), @selector(newBufferWithLength:options:), (IMP)newBuffer);
        originalBytes = replace(object_getClass(device), @selector(newBufferWithBytes:length:options:), (IMP)newBytes);
        originalNoCopy = replace(object_getClass(device), @selector(newBufferWithBytesNoCopy:length:options:deallocator:), (IMP)newNoCopy);
        originalHeap = replace(object_getClass(device), @selector(newHeapWithDescriptor:), (IMP)newHeap);
        fprintf(stderr, "Gradio Metal governor: %s, rate=%.3f, buffer budget=%llu\n", device.name.UTF8String, rate, budget);
    }
}
__attribute__((destructor)) static void report(void) {
    if (getenv("GRADIO_METAL_RATE")) fprintf(stderr, "Gradio Metal submissions: %llu\n", submissions);
}

// Export telemetry and a final drain for the Python worker. Observational only.
unsigned long long gradio_metal_submissions(void) { return __atomic_load_n(&submissions, __ATOMIC_RELAXED); }
void gradio_metal_drain(void) { settle(); }
unsigned long long gradio_metal_allocated(void) { return MTLCreateSystemDefaultDevice().currentAllocatedSize; }
