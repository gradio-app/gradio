# PointRend: Image Segmentation as Rendering

## Introduction

<!-- [ALGORITHM] -->

```
@inproceedings{kirillov2020pointrend,
  title={Pointrend: Image segmentation as rendering},
  author={Kirillov, Alexander and Wu, Yuxin and He, Kaiming and Girshick, Ross},
  booktitle={Proceedings of the IEEE/CVF conference on computer vision and pattern recognition},
  pages={9799--9808},
  year={2020}
}
```

## Results and models

### Cityscapes

| Method    | Backbone | Crop Size | Lr schd | Mem (GB) | Inf time (fps) |  mIoU | mIoU(ms+flip) | config                                                                                                                          | download                                                                                                                                                                                                                                                                                                                                                             |
| --------- | -------- | --------- | ------: | -------: | -------------- | ----: | ------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PointRend | R-50     | 512x1024  |   80000 |      3.1 | 8.48           | 76.47 | 78.13         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/point_rend/pointrend_r50_512x1024_80k_cityscapes.py)  | [model](https://download.openmmlab.com/mmsegmentation/v0.5/point_rend/pointrend_r50_512x1024_80k_cityscapes/pointrend_r50_512x1024_80k_cityscapes_20200711_015821-bb1ff523.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/point_rend/pointrend_r50_512x1024_80k_cityscapes/pointrend_r50_512x1024_80k_cityscapes-20200715_214714.log.json)     |
| PointRend | R-101    | 512x1024  |   80000 |      4.2 | 7.00           | 78.30 | 79.97         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/point_rend/pointrend_r101_512x1024_80k_cityscapes.py) | [model](https://download.openmmlab.com/mmsegmentation/v0.5/point_rend/pointrend_r101_512x1024_80k_cityscapes/pointrend_r101_512x1024_80k_cityscapes_20200711_170850-d0ca84be.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/point_rend/pointrend_r101_512x1024_80k_cityscapes/pointrend_r101_512x1024_80k_cityscapes-20200715_214824.log.json) |

### ADE20K

| Method    | Backbone | Crop Size | Lr schd | Mem (GB) | Inf time (fps) |  mIoU | mIoU(ms+flip) | config                                                                                                                      | download                                                                                                                                                                                                                                                                                                                                             |
| --------- | -------- | --------- | ------: | -------: | -------------- | ----: | ------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PointRend | R-50     | 512x512   |  160000 |      5.1 | 17.31          | 37.64 | 39.17         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/point_rend/pointrend_r50_512x512_160k_ade20k.py)  | [model](https://download.openmmlab.com/mmsegmentation/v0.5/point_rend/pointrend_r50_512x512_160k_ade20k/pointrend_r50_512x512_160k_ade20k_20200807_232644-ac3febf2.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/point_rend/pointrend_r50_512x512_160k_ade20k/pointrend_r50_512x512_160k_ade20k-20200807_232644.log.json)     |
| PointRend | R-101    | 512x512   |  160000 |      6.1 | 15.50          | 40.02 | 41.60         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/point_rend/pointrend_r101_512x512_160k_ade20k.py) | [model](https://download.openmmlab.com/mmsegmentation/v0.5/point_rend/pointrend_r101_512x512_160k_ade20k/pointrend_r101_512x512_160k_ade20k_20200808_030852-8834902a.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/point_rend/pointrend_r101_512x512_160k_ade20k/pointrend_r101_512x512_160k_ade20k-20200808_030852.log.json) |
