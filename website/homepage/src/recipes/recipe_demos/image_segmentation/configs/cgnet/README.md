# CGNet: A Light-weight Context Guided Network for Semantic Segmentation

## Introduction

<!-- [ALGORITHM] -->

```latext
@article{wu2020cgnet,
  title={Cgnet: A light-weight context guided network for semantic segmentation},
  author={Wu, Tianyi and Tang, Sheng and Zhang, Rui and Cao, Juan and Zhang, Yongdong},
  journal={IEEE Transactions on Image Processing},
  volume={30},
  pages={1169--1179},
  year={2020},
  publisher={IEEE}
}
```

## Results and models

### Cityscapes

| Method | Backbone | Crop Size | Lr schd | Mem (GB) | Inf time (fps) |  mIoU | mIoU(ms+flip) | config                                                                                                            | download                                                                                                                                                                                                                                                                                                               |
| ------ | -------- | --------- | ------: | -------- | -------------- | ----: | ------------: | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CGNet  | M3N21    | 680x680   |   60000 | 7.5      | 30.51          | 65.63 |         68.04 | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/cgnet/cgnet_680x680_60k_cityscapes.py)  | [model](https://download.openmmlab.com/mmsegmentation/v0.5/cgnet/cgnet_680x680_60k_cityscapes/cgnet_680x680_60k_cityscapes_20201101_110253-4c0b2f2d.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/cgnet/cgnet_680x680_60k_cityscapes/cgnet_680x680_60k_cityscapes-20201101_110253.log.json)     |
| CGNet  | M3N21    | 512x1024  |   60000 | 8.3      | 31.14          | 68.27 |         70.33 | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/cgnet/cgnet_512x1024_60k_cityscapes.py) | [model](https://download.openmmlab.com/mmsegmentation/v0.5/cgnet/cgnet_512x1024_60k_cityscapes/cgnet_512x1024_60k_cityscapes_20201101_110254-124ea03b.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/cgnet/cgnet_512x1024_60k_cityscapes/cgnet_512x1024_60k_cityscapes-20201101_110254.log.json) |
