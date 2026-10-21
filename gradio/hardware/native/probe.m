// Small framework-independent bandwidth probe; output is measured, not a device prediction.
#import <Foundation/Foundation.h>
#import <Metal/Metal.h>
#include <time.h>
int main(void) { @autoreleasepool {
    id<MTLDevice> d = MTLCreateSystemDefaultDevice();
    if (!d) return 2;
    NSError *error = nil;
    NSString *source = @"#include <metal_stdlib>\nusing namespace metal; kernel void copy_values(device const float *x[[buffer(0)]], device float *y[[buffer(1)]], uint i[[thread_position_in_grid]]) {y[i]=x[i]+1.0f;}";
    id<MTLLibrary> lib = [d newLibraryWithSource:source options:nil error:&error];
    id<MTLComputePipelineState> pipeline = [d newComputePipelineStateWithFunction:[lib newFunctionWithName:@"copy_values"] error:&error];
    if (!pipeline) {fprintf(stderr,"%s\n",error.description.UTF8String);return 3;}
    NSUInteger length = 64 * 1024 * 1024;
    id<MTLBuffer> x=[d newBufferWithLength:length options:MTLResourceStorageModeShared];
    id<MTLBuffer> y=[d newBufferWithLength:length options:MTLResourceStorageModeShared];
    if (!x || !y) {fprintf(stderr,"Buffer allocation rejected\n");return 4;}
    id<MTLCommandQueue> q=[d newCommandQueue];
    double gpu=0; CFAbsoluteTime start=CFAbsoluteTimeGetCurrent();
    for(int i=0;i<24;i++) {
        id<MTLCommandBuffer> b=[q commandBuffer];
        id<MTLComputeCommandEncoder> e=[b computeCommandEncoder];
        [e setComputePipelineState:pipeline];[e setBuffer:x offset:0 atIndex:0];[e setBuffer:y offset:0 atIndex:1];
        [e dispatchThreads:MTLSizeMake(length/4,1,1) threadsPerThreadgroup:MTLSizeMake(256,1,1)];
        [e endEncoding];[b commit];[b waitUntilCompleted];
        if (b.error) return 5;
        gpu+=b.GPUEndTime-b.GPUStartTime;
    }
    double wall=CFAbsoluteTimeGetCurrent()-start;
    NSDictionary *result=@{@"device":d.name,@"recommended_bytes":@(d.recommendedMaxWorkingSetSize),@"working_bytes":@(d.currentAllocatedSize),@"gpu_seconds":@(gpu),@"wall_seconds":@(wall),@"bandwidth_gbs":@(2.0*length*24/gpu/1e9),@"effective_bandwidth_gbs":@(2.0*length*24/wall/1e9),@"valid":@(((float*)y.contents)[0]==1.0f)};
    NSData *json=[NSJSONSerialization dataWithJSONObject:result options:0 error:nil];
    fwrite(json.bytes,1,json.length,stdout);puts("");return 0;
}}
