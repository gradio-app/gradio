import asyncio
import os
import shutil
import tempfile
import traceback
from pathlib import Path

DEFAULT_TEMP_DIR = os.environ.get("GRADIO_TEMP_DIR") or str(
    Path(tempfile.gettempdir()) / "gradio"
)


async def process_video_with_ffmpeg(input_path, output_path, params):
    from ffmpy import FFmpeg

    current_input = input_path
    temp_files = [input_path]

    try:
        if params.get("remove_segment_start") and params.get("remove_segment_end"):
            start = float(params["remove_segment_start"])
            end = float(params["remove_segment_end"])

            if start < end:
                segment_output = tempfile.mkstemp(
                    suffix="_trimmed.mp4", dir=DEFAULT_TEMP_DIR
                )[1]
                before_segment = tempfile.mkstemp(
                    suffix="_before.mp4", dir=DEFAULT_TEMP_DIR
                )[1]
                after_segment = tempfile.mkstemp(
                    suffix="_after.mp4", dir=DEFAULT_TEMP_DIR
                )[1]

                temp_files.extend([segment_output, before_segment, after_segment])

                if start > 0:
                    ff = FFmpeg(
                        inputs={current_input: None},
                        outputs={
                            before_segment: f"-t {start} -c:v libx264 -preset fast -crf 22 -c:a aac -r 30 -y"
                        },
                    )
                    process = await asyncio.create_subprocess_exec(
                        *ff.cmd.split(),
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE,
                    )
                    stdout, stderr = await process.communicate()

                ff = FFmpeg(
                    inputs={current_input: None},
                    outputs={
                        after_segment: f"-ss {end} -c:v libx264 -preset fast -crf 22 -c:a aac -r 30 -y"
                    },
                )
                process = await asyncio.create_subprocess_exec(
                    *ff.cmd.split(),
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                stdout, stderr = await process.communicate()

                concat_file = tempfile.mkstemp(
                    suffix="_concat.txt", dir=DEFAULT_TEMP_DIR
                )[1]
                temp_files.append(concat_file)

                with open(concat_file, "w") as f:
                    if (
                        start > 0
                        and os.path.exists(before_segment)
                        and os.path.getsize(before_segment) > 0
                    ):
                        f.write(f"file '{before_segment}'\n")
                    if (
                        os.path.exists(after_segment)
                        and os.path.getsize(after_segment) > 0
                    ):
                        f.write(f"file '{after_segment}'\n")

                if os.path.exists(concat_file) and os.path.getsize(concat_file) > 0:
                    ff = FFmpeg(
                        inputs={concat_file: "-f concat -safe 0"},
                        outputs={segment_output: "-c copy -y"},
                    )
                    process = await asyncio.create_subprocess_exec(
                        *ff.cmd.split(),
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE,
                    )
                    stdout, stderr = await process.communicate()

                    current_input = segment_output

                for file in [before_segment, after_segment, concat_file]:
                    try:
                        if os.path.exists(file):
                            os.unlink(file)
                    except OSError:
                        pass

        if "zoom_effects" in params and params["zoom_effects"]:
            zoom_effects = params["zoom_effects"]
            for i, effect in enumerate(zoom_effects):
                if (
                    effect.get("boundingBox")
                    and effect["boundingBox"].get("topLeft")
                    and effect["boundingBox"].get("bottomRight")
                ):
                    top_left = effect["boundingBox"]["topLeft"]
                    bottom_right = effect["boundingBox"]["bottomRight"]
                    start_frame = effect.get("start_frame")
                    duration = effect.get("duration", 2.0)

                    zoom_output = tempfile.mkstemp(
                        suffix=f"_zoom_{i}.mp4", dir=DEFAULT_TEMP_DIR
                    )[1]
                    temp_files.append(zoom_output)

                    zoom_output, zoom_temp_files = await zoom_in(
                        current_input, top_left, bottom_right, duration, start_frame
                    )

                    temp_files.extend(zoom_temp_files)
                    if zoom_output and zoom_output != current_input:
                        if current_input not in [input_path]:
                            temp_files.append(current_input)
                        current_input = zoom_output

        ff = FFmpeg(
            inputs={current_input: None},
            outputs={
                output_path: "-c:v libx264 -preset fast -crf 22 -c:a aac -r 30 -vsync cfr -y"
            },
        )
        process = await asyncio.create_subprocess_exec(
            *ff.cmd.split(),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            shutil.copy(current_input, output_path)

        current_input = output_path
        final_trimmed_output = tempfile.mkstemp(
            suffix="_final_trimmed.mp4", dir=DEFAULT_TEMP_DIR
        )[1]
        temp_files.append(final_trimmed_output)

        ff = FFmpeg(
            inputs={current_input: None},
            outputs={
                final_trimmed_output: "-ss 0.5 -c:v libx264 -preset fast -crf 22 -c:a aac -r 30 -y"
            },
        )
        process = await asyncio.create_subprocess_exec(
            *ff.cmd.split(),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        if (
            process.returncode == 0
            and os.path.exists(final_trimmed_output)
            and os.path.getsize(final_trimmed_output) > 0
        ):
            shutil.copy(final_trimmed_output, output_path)
            temp_files.append(final_trimmed_output)

        return output_path, temp_files

    except Exception:
        traceback.print_exc()
        return input_path, temp_files


async def zoom_in(
    input_path,
    top_left=None,
    bottom_right=None,
    zoom_duration=2.0,
    zoom_start_frame=None,
):
    from ffmpy import FFmpeg

    temp_files = []

    try:
        if not input_path or not os.path.exists(input_path):
            return input_path, temp_files

        if zoom_start_frame is None:
            zoom_start_frame = 60
        else:
            try:
                zoom_start_frame = float(zoom_start_frame)
            except (ValueError, TypeError):
                zoom_start_frame = 60

        if top_left is None:
            top_left = [0.25, 0.25]

        if bottom_right is None:
            bottom_right = [0.75, 0.75]

        try:
            x1, y1 = float(top_left[0]), float(top_left[1])
            x2, y2 = float(bottom_right[0]), float(bottom_right[1])
        except (TypeError, ValueError, IndexError):
            x1, y1 = 0.25, 0.25
            x2, y2 = 0.75, 0.75

        x1 = max(0.0, min(0.9, x1))
        y1 = max(0.0, min(0.9, y1))
        x2 = max(0.1, min(1.0, x2))
        y2 = max(0.1, min(1.0, y2))

        if x2 <= x1:
            x1, x2 = 0.25, 0.75
        if y2 <= y1:
            y1, y2 = 0.25, 0.75

        box_width = x2 - x1
        box_height = y2 - y1

        box_center_x = (x1 + x2) / 2
        box_center_y = (y1 + y2) / 2

        def calculate_proportional_offset(center, size):
            if center < 0.5:
                distance_from_center = 0.5 - center
                return center - (size * (distance_from_center / 0.5))
            elif center > 0.5:
                distance_from_center = center - 0.5
                return center + (size * (distance_from_center / 0.5))
            return center

        zoom_center_x = calculate_proportional_offset(box_center_x, box_width)
        zoom_center_y = calculate_proportional_offset(box_center_y, box_height)

        target_zoom = 3.0
        max_zoom_by_size = min(1.0 / box_width, 1.0 / box_height)

        safety_margin = 0.9
        max_zoom_by_size = max_zoom_by_size * safety_margin

        dynamic_max_zoom = min(max_zoom_by_size, target_zoom)
        dynamic_max_zoom = max(dynamic_max_zoom, 1.3)

        duration_cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{input_path}"'

        process = await asyncio.create_subprocess_shell(
            duration_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        try:
            output = stdout.decode().strip()
            video_duration = float(output)
        except (ValueError, TypeError):
            video_duration = 10.0

        fps = 30.0
        zoom_duration = min(float(zoom_duration), video_duration)
        zoom_output = tempfile.mkstemp(suffix="_zoomed.mp4", dir=DEFAULT_TEMP_DIR)[1]
        temp_files.append(zoom_output)
        zoom_in_frames = int(fps / 2)
        zoom_out_frames = int(fps / 2)
        hold_frames = int(zoom_duration * fps)

        width, height = 1920, 1080

        complex_filter = (
            f"[0:v]zoompan="
            f"z='if(between(on,{zoom_start_frame},{zoom_start_frame + zoom_in_frames + hold_frames + zoom_out_frames}),"
            f"if(lt(on-{zoom_start_frame},{zoom_in_frames}),"
            f"1+(({dynamic_max_zoom}-1)*(on-{zoom_start_frame})/{zoom_in_frames}),"
            f"if(lt(on-{zoom_start_frame},{zoom_in_frames + hold_frames}),"
            f"{dynamic_max_zoom},"
            f"{dynamic_max_zoom}-(({dynamic_max_zoom}-1)*((on-{zoom_start_frame}-{zoom_in_frames}-{hold_frames}))/{zoom_out_frames})"
            f")),1)':"
            f"x='iw*{zoom_center_x}-iw/zoom*{zoom_center_x}':"
            f"y='ih*{zoom_center_y}-ih/zoom*{zoom_center_y}':"
            f"d=1:"
            f"fps={fps}:"
            f"s={width}x{height}[outv]"
        )

        ff = FFmpeg(
            inputs={input_path: None},
            outputs={
                zoom_output: (
                    f'-filter_complex "{complex_filter}" '
                    f'-map "[outv]" '
                    f"-map 0:a? "
                    f"-c:v libx264 "
                    f"-pix_fmt yuv420p "
                    f"-movflags +faststart "
                    f"-preset fast "
                    f"-r 30 "
                    f"-c:a aac "
                    f"-y"
                )
            },
        )

        cmd_parts = ff.cmd.split()
        process = await asyncio.create_subprocess_exec(
            *cmd_parts,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            return input_path, temp_files

        return zoom_output, temp_files

    except Exception:
        traceback.print_exc()
        return input_path, temp_files
