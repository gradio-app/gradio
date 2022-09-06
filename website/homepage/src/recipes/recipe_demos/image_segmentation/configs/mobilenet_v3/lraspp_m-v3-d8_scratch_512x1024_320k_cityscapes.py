_base_ = [
    '../_base_/models/lraspp_m-v3-d8.py', '../_base_/datasets/cityscapes.py',
    '../_base_/default_runtime.py', '../_base_/schedules/schedule_160k.py'
]

# Re-config the data sampler.
data = dict(samples_per_gpu=4, workers_per_gpu=4)

runner = dict(type='IterBasedRunner', max_iters=320000)
