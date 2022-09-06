# Mixed Precision Training

## Introduction

<!-- [OTHERS] -->

```latex
@article{micikevicius2017mixed,
  title={Mixed precision training},
  author={Micikevicius, Paulius and Narang, Sharan and Alben, Jonah and Diamos, Gregory and Elsen, Erich and Garcia, David and Ginsburg, Boris and Houston, Michael and Kuchaiev, Oleksii and Venkatesh, Ganesh and others},
  journal={arXiv preprint arXiv:1710.03740},
  year={2017}
}
```

## Results and models

### Cityscapes

| Method     | Backbone | Crop Size | Lr schd | Mem (GB) | Inf time (fps) |  mIoU | mIoU(ms+flip) | config                                                                                                                                | download                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | -------- | --------- | ------: | -------- | -------------- | ----: | ------------: | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FCN        | R-101-D8 | 512x1024  |   80000 | 5.37     | 8.64           | 76.80 |             - | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/fp16/fcn_r101-d8_512x1024_80k_fp16_cityscapes.py)           | [model](https://download.openmmlab.com/mmsegmentation/v0.5/fp16/fcn_r101-d8_512x1024_80k_fp16_cityscapes/fcn_r101-d8_512x1024_80k_fp16_cityscapes-50245227.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/fp16/fcn_r101-d8_512x1024_80k_fp16_cityscapes/fcn_r101-d8_512x1024_80k_fp16_cityscapes_20200717_230921.log.json)                                         |
| PSPNet     | R-101-D8 | 512x1024  |   80000 | 5.34     | 8.77           | 79.46 |             - | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/fp16/pspnet_r101-d8_512x1024_80k_fp16_cityscapes.py)        | [model](https://download.openmmlab.com/mmsegmentation/v0.5/fp16/pspnet_r101-d8_512x1024_80k_fp16_cityscapes/pspnet_r101-d8_512x1024_80k_fp16_cityscapes-ade37931.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/fp16/pspnet_r101-d8_512x1024_80k_fp16_cityscapes/pspnet_r101-d8_512x1024_80k_fp16_cityscapes_20200717_230919.log.json)                             |
| DeepLabV3  | R-101-D8 | 512x1024  |   80000 | 5.75     | 3.86           | 80.48 |             - | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/fp16/deeplabv3_r101-d8_512x1024_80k_fp16_cityscapes.py)     | [model](https://download.openmmlab.com/mmsegmentation/v0.5/fp16/deeplabv3_r101-d8_512x1024_80k_fp16_cityscapes/deeplabv3_r101-d8_512x1024_80k_fp16_cityscapes-bc86dc84.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/fp16/deeplabv3_r101-d8_512x1024_80k_fp16_cityscapes/deeplabv3_r101-d8_512x1024_80k_fp16_cityscapes_20200717_230920.log.json)                 |
| DeepLabV3+ | R-101-D8 | 512x1024  |   80000 | 6.35     | 7.87           | 80.46 |             - | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/fp16/deeplabv3plus_r101-d8_512x1024_80k_fp16_cityscapes.py) | [model](https://download.openmmlab.com/mmsegmentation/v0.5/fp16/deeplabv3plus_r101-d8_512x1024_80k_fp16_cityscapes/deeplabv3plus_r101-d8_512x1024_80k_fp16_cityscapes-cc58bc8d.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/fp16/deeplabv3plus_r101-d8_512x1024_80k_fp16_cityscapes/deeplabv3plus_r101-d8_512x1024_80k_fp16_cityscapes_20200717_230920.log.json) |
