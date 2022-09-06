# Expectation-Maximization Attention Networks for Semantic Segmentation

## Introduction

<!-- [ALGORITHM] -->

```latex
@inproceedings{li2019expectation,
  title={Expectation-maximization attention networks for semantic segmentation},
  author={Li, Xia and Zhong, Zhisheng and Wu, Jianlong and Yang, Yibo and Lin, Zhouchen and Liu, Hong},
  booktitle={Proceedings of the IEEE International Conference on Computer Vision},
  pages={9167--9176},
  year={2019}
}
```

## Results and models

### Cityscapes

| Method | Backbone | Crop Size | Lr schd | Mem (GB) | Inf time (fps) |  mIoU | mIoU(ms+flip) | config                                                                                                                      | download                                                                                                                                                                                                                                                                                                                                                     |
| ------ | -------- | --------- | ------: | -------: | -------------- | ----: | ------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| EMANet | R-50-D8  | 512x1024  |   80000 |      5.4 | 4.58           | 77.59 | 79.44         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/emanet/emanet_r50-d8_512x1024_80k_cityscapes.py)  | [model](https://download.openmmlab.com/mmsegmentation/v0.5/emanet/emanet_r50-d8_512x1024_80k_cityscapes/emanet_r50-d8_512x1024_80k_cityscapes_20200901_100301-c43fcef1.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/emanet/emanet_r50-d8_512x1024_80k_cityscapes/emanet_r50-d8_512x1024_80k_cityscapes-20200901_100301.log.json)     |
| EMANet | R-101-D8 | 512x1024  |   80000 |      6.2 | 2.87           | 79.10 | 81.21         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/emanet/emanet_r101-d8_512x1024_80k_cityscapes.py) | [model](https://download.openmmlab.com/mmsegmentation/v0.5/emanet/emanet_r101-d8_512x1024_80k_cityscapes/emanet_r101-d8_512x1024_80k_cityscapes_20200901_100301-2d970745.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/emanet/emanet_r101-d8_512x1024_80k_cityscapes/emanet_r101-d8_512x1024_80k_cityscapes-20200901_100301.log.json) |
| EMANet | R-50-D8  | 769x769   |   80000 |      8.9 | 1.97           | 79.33 | 80.49         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/emanet/emanet_r50-d8_769x769_80k_cityscapes.py)   | [model](https://download.openmmlab.com/mmsegmentation/v0.5/emanet/emanet_r50-d8_769x769_80k_cityscapes/emanet_r50-d8_769x769_80k_cityscapes_20200901_100301-16f8de52.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/emanet/emanet_r50-d8_769x769_80k_cityscapes/emanet_r50-d8_769x769_80k_cityscapes-20200901_100301.log.json)         |
| EMANet | R-101-D8 | 769x769   |   80000 |     10.1 | 1.22           | 79.62 | 81.00         | [config](https://github.com/open-mmlab/mmsegmentation/blob/master/configs/emanet/emanet_r101-d8_769x769_80k_cityscapes.py)  | [model](https://download.openmmlab.com/mmsegmentation/v0.5/emanet/emanet_r101-d8_769x769_80k_cityscapes/emanet_r101-d8_769x769_80k_cityscapes_20200901_100301-47a324ce.pth) &#124; [log](https://download.openmmlab.com/mmsegmentation/v0.5/emanet/emanet_r101-d8_769x769_80k_cityscapes/emanet_r101-d8_769x769_80k_cityscapes-20200901_100301.log.json)     |
