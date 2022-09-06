# Fast-SCNN for Semantic Segmentation

## Introduction

<!-- [ALGORITHM] -->

```latex
@article{poudel2019fast,
  title={Fast-scnn: Fast semantic segmentation network},
  author={Poudel, Rudra PK and Liwicki, Stephan and Cipolla, Roberto},
  journal={arXiv preprint arXiv:1902.04502},
  year={2019}
}
```

## Results and models

### Cityscapes

| Method    | Backbone  | Crop Size | Lr schd | Mem (GB) | Inf time (fps) |  mIoU | mIoU(ms+flip) | config                                                                                  | download                                                                                                                                                                                                                                                       |
| --------- | --------- | --------- | ------: | -------- | -------------- | ----: | ------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fast-SCNN | Fast-SCNN | 512x1024  |   80000 | 8.4      | 63.61          | 69.06 | -             | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/fast_scnn.py) | [model](https://download.openmmlab.com/mmsegmentation/v0.5/fast_scnn/fast_scnn_4x8_80k_lr0.12_cityscapes-f5096c79.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/fast_scnn/fast_scnn_4x8_80k_lr0.12_cityscapes-20200807_165744.log.json) |
