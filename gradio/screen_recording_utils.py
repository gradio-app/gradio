import asyncio
import json
import math
import os
import shutil
import tempfile
import traceback

async def process_video_with_ffmpeg(input_path, output_path, params):
    """Process a video with ffmpeg based on the provided parameters."""
    # Start with the input file
    current_input = input_path
    temp_files = [input_path]

    try:
        # Apply segment removal if specified
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

        # Apply zoom effects if specified
        if params.get("zoom_effects"):
            try:
                zoom_effects_data = json.loads(params["zoom_effects"]) if isinstance(params["zoom_effects"], str) else params["zoom_effects"]

                if zoom_effects_data:
                    for i, effect in enumerate(zoom_effects_data):
                        try:
                            start_time = float(effect["startTime"])
                            end_time = float(effect["endTime"])
                            start_zoom = float(effect.get("startZoom", 1.0))
                            end_zoom = float(effect.get("endZoom", 1.3))
                            center_x = float(effect.get("centerX", 0.5))
                            center_y = float(effect.get("centerY", 0.5))

                            if start_time >= end_time or end_time <= 0:
                                continue

                            zoom_output = tempfile.mktemp(suffix=f"_zoom_{i}.mp4")
                            before_segment = tempfile.mktemp(suffix=f"_before_{i}.mp4")
                            zoom_segment = tempfile.mktemp(suffix=f"_zoom_segment_{i}.mp4")
                            after_segment = tempfile.mktemp(suffix=f"_after_{i}.mp4")
                            concat_file = tempfile.mktemp(suffix=f"_concat_{i}.txt")

                            temp_files.extend([
                                zoom_output,
                                before_segment,
                                zoom_segment,
                                after_segment,
                                concat_file,
                            ])

                            if start_time > 0:
                                cmd_before = [
                                    "ffmpeg",
                                    "-y",
                                    "-i",
                                    current_input,
                                    "-ss",
                                    "0",
                                    "-to",
                                    str(start_time),
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

                            # Try a different approach for extracting the segment
                            # Use a longer minimum duration to ensure valid output
                            actual_start = max(0, start_time - 0.5)  # Start 0.5s earlier if possible
                            actual_end = min(end_time + 0.5, float('inf'))  # End 0.5s later

                            cmd_extract = [
                                "ffmpeg",
                                "-y",
                                "-i",
                                current_input,
                                "-ss",
                                str(actual_start),
                                "-to", 
                                str(actual_end),
                                "-c:v",
                                "copy",  # Use copy instead of re-encoding for more reliable extraction
                                "-c:a",
                                "copy",
                                zoom_segment,
                            ]

                            process = await asyncio.create_subprocess_exec(
                                *cmd_extract,
                                stdout=asyncio.subprocess.PIPE,
                                stderr=asyncio.subprocess.PIPE,
                            )
                            stdout, stderr = await process.communicate()

                            # If extraction fails or file is empty, skip this effect
                            if process.returncode != 0 or not os.path.exists(zoom_segment) or os.path.getsize(zoom_segment) == 0:
                                print(f"Failed to extract valid segment for effect {i + 1}, skipping")
                                continue

                            # Skip the ffprobe check and try to apply the zoom directly
                            zoomed_segment = tempfile.mktemp(suffix=f"_zoomed_{i}.mp4")
                            temp_files.append(zoomed_segment)

                            zoom_factor = (start_zoom + end_zoom) / 2

                            # Apply zoom with more error handling
                            try:
                                cmd_zoom = [
                                    "ffmpeg",
                                    "-y",
                                    "-i",
                                    zoom_segment,
                                    "-vf",
                                    f"scale=iw*{zoom_factor}:-1,crop=iw/{zoom_factor}:ih/{zoom_factor}:(iw*{zoom_factor}-iw)*{center_x}:(ih*{zoom_factor}-ih)*{center_y}",
                                    "-c:v",
                                    "libx264",
                                    "-preset",
                                    "fast",
                                    "-crf",
                                    "22",
                                    "-c:a",
                                    "copy",
                                    zoomed_segment,
                                ]

                                process = await asyncio.create_subprocess_exec(
                                    *cmd_zoom,
                                    stdout=asyncio.subprocess.PIPE,
                                    stderr=asyncio.subprocess.PIPE,
                                )
                                stdout, stderr = await process.communicate()

                                if process.returncode != 0 or not os.path.exists(zoomed_segment) or os.path.getsize(zoomed_segment) == 0:
                                    print(f"FFmpeg zoom effect failed, using original segment: {stderr.decode() if stderr else 'Unknown error'}")
                                    shutil.copy(zoom_segment, zoomed_segment)
                            except Exception as e:
                                print(f"Exception during zoom effect: {str(e)}")
                                if os.path.exists(zoom_segment):
                                    shutil.copy(zoom_segment, zoomed_segment)
                                else:
                                    # If all else fails, skip this effect
                                    continue

                            cmd_after = [
                                "ffmpeg",
                                "-y",
                                "-i",
                                current_input,
                                "-ss",
                                str(end_time),
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

                            with open(concat_file, "w") as f:
                                if (
                                    os.path.exists(before_segment)
                                    and os.path.getsize(before_segment) > 0
                                ):
                                    f.write(f"file '{before_segment}'\n")
                                if (
                                    os.path.exists(zoomed_segment)
                                    and os.path.getsize(zoomed_segment) > 0
                                ):
                                    f.write(f"file '{zoomed_segment}'\n")
                                if (
                                    os.path.exists(after_segment)
                                    and os.path.getsize(after_segment) > 0
                                ):
                                    f.write(f"file '{after_segment}'\n")

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
                                zoom_output,
                            ]

                            process = await asyncio.create_subprocess_exec(
                                *cmd_concat,
                                stdout=asyncio.subprocess.PIPE,
                                stderr=asyncio.subprocess.PIPE,
                            )
                            stdout, stderr = await process.communicate()

                            if process.returncode != 0:
                                print(f"FFmpeg concat error: {stderr.decode()}")
                            elif (
                                os.path.exists(zoom_output)
                                and os.path.getsize(zoom_output) > 0
                            ):
                                current_input = zoom_output
                        except Exception as e:
                            print(f"Error processing zoom effect {i + 1}: {str(e)}")
                            traceback.print_exc()
            except Exception as e:
                print(f"Error processing zoom effects: {str(e)}")
                traceback.print_exc()

        # Convert to webm if needed
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

        # Add watermark
        watermark_output = output_path.replace(".webm", "_watermarked.webm")
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            current_input,
            "-vf",
            "drawtext=text='Made with Gradio':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=w-tw-10:y=h-th-10",
            "-c:v",
            "libvpx-vp9",
            "-crf",
            "30",
            "-b:v",
            "0",
            "-c:a",
            "copy",
            watermark_output,
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            print(f"FFmpeg watermark error: {stderr.decode()}")
            shutil.copy(current_input, watermark_output)

        return watermark_output, temp_files
    except Exception as e:
        print(f"Error in process_video_with_ffmpeg: {str(e)}")
        traceback.print_exc()
        return input_path, temp_files
