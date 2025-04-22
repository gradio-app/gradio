import asyncio
import os
import shutil
import tempfile
import traceback


async def process_video_with_ffmpeg(input_path, output_path, params):
    current_input = input_path
    temp_files = [input_path]

    try:
        if params.get("remove_segment_start") and params.get("remove_segment_end"):
            start = float(params["remove_segment_start"])
            end = float(params["remove_segment_end"])

            if start < end:
                segment_output = tempfile.mktemp(suffix="_trimmed.mp4")
                before_segment = tempfile.mktemp(suffix="_before.mp4")
                after_segment = tempfile.mktemp(suffix="_after.mp4")

                temp_files.extend([segment_output, before_segment, after_segment])

                if start > 0:
                    cmd_before = [
                        "ffmpeg",
                        "-y",
                        "-i",
                        current_input,
                        "-t",
                        str(start),
                        "-c:v",
                        "libx264",
                        "-preset",
                        "fast",
                        "-crf",
                        "22",
                        "-c:a",
                        "aac",
                        before_segment,
                    ]

                    process = await asyncio.create_subprocess_exec(
                        *cmd_before,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE,
                    )
                    stdout, stderr = await process.communicate()

                cmd_after = [
                    "ffmpeg",
                    "-y",
                    "-i",
                    current_input,
                    "-ss",
                    str(end),
                    "-c:v",
                    "libx264",
                    "-preset",
                    "fast",
                    "-crf",
                    "22",
                    "-c:a",
                    "aac",
                    after_segment,
                ]

                process = await asyncio.create_subprocess_exec(
                    *cmd_after,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                stdout, stderr = await process.communicate()

                concat_file = tempfile.mktemp(suffix="_concat.txt")
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
                    cmd_concat = [
                        "ffmpeg",
                        "-y",
                        "-f",
                        "concat",
                        "-safe",
                        "0",
                        "-i",
                        concat_file,
                        "-c",
                        "copy",
                        segment_output,
                    ]

                    process = await asyncio.create_subprocess_exec(
                        *cmd_concat,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE,
                    )
                    stdout, stderr = await process.communicate()

                    current_input = segment_output

                for file in [before_segment, after_segment, concat_file]:
                    try:
                        if os.path.exists(file):
                            os.unlink(file)
                    except:
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

                    temp_output = tempfile.mktemp(suffix=f"_zoom_{i}.mp4")

                    zoom_output, zoom_temp_files = await zoom_in(
                        current_input, top_left, bottom_right, duration, start_frame
                    )

                    temp_files.extend(zoom_temp_files)
                    if zoom_output and zoom_output != current_input:
                        if current_input not in [input_path]:
                            temp_files.append(current_input)
                        current_input = zoom_output
        elif (
            params.get("zoom_top_left_x")
            and params.get("zoom_top_left_y")
            and params.get("zoom_bottom_right_x")
            and params.get("zoom_bottom_right_y")
        ):
            try:
                zoom_top_left = [
                    float(params.get("zoom_top_left_x")),
                    float(params.get("zoom_top_left_y")),
                ]
                zoom_bottom_right = [
                    float(params.get("zoom_bottom_right_x")),
                    float(params.get("zoom_bottom_right_y")),
                ]
                zoom_duration = float(params.get("zoom_duration", 2.0))
                zoom_start_frame = params.get("zoom_start_frame")

                zoom_output, zoom_temp_files = await zoom_in(
                    current_input,
                    zoom_top_left,
                    zoom_bottom_right,
                    zoom_duration,
                    zoom_start_frame,
                )

                if zoom_output and zoom_output != current_input:
                    if current_input not in [input_path]:
                        temp_files.append(current_input)
                    current_input = zoom_output
                    temp_files.extend(zoom_temp_files)
            except Exception:
                traceback.print_exc()

        final_mp4 = output_path
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            current_input,
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "22",
            "-c:a",
            "aac",
            final_mp4,
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            shutil.copy(current_input, final_mp4)

        current_input = final_mp4
        return current_input, temp_files

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

        box_center_x = (x1 + x2) / 2
        box_center_y = (y1 + y2) / 2

        dynamic_max_zoom = 2.0

        x_expr = f"iw/2-(iw/2-iw*{box_center_x})/zoom"
        y_expr = f"ih/2-(ih/2-ih*{box_center_y})/zoom"

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

        zoom_duration = min(float(zoom_duration), video_duration)
        zoom_output = tempfile.mktemp(suffix="_zoomed.mp4")
        temp_files.append(zoom_output)

        zoom_in_frames = 15
        zoom_out_frames = 15
        hold_frames = int(zoom_duration * 30)

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
            f"x='{x_expr}':"
            f"y='{y_expr}':"
            f"d=0:"
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
