import argparse
import os
import os.path as osp
import tempfile
import zipfile

import mmcv

CHASE_DB1_LEN = 28 * 3
TRAINING_LEN = 60


def parse_args():
    parser = argparse.ArgumentParser(
        description='Convert CHASE_DB1 dataset to mmsegmentation format')
    parser.add_argument('dataset_path', help='path of CHASEDB1.zip')
    parser.add_argument('--tmp_dir', help='path of the temporary directory')
    parser.add_argument('-o', '--out_dir', help='output path')
    args = parser.parse_args()
    return args


def main():
    args = parse_args()
    dataset_path = args.dataset_path
    if args.out_dir is None:
        out_dir = osp.join('data', 'CHASE_DB1')
    else:
        out_dir = args.out_dir

    print('Making directories...')
    mmcv.mkdir_or_exist(out_dir)
    mmcv.mkdir_or_exist(osp.join(out_dir, 'images'))
    mmcv.mkdir_or_exist(osp.join(out_dir, 'images', 'training'))
    mmcv.mkdir_or_exist(osp.join(out_dir, 'images', 'validation'))
    mmcv.mkdir_or_exist(osp.join(out_dir, 'annotations'))
    mmcv.mkdir_or_exist(osp.join(out_dir, 'annotations', 'training'))
    mmcv.mkdir_or_exist(osp.join(out_dir, 'annotations', 'validation'))

    with tempfile.TemporaryDirectory(dir=args.tmp_dir) as tmp_dir:
        print('Extracting CHASEDB1.zip...')
        zip_file = zipfile.ZipFile(dataset_path)
        zip_file.extractall(tmp_dir)

        print('Generating training dataset...')

        assert len(os.listdir(tmp_dir)) == CHASE_DB1_LEN, \
            'len(os.listdir(tmp_dir)) != {}'.format(CHASE_DB1_LEN)

        for img_name in sorted(os.listdir(tmp_dir))[:TRAINING_LEN]:
            img = mmcv.imread(osp.join(tmp_dir, img_name))
            if osp.splitext(img_name)[1] == '.jpg':
                mmcv.imwrite(
                    img,
                    osp.join(out_dir, 'images', 'training',
                             osp.splitext(img_name)[0] + '.png'))
            else:
                # The annotation img should be divided by 128, because some of
                # the annotation imgs are not standard. We should set a
                # threshold to convert the nonstandard annotation imgs. The
                # value divided by 128 is equivalent to '1 if value >= 128
                # else 0'
                mmcv.imwrite(
                    img[:, :, 0] // 128,
                    osp.join(out_dir, 'annotations', 'training',
                             osp.splitext(img_name)[0] + '.png'))

        for img_name in sorted(os.listdir(tmp_dir))[TRAINING_LEN:]:
            img = mmcv.imread(osp.join(tmp_dir, img_name))
            if osp.splitext(img_name)[1] == '.jpg':
                mmcv.imwrite(
                    img,
                    osp.join(out_dir, 'images', 'validation',
                             osp.splitext(img_name)[0] + '.png'))
            else:
                mmcv.imwrite(
                    img[:, :, 0] // 128,
                    osp.join(out_dir, 'annotations', 'validation',
                             osp.splitext(img_name)[0] + '.png'))

        print('Removing the temporary files...')

    print('Done!')


if __name__ == '__main__':
    main()
