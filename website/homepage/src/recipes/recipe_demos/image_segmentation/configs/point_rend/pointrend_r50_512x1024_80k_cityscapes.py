_base_ = [
    '../_base_/models/pointrend_r50.py', '../_base_/datasets/cityscapes.py',
    '../_base_/default_runtime.py', '../_base_/schedules/schedule_80k.py'
]
lr_config = dict(warmup='linear', warmup_iters=200)
