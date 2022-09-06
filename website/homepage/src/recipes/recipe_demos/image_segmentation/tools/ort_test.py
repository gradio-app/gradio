import argparse
import os
import os.path as osp
import warnings

import mmcv
import numpy as np
import onnxruntime as ort
import torch
from mmcv.parallel import MMDataParallel
from mmcv.runner import get_dist_info
from mmcv.utils import DictAction

from mmseg.apis import single_gpu_test
from mmseg.datasets import build_dataloader, build_dataset
from mmseg.models.segmentors.base import BaseSegmentor


class ONNXRuntimeSegmentor(BaseSegmentor):

    def __init__(self, onnx_file, cfg, device_id):
        super(ONNXRuntimeSegmentor, self).__init__()
        # get the custom op path
        ort_custom_op_path = ''
        try:
            from mmcv.ops import get_onnxruntime_op_path
            ort_custom_op_path = get_onnxruntime_op_path()
        except (ImportError, ModuleNotFoundError):
            warnings.warn('If input model has custom op from mmcv, \
                you may have to build mmcv with ONNXRuntime from source.')
        session_options = ort.SessionOptions()
        # register custom op for onnxruntime
        if osp.exists(ort_custom_op_path):
            session_options.register_custom_ops_library(ort_custom_op_path)
        sess = ort.InferenceSession(onnx_file, session_options)
        providers = ['CPUExecutionProvider']
        options = [{}]
        is_cuda_available = ort.get_device() == 'GPU'
        if is_cuda_available:
            providers.insert(0, 'CUDAExecutionProvider')
            options.insert(0, {'device_id': device_id})

        sess.set_providers(providers, options)

        self.sess = sess
        self.device_id = device_id
        self.io_binding = sess.io_binding()
        self.output_names = [_.name for _ in sess.get_outputs()]
        for name in self.output_names:
            self.io_binding.bind_output(name)
        self.cfg = cfg
        self.test_mode = cfg.model.test_cfg.mode

    def extract_feat(self, imgs):
        raise NotImplementedError('This method is not implemented.')

    def encode_decode(self, img, img_metas):
        raise NotImplementedError('This method is not implemented.')

    def forward_train(self, imgs, img_metas, **kwargs):
        raise NotImplementedError('This method is not implemented.')

    def simple_test(self, img, img_meta, **kwargs):
        device_type = img.device.type
        self.io_binding.bind_input(
            name='input',
            device_type=device_type,
            device_id=self.device_id,
            element_type=np.float32,
            shape=img.shape,
            buffer_ptr=img.data_ptr())
        self.sess.run_with_iobinding(self.io_binding)
        seg_pred = self.io_binding.copy_outputs_to_cpu()[0]
        # whole might support dynamic reshape
        ori_shape = img_meta[0]['ori_shape']
        if not (ori_shape[0] == seg_pred.shape[-2]
                and ori_shape[1] == seg_pred.shape[-1]):
            seg_pred = torch.from_numpy(seg_pred).float()
            seg_pred = torch.nn.functional.interpolate(
                seg_pred, size=tuple(ori_shape[:2]), mode='nearest')
            seg_pred = seg_pred.long().detach().cpu().numpy()
        seg_pred = seg_pred[0]
        seg_pred = list(seg_pred)
        return seg_pred

    def aug_test(self, imgs, img_metas, **kwargs):
        raise NotImplementedError('This method is not implemented.')


def parse_args():
    parser = argparse.ArgumentParser(
        description='mmseg onnxruntime backend test (and eval) a model')
    parser.add_argument('config', help='test config file path')
    parser.add_argument('model', help='Input model file')
    parser.add_argument('--out', help='output result file in pickle format')
    parser.add_argument(
        '--format-only',
        action='store_true',
        help='Format the output results without perform evaluation. It is'
        'useful when you want to format the result to a specific format and '
        'submit it to the test server')
    parser.add_argument(
        '--eval',
        type=str,
        nargs='+',
        help='evaluation metrics, which depends on the dataset, e.g., "mIoU"'
        ' for generic datasets, and "cityscapes" for Cityscapes')
    parser.add_argument('--show', action='store_true', help='show results')
    parser.add_argument(
        '--show-dir', help='directory where painted images will be saved')
    parser.add_argument(
        '--options', nargs='+', action=DictAction, help='custom options')
    parser.add_argument(
        '--eval-options',
        nargs='+',
        action=DictAction,
        help='custom options for evaluation')
    parser.add_argument(
        '--opacity',
        type=float,
        default=0.5,
        help='Opacity of painted segmentation map. In (0, 1] range.')
    parser.add_argument('--local_rank', type=int, default=0)
    args = parser.parse_args()
    if 'LOCAL_RANK' not in os.environ:
        os.environ['LOCAL_RANK'] = str(args.local_rank)
    return args


def main():
    args = parse_args()

    assert args.out or args.eval or args.format_only or args.show \
        or args.show_dir, \
        ('Please specify at least one operation (save/eval/format/show the '
         'results / save the results) with the argument "--out", "--eval"'
         ', "--format-only", "--show" or "--show-dir"')

    if args.eval and args.format_only:
        raise ValueError('--eval and --format_only cannot be both specified')

    if args.out is not None and not args.out.endswith(('.pkl', '.pickle')):
        raise ValueError('The output file must be a pkl file.')

    cfg = mmcv.Config.fromfile(args.config)
    if args.options is not None:
        cfg.merge_from_dict(args.options)
    cfg.model.pretrained = None
    cfg.data.test.test_mode = True

    # init distributed env first, since logger depends on the dist info.
    distributed = False

    # build the dataloader
    # TODO: support multiple images per gpu (only minor changes are needed)
    dataset = build_dataset(cfg.data.test)
    data_loader = build_dataloader(
        dataset,
        samples_per_gpu=1,
        workers_per_gpu=cfg.data.workers_per_gpu,
        dist=distributed,
        shuffle=False)

    # load onnx config and meta
    cfg.model.train_cfg = None
    model = ONNXRuntimeSegmentor(args.model, cfg=cfg, device_id=0)
    model.CLASSES = dataset.CLASSES
    model.PALETTE = dataset.PALETTE

    efficient_test = False
    if args.eval_options is not None:
        efficient_test = args.eval_options.get('efficient_test', False)

    model = MMDataParallel(model, device_ids=[0])
    outputs = single_gpu_test(model, data_loader, args.show, args.show_dir,
                              efficient_test, args.opacity)

    rank, _ = get_dist_info()
    if rank == 0:
        if args.out:
            print(f'\nwriting results to {args.out}')
            mmcv.dump(outputs, args.out)
        kwargs = {} if args.eval_options is None else args.eval_options
        if args.format_only:
            dataset.format_results(outputs, **kwargs)
        if args.eval:
            dataset.evaluate(outputs, args.eval, **kwargs)


if __name__ == '__main__':
    main()
