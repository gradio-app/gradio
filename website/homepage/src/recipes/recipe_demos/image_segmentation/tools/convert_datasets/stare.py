import argparse
import gzip
import os
import os.path as osp
import tarfile
import tempfile

import mmcv

STARE_LEN = 20
TRAINING_LEN = 10


def un_gz(src, dst):
    g_file = gzip.GzipFile(src)
    with open(dst, 'wb+') as f:
        f.write(g_file.read())
    g_file.close()


def parse_args():
    parser = argparse.ArgumentParser(
        description='Convert STARE dataset to mmsegmentation format')
    parser.add_argument('image_path', help='the path of stare-images.tar')
    parser.add_argument('labels_ah', help='the path of labels-ah.tar')
    parser.add_argument('labels_vk', help='the path of labels-vk.tar')
    parser.add_argument('--tmp_dir', help='path of the temporary directory')
    parser.add_argument('-o', '--out_dir', help='output path')
    args = parser.parse_args()
    return args


def main():
    args = parse_args()
    image_path = args.image_path
    labels_ah = args.labels_ah
    labels_vk = args.labels_vk
    if args.out_dir is None:
        out_dir = osp.join('data', 'STARE')
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
        mmcv.mkdir_or_exist(osp.join(tmp_dir, 'gz'))
        mmcv.mkdir_or_exist(osp.join(tmp_dir, 'files'))

        print('Extracting stare-images.tar...')
        with tarfile.open(image_path) as f:
            f.extractall(osp.join(tmp_dir, 'gz'))

        for filename in os.listdir(osp.join(tmp_dir, 'gz')):
            un_gz(
                osp.join(tmp_dir, 'gz', filename),
                osp.join(tmp_dir, 'files',
                         osp.splitext(filename)[0]))

        now_dir = osp.join(tmp_dir, 'files')

        assert len(os.listdir(now_dir)) == STARE_LEN, \
            'len(os.listdir(now_dir)) != {}'.format(STARE_LEN)

        for filename in sorted(os.listdir(now_dir))[:TRAINING_LEN]:
            img = mmcv.imread(osp.join(now_dir, filename))
            mmcv.imwrite(
                img,
                osp.join(out_dir, 'images', 'training',
                         osp.splitext(filename)[0] + '.png'))

        for filename in sorted(os.listdir(now_dir))[TRAINING_LEN:]:
            img = mmcv.imread(osp.join(now_dir, filename))
            mmcv.imwrite(
                img,
                osp.join(out_dir, 'images', 'validation',
                         osp.splitext(filename)[0] + '.png'))

        print('Removing the temporary files...')

    with tempfile.TemporaryDirectory(dir=args.tmp_dir) as tmp_dir:
        mmcv.mkdir_or_exist(osp.join(tmp_dir, 'gz'))
        mmcv.mkdir_or_exist(osp.join(tmp_dir, 'files'))

        print('Extracting labels-ah.tar...')
        with tarfile.open(labels_ah) as f:
            f.extractall(osp.join(tmp_dir, 'gz'))

        for filename in os.listdir(osp.join(tmp_dir, 'gz')):
            un_gz(
                osp.join(tmp_dir, 'gz', filename),
                osp.join(tmp_dir, 'files',
                         osp.splitext(filename)[0]))

        now_dir = osp.join(tmp_dir, 'files')

        assert len(os.listdir(now_dir)) == STARE_LEN, \
            'len(os.listdir(now_dir)) != {}'.format(STARE_LEN)

        for filename in sorted(os.listdir(now_dir))[:TRAINING_LEN]:
            img = mmcv.imread(osp.join(now_dir, filename))
            # The annotation img should be divided by 128, because some of
            # the annotation imgs are not standard. We should set a threshold
            # to convert the nonstandard annotation imgs. The value divided by
            # 128 equivalent to '1 if value >= 128 else 0'
            mmcv.imwrite(
                img[:, :, 0] // 128,
                osp.join(out_dir, 'annotations', 'training',
                         osp.splitext(filename)[0] + '.png'))

        for filename in sorted(os.listdir(now_dir))[TRAINING_LEN:]:
            img = mmcv.imread(osp.join(now_dir, filename))
            mmcv.imwrite(
                img[:, :, 0] // 128,
                osp.join(out_dir, 'annotations', 'validation',
                         osp.splitext(filename)[0] + '.png'))

        print('Removing the temporary files...')

    with tempfile.TemporaryDirectory(dir=args.tmp_dir) as tmp_dir:
        mmcv.mkdir_or_exist(osp.join(tmp_dir, 'gz'))
        mmcv.mkdir_or_exist(osp.join(tmp_dir, 'files'))

        print('Extracting labels-vk.tar...')
        with tarfile.open(labels_vk) as f:
            f.extractall(osp.join(tmp_dir, 'gz'))

        for filename in os.listdir(osp.join(tmp_dir, 'gz')):
            un_gz(
                osp.join(tmp_dir, 'gz', filename),
                osp.join(tmp_dir, 'files',
                         osp.splitext(filename)[0]))

        now_dir = osp.join(tmp_dir, 'files')

        assert len(os.listdir(now_dir)) == STARE_LEN, \
            'len(os.listdir(now_dir)) != {}'.format(STARE_LEN)

        for filename in sorted(os.listdir(now_dir))[:TRAINING_LEN]:
            img = mmcv.imread(osp.join(now_dir, filename))
            mmcv.imwrite(
                img[:, :, 0] // 128,
                osp.join(out_dir, 'annotations', 'training',
                         osp.splitext(filename)[0] + '.png'))

        for filename in sorted(os.listdir(now_dir))[TRAINING_LEN:]:
            img = mmcv.imread(osp.join(now_dir, filename))
            mmcv.imwrite(
                img[:, :, 0] // 128,
                osp.join(out_dir, 'annotations', 'validation',
                         osp.splitext(filename)[0] + '.png'))

        print('Removing the temporary files...')

    print('Done!')


if __name__ == '__main__':
    main()
