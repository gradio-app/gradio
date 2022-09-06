# Panoptic Feature Pyramid Networks

## Introduction

<!-- [ALGORITHM] -->

```latex
@article{Kirillov_2019,
   title={Panoptic Feature Pyramid Networks},
   ISBN={9781728132938},
   url={http://dx.doi.org/10.1109/CVPR.2019.00656},
   DOI={10.1109/cvpr.2019.00656},
   journal={2019 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)},
   publisher={IEEE},
   author={Kirillov, Alexander and Girshick, Ross and He, Kaiming and Dollar, Piotr},
   year={2019},
   month={Jun}
}
```

## Results and models

### Cityscapes

| Method | Backbone | Crop Size | Lr schd | Mem (GB) | Inf time (fps) |  mIoU | mIoU(ms+flip) | config                                                                                                                 | download                                                                                                                                                                                                                                                                                                                               |
| ------ | -------- | --------- | ------: | -------: | -------------- | ----: | ------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FPN    | R-50     | 512x1024  |   80000 |      2.8 | 13.54          | 74.52 | 76.08         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/sem_fpn/fpn_r50_512x1024_80k_cityscapes.py)  | [model](https://download.openmmlab.com/mmsegmentation/v0.5/sem_fpn/fpn_r50_512x1024_80k_cityscapes/fpn_r50_512x1024_80k_cityscapes_20200717_021437-94018a0d.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/sem_fpn/fpn_r50_512x1024_80k_cityscapes/fpn_r50_512x1024_80k_cityscapes-20200717_021437.log.json)     |
| FPN    | R-101    | 512x1024  |   80000 |      3.9 | 10.29          | 75.80 | 77.40         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/sem_fpn/fpn_r101_512x1024_80k_cityscapes.py) | [model](https://download.openmmlab.com/mmsegmentation/v0.5/sem_fpn/fpn_r101_512x1024_80k_cityscapes/fpn_r101_512x1024_80k_cityscapes_20200717_012416-c5800d4c.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/sem_fpn/fpn_r101_512x1024_80k_cityscapes/fpn_r101_512x1024_80k_cityscapes-20200717_012416.log.json) |

### ADE20K

| Method | Backbone | Crop Size | Lr schd | Mem (GB) | Inf time (fps) |  mIoU | mIoU(ms+flip) | config                                                                                                             | download                                                                                                                                                                                                                                                                                                               |
| ------ | -------- | --------- | ------: | -------: | -------------- | ----: | ------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FPN    | R-50     | 512x512   |  160000 |      4.9 | 55.77          | 37.49 | 39.09         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/sem_fpn/fpn_r50_512x512_160k_ade20k.py)  | [model](https://download.openmmlab.com/mmsegmentation/v0.5/sem_fpn/fpn_r50_512x512_160k_ade20k/fpn_r50_512x512_160k_ade20k_20200718_131734-5b5a6ab9.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/sem_fpn/fpn_r50_512x512_160k_ade20k/fpn_r50_512x512_160k_ade20k-20200718_131734.log.json)     |
| FPN    | R-101    | 512x512   |  160000 |      5.9 | 40.58          | 39.35 | 40.72         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/sem_fpn/fpn_r101_512x512_160k_ade20k.py) | [model](https://download.openmmlab.com/mmsegmentation/v0.5/sem_fpn/fpn_r101_512x512_160k_ade20k/fpn_r101_512x512_160k_ade20k_20200718_131734-306b5004.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/sem_fpn/fpn_r101_512x512_160k_ade20k/fpn_r101_512x512_160k_ade20k-20200718_131734.log.json) |
