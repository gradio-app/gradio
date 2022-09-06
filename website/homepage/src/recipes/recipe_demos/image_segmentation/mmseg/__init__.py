import mmcv

from .version import __version__, version_info

MMCV_MIN = '1.3.1'
MMCV_MAX = '1.4.0'


def digit_version(version_str):
    digit_version = []
    for x in version_str.split('.'):
        if x.isdigit():
            digit_version.append(int(x))
        elif x.find('rc') != -1:
            patch_version = x.split('rc')
            digit_version.append(int(patch_version[0]) - 1)
            digit_version.append(int(patch_version[1]))
    return digit_version


mmcv_min_version = digit_version(MMCV_MIN)
mmcv_max_version = digit_version(MMCV_MAX)
mmcv_version = digit_version(mmcv.__version__)


assert (mmcv_min_version <= mmcv_version <= mmcv_max_version), \
    f'MMCV=={mmcv.__version__} is used but incompatible. ' \
    f'Please install mmcv>={mmcv_min_version}, <={mmcv_max_version}.'

__all__ = ['__version__', 'version_info']
