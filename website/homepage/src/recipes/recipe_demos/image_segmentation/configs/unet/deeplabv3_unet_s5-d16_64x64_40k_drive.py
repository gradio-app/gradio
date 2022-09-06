_base_ = [
    '../_base_/models/deeplabv3_unet_s5-d16.py', '../_base_/datasets/drive.py',
    '../_base_/default_runtime.py', '../_base_/schedules/schedule_40k.py'
]
model = dict(test_cfg=dict(crop_size=(64, 64), stride=(42, 42)))
evaluation = dict(metric='mDice')
