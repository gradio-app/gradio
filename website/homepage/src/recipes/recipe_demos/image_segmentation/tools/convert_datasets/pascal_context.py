import argparse
import os.path as osp
from functools import partial

import mmcv
import numpy as np
from detail import Detail
from PIL import Image

_mapping = np.sort(
    np.array([
        0, 2, 259, 260, 415, 324, 9, 258, 144, 18, 19, 22, 23, 397, 25, 284,
        158, 159, 416, 33, 162, 420, 454, 295, 296, 427, 44, 45, 46, 308, 59,
        440, 445, 31, 232, 65, 354, 424, 68, 326, 72, 458, 34, 207, 80, 355,
        85, 347, 220, 349, 360, 98, 187, 104, 105, 366, 189, 368, 113, 115
    ]))
_key = np.array(range(len(_mapping))).astype('uint8')


def generate_labels(img_id, detail, out_dir):

    def _class_to_index(mask, _mapping, _key):
        # assert the values
        values = np.unique(mask)
        for i in range(len(values)):
            assert (values[i] in _mapping)
        index = np.digitize(mask.ravel(), _mapping, right=True)
        return _key[index].reshape(mask.shape)

    mask = Image.fromarray(
        _class_to_index(detail.getMask(img_id), _mapping=_mapping, _key=_key))
    filename = img_id['file_name']
    mask.save(osp.join(out_dir, filename.replace('jpg', 'png')))
    return osp.splitext(osp.basename(filename))[0]


def parse_args():
    parser = argparse.ArgumentParser(
        description='Convert PASCAL VOC annotations to mmsegmentation format')
    parser.add_argument('devkit_path', help='pascal voc devkit path')
    parser.add_argument('json_path', help='annoation json filepath')
    parser.add_argument('-o', '--out_dir', help='output path')
    args = parser.parse_args()
    return args


def main():
    args = parse_args()
    devkit_path = args.devkit_path
    if args.out_dir is None:
        out_dir = osp.join(devkit_path, 'VOC2010', 'SegmentationClassContext')
    else:
        out_dir = args.out_dir
    json_path = args.json_path
    mmcv.mkdir_or_exist(out_dir)
    img_dir = osp.join(devkit_path, 'VOC2010', 'JPEGImages')

    train_detail = Detail(json_path, img_dir, 'train')
    train_ids = train_detail.getImgs()

    val_detail = Detail(json_path, img_dir, 'val')
    val_ids = val_detail.getImgs()

    mmcv.mkdir_or_exist(
        osp.join(devkit_path, 'VOC2010/ImageSets/SegmentationContext'))

    train_list = mmcv.track_progress(
        partial(generate_labels, detail=train_detail, out_dir=out_dir),
        train_ids)
    with open(
            osp.join(devkit_path, 'VOC2010/ImageSets/SegmentationContext',
                     'train.txt'), 'w') as f:
        f.writelines(line + '\n' for line in sorted(train_list))

    val_list = mmcv.track_progress(
        partial(generate_labels, detail=val_detail, out_dir=out_dir), val_ids)
    with open(
            osp.join(devkit_path, 'VOC2010/ImageSets/SegmentationContext',
                     'val.txt'), 'w') as f:
        f.writelines(line + '\n' for line in sorted(val_list))

    print('Done!')


if __name__ == '__main__':
    main()
