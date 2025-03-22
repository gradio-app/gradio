import asyncio
import os
import shutil
import tempfile
import traceback


async def process_video_with_ffmpeg(input_path, output_path, params):
    """Process a video with ffmpeg based on the provided parameters."""
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

                    if process.returncode != 0:
                        print(f"FFmpeg before segment error: {stderr.decode()}")

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

                if process.returncode != 0:
                    print(f"FFmpeg after segment error: {stderr.decode()}")

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

                    if process.returncode != 0:
                        print(f"FFmpeg concat error: {stderr.decode()}")
                    else:
                        current_input = segment_output

                for file in [before_segment, after_segment, concat_file]:
                    try:
                        if os.path.exists(file):
                            os.unlink(file)
                    except:
                        pass
        if not current_input.endswith(".webm"):
            final_webm = output_path
            cmd = [
                "ffmpeg",
                "-y",
                "-i",
                current_input,
                "-c:v",
                "libvpx-vp9",
                "-crf",
                "30",
                "-b:v",
                "0",
                "-c:a",
                "libopus",
                final_webm,
            ]

            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                print(f"FFmpeg final conversion error: {stderr.decode()}")
                shutil.copy(current_input, final_webm)

            current_input = final_webm
    except Exception as e:
        print(f"Error in process_video_with_ffmpeg: {str(e)}")
        traceback.print_exc()
        return input_path, temp_files
