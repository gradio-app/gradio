from __future__ import annotations

import errno
import itertools
import shlex
import subprocess
from typing import IO, Any, Mapping, Sequence

try:
    from psutil import Popen  # noqa: F401

    popen: type[subprocess.Popen | Popen]
except ImportError:
    popen = subprocess.Popen
else:
    popen = Popen


class FFmpeg:
    """Wrapper for various `FFmpeg <https://www.ffmpeg.org/>`_ related applications (ffmpeg,
    ffprobe).
    """

    def __init__(
        self,
        executable: str = "ffmpeg",
        global_options: Sequence[str] | str | None = None,
        inputs: Mapping[str, Sequence[str] | str | None] | None = None,
        outputs: Mapping[str, Sequence[str] | str | None] | None = None,
    ) -> None:
        """Initialize FFmpeg command line wrapper.

        Compiles FFmpeg command line from passed arguments (executable path, options, inputs and
        outputs). ``inputs`` and ``outputs`` are dictionares containing inputs/outputs as keys and
        their respective options as values. One dictionary value (set of options) must be either a
        single space separated string, or a list or strings without spaces (i.e. each part of the
        option is a separate item of the list, the result of calling ``split()`` on the options
        string). If the value is a list, it cannot be mixed, i.e. cannot contain items with spaces.
        An exception are complex FFmpeg command lines that contain quotes: the quoted part must be
        one string, even if it contains spaces (see *Examples* for more info).
        For more info about FFmpeg command line format see `here
        <https://ffmpeg.org/ffmpeg.html#Synopsis>`_.

        :param str executable: path to ffmpeg executable; by default the ``ffmpeg`` command will be
            searched for in the ``PATH``, but can be overridden with an absolute path to ``ffmpeg``
            executable
        :param iterable global_options: global options passed to ``ffmpeg`` executable (e.g.
            ``-y``, ``-v`` etc.); can be specified either as a list/tuple/set of strings, or one
            space-separated string; by default no global options are passed
        :param dict inputs: a dictionary specifying one or more input arguments as keys with their
            corresponding options (either as a list of strings or a single space separated string) as
            values
        :param dict outputs: a dictionary specifying one or more output arguments as keys with their
            corresponding options (either as a list of strings or a single space separated string) as
            values
        """
        self.executable = executable
        self._cmd = [executable]
        self._cmd += _normalize_options(global_options, split_mixed=True)

        if inputs is not None:
            self._cmd += _merge_args_opts(inputs, add_minus_i_option=True)

        if outputs is not None:
            self._cmd += _merge_args_opts(outputs)

        self.cmd = subprocess.list2cmdline(self._cmd)
        self.process: subprocess.Popen | Popen | None = None

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__!r} {self.cmd!r}>"

    def run(
        self,
        input_data: bytes | None = None,
        stdout: IO | int | None = None,
        stderr: IO | int | None = None,
        env: Mapping[str, str] | None = None,
        **kwargs: Any,
    ) -> tuple[bytes | None, bytes | None]:
        """Execute FFmpeg command line.

        ``input_data`` can contain input for FFmpeg in case ``pipe`` protocol is used for input.
        ``stdout`` and ``stderr`` specify where to redirect the ``stdout`` and ``stderr`` of the
        process. By default no redirection is done, which means all output goes to running shell
        (this mode should normally only be used for debugging purposes). If FFmpeg ``pipe`` protocol
        is used for output, ``stdout`` must be redirected to a pipe by passing `subprocess.PIPE` as
        ``stdout`` argument. You can pass custom environment to ffmpeg process with ``env``.

        Returns a 2-tuple containing ``stdout`` and ``stderr`` of the process. If there was no
        redirection or if the output was redirected to e.g. `os.devnull`, the value returned will
        be a tuple of two `None` values, otherwise it will contain the actual ``stdout`` and
        ``stderr`` data returned by ffmpeg process.

        More info about ``pipe`` protocol `here <https://ffmpeg.org/ffmpeg-protocols.html#pipe>`_.

        :param str input_data: input data for FFmpeg to deal with (audio, video etc.) as bytes (e.g.
            the result of reading a file in binary mode)
        :param stdout: redirect FFmpeg ``stdout`` there (default is `None` which means no
            redirection)
        :param stderr: redirect FFmpeg ``stderr`` there (default is `None` which means no
            redirection)
        :param env: custom environment for ffmpeg process
        :param kwargs: any other keyword arguments to be forwarded to `subprocess.Popen
            <https://docs.python.org/3/library/subprocess.html#subprocess.Popen>`_
        :return: a 2-tuple containing ``stdout`` and ``stderr`` of the process
        :rtype: tuple
        :raise: `FFRuntimeError` in case FFmpeg command exits with a non-zero code;
            `FFExecutableNotFoundError` in case the executable path passed was not valid
        """
        try:
            self.process = popen(
                self._cmd, stdin=subprocess.PIPE, stdout=stdout, stderr=stderr, env=env, **kwargs
            )
        except OSError as e:
            if e.errno == errno.ENOENT:
                raise FFExecutableNotFoundError(f"Executable '{self.executable}' not found")
            else:
                raise

        o_stdout, o_stderr = self.process.communicate(input=input_data)
        if self.process.returncode != 0:
            raise FFRuntimeError(self.cmd, self.process.returncode, o_stdout, o_stderr)

        return o_stdout, o_stderr


class FFprobe(FFmpeg):
    """Wrapper for `ffprobe <https://www.ffmpeg.org/ffprobe.html>`_."""

    def __init__(
        self,
        executable: str = "ffprobe",
        global_options: Sequence[str] | str | None = None,
        inputs: Mapping[str, Sequence[str] | str | None] | None = None,
    ) -> None:
        """Create an instance of FFprobe.

        Compiles FFprobe command line from passed arguments (executable path, options, inputs).
        FFprobe executable by default is taken from ``PATH`` but can be overridden with an
        absolute path. For more info about FFprobe command line format see
        `here <https://ffmpeg.org/ffprobe.html#Synopsis>`_.

        :param str executable: absolute path to ffprobe executable
        :param iterable global_options: global options passed to ffmpeg executable; can be specified
            either as a list/tuple of strings or a space-separated string
        :param dict inputs: a dictionary specifying one or more inputs as keys with their
            corresponding options as values
        """
        super().__init__(executable=executable, global_options=global_options, inputs=inputs)


class FFExecutableNotFoundError(Exception):
    """Raise when FFmpeg/FFprobe executable was not found."""


class FFRuntimeError(Exception):
    """Raise when FFmpeg/FFprobe command line execution returns a non-zero exit code.

    The resulting exception object will contain the attributes relates to command line execution:
    ``cmd``, ``exit_code``, ``stdout``, ``stderr``.
    """

    def __init__(self, cmd: str, exit_code: int, stdout: bytes, stderr: bytes) -> None:
        self.cmd = cmd
        self.exit_code = exit_code
        self.stdout = stdout
        self.stderr = stderr

        message = "`{}` exited with status {}\n\nSTDOUT:\n{}\n\nSTDERR:\n{}".format(
            self.cmd, exit_code, (stdout or b"").decode(), (stderr or b"").decode()
        )

        super().__init__(message)


def _merge_args_opts(
    args_opts_dict: Mapping[str, Sequence[str] | str | None],
    add_minus_i_option: bool = False,
) -> list[str]:
    """Merge options with their corresponding arguments.

    Iterates over the dictionary holding arguments (keys) and options (values). Merges each
    options string with its corresponding argument.

    :param dict args_opts_dict: a dictionary of arguments and options
    :param dict kwargs: *input_option* - if specified prepends ``-i`` to input argument
    :return: merged list of strings with arguments and their corresponding options
    :rtype: list
    """
    merged: list[str] = []

    for arg, opt in args_opts_dict.items():
        merged += _normalize_options(opt)

        if not arg:
            continue

        if add_minus_i_option:
            merged.append("-i")

        merged.append(arg)

    return merged


def _normalize_options(options: Sequence[str] | str | None, split_mixed: bool = False) -> list[str]:
    """Normalize options string or list of strings.

    Splits `options` into a list of strings. If `split_mixed` is `True`, splits (flattens) mixed
    options (i.e. list of strings with spaces) into separate items.

    :param options: options string or list of strings
    :param bool split_mixed: whether to split mixed options into separate items
    """
    if options is None:
        return []
    elif isinstance(options, str):
        return shlex.split(options)
    else:
        if split_mixed:
            return list(itertools.chain(*[shlex.split(o) for o in options]))
        else:
            return list(options)
