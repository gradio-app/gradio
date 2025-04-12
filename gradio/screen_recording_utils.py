import asyncio
import os
import shutil
import tempfile
import traceback
import json


async def process_video_with_ffmpeg(input_path, output_path, params):
    """Process a video with ffmpeg based on the provided parameters."""
    current_input = input_path
    temp_files = [input_path]

    try:
        # Debug: Print all parameters
        print("Processing video with parameters:", params)
        
        # Handle segment removal
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

        # Handle zoom effect with individual coordinates
        print("Processing zoom effect....", 
              params.get("zoom_top_left_x"), 
              params.get("zoom_top_left_y"), 
              params.get("zoom_bottom_right_x"), 
              params.get("zoom_bottom_right_y"),
              params.get("zoom_timestamp"))
              
        if (params.get("zoom_top_left_x") and params.get("zoom_top_left_y") and 
            params.get("zoom_bottom_right_x") and params.get("zoom_bottom_right_y")):
            try:
                # Parse zoom parameters from individual coordinates
                zoom_top_left = [
                    float(params.get("zoom_top_left_x")),
                    float(params.get("zoom_top_left_y"))
                ]
                zoom_bottom_right = [
                    float(params.get("zoom_bottom_right_x")),
                    float(params.get("zoom_bottom_right_y"))
                ]
                zoom_duration = float(params.get("zoom_duration", 2.0))
                zoom_timestamp = params.get("zoom_timestamp")
                
                print(f"Parsed zoom parameters: top_left={zoom_top_left}, bottom_right={zoom_bottom_right}, duration={zoom_duration}, timestamp={zoom_timestamp}")
                
                # Call zoom_in function with timestamp
                zoom_output, zoom_temp_files = await zoom_in(
                    current_input, 
                    output_path,
                    zoom_top_left, 
                    zoom_bottom_right, 
                    zoom_duration,
                    zoom_timestamp
                )
                
                # Update current input and temp files
                if zoom_output and zoom_output != current_input:
                    current_input = zoom_output
                    temp_files.extend(zoom_temp_files)
            except Exception as e:
                print(f"Error applying zoom effect: {str(e)}")
                traceback.print_exc()
                # Continue with processing without zoom effect
        
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
            
        return current_input, temp_files

    except Exception as e:
        print(f"Error in process_video_with_ffmpeg: {str(e)}")
        traceback.print_exc()
        return input_path, temp_files

async def zoom_in(input_path, output_path, top_left=None, bottom_right=None, zoom_duration=2.0, zoom_timestamp=None):
    temp_files = []

    try:
        # Validate inputs
        if not input_path or not os.path.exists(input_path):
            print(f"Input file does not exist: {input_path}")
            return input_path, temp_files
        
        # Get zoom timestamp (when to start the zoom effect)
        if zoom_timestamp is None:
            print("No zoom timestamp provided, defaulting to 2 seconds")
            zoom_timestamp = 2.0
        else:
            try:
                zoom_timestamp = float(zoom_timestamp)
                print(f"Using zoom timestamp: {zoom_timestamp} seconds")
            except (ValueError, TypeError):
                print("Invalid zoom timestamp, defaulting to 2 seconds")
                zoom_timestamp = 2.0
        
        # Default values if coordinates are None
        if top_left is None:
            print("Using default top_left coordinates (0.25, 0.25)")
            top_left = [0.25, 0.25]
            
        if bottom_right is None:
            print("Using default bottom_right coordinates (0.75, 0.75)")
            bottom_right = [0.75, 0.75]
        
        # Print coordinates for debugging
        print(f"Zoom coordinates: top_left={top_left}, bottom_right={bottom_right}")
        
        # Safely extract coordinates
        try:
            x1, y1 = float(top_left[0]), float(top_left[1])
            x2, y2 = float(bottom_right[0]), float(bottom_right[1])
        except (TypeError, ValueError, IndexError) as e:
            print(f"Error converting coordinates to float: {e}")
            print("Using default coordinates")
            x1, y1 = 0.25, 0.25
            x2, y2 = 0.75, 0.75

        # Ensure coordinates are within valid range
        x1 = max(0.0, min(0.9, x1))
        y1 = max(0.0, min(0.9, y1))
        x2 = max(0.1, min(1.0, x2))
        y2 = max(0.1, min(1.0, y2))
        
        # Ensure x2 > x1 and y2 > y1
        if x2 <= x1:
            x1, x2 = 0.25, 0.75
        if y2 <= y1:
            y1, y2 = 0.25, 0.75
            
        # Get video dimensions
        cmd_dimensions = [
            "ffprobe",
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=s=x:p=0",
            input_path
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd_dimensions,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()
        
        try:
            dimensions = stdout.decode().strip().split('x')
            width = int(dimensions[0])
            height = int(dimensions[1])
            print(f"Video dimensions: {width}x{height}")
        except (ValueError, IndexError):
            print("Could not determine video dimensions, using defaults")
            width, height = 1280, 720
            
        # Get video duration
        cmd_duration = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            input_path
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd_duration,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()

        try:
            video_duration = float(stdout.decode().strip())
        except (ValueError, TypeError):
            print(f"Could not determine video duration, using default")
            video_duration = 10.0

        zoom_duration = min(float(zoom_duration), video_duration)
        
        # Create a temporary file for the output
        final_output = output_path
        if output_path.endswith(".webm"):
            final_output = output_path.replace(".webm", ".mp4")
        
        # First, just draw a red box without zoom
        box_output = tempfile.mktemp(suffix="_with_box.mp4")
        temp_files.append(box_output)
        
        # Draw a red box at the timestamp when the zoom was requested
        box_filter = (
            f"drawbox=x=iw*{x1}:y=ih*{y1}:w=iw*({x2}-{x1}):h=ih*({y2}-{y1}):"
            f"color=red:thickness=5:enable='between(t,{zoom_timestamp},{zoom_timestamp+2})'"
        )
        
        cmd_box = [
            "ffmpeg",
            "-y",
            "-i", input_path,
            "-vf", box_filter,
            "-c:v", "libx264",
            "-tag:v", "avc3",
            "-profile:v", "baseline",
            "-level", "3.0",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            "-c:a", "copy",
            box_output,
        ]
        
        print(f"Running box drawing command: {' '.join(cmd_box)}")
        
        process = await asyncio.create_subprocess_exec(
            *cmd_box,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            print(f"FFmpeg box drawing error: {stderr.decode()}")
            return input_path, temp_files
        
        # Now apply the zoom effect
        zoom_output = tempfile.mktemp(suffix="_zoomed.mp4")
        temp_files.append(zoom_output)
        
        # Create a complex filter for the zoom effect that ensures consistent SAR
        complex_filter = (
            # Split the video into three parts
            f"[0:v]split=3[v1][v2][v3];"
            
            # First part: original video up to the zoom timestamp
            f"[v1]trim=0:{zoom_timestamp},setpts=PTS-STARTPTS,setsar=1[intro];"
            
            # Middle part: apply zoom effect with consistent SAR
            f"[v2]trim={zoom_timestamp}:{zoom_timestamp+zoom_duration},setpts=PTS-STARTPTS,"
            f"crop=iw*{x2-x1}:ih*{y2-y1}:iw*{x1}:ih*{y1},scale={width}:{height},setsar=1[zoom];"
            
            # Last part: original video after zoom
            f"[v3]trim={zoom_timestamp+zoom_duration}:999999,setpts=PTS-STARTPTS,setsar=1[outro];"
            
            # Concatenate all parts
            f"[intro][zoom][outro]concat=n=3:v=1:a=0[outv]"
        )
        
        cmd_zoom = [
            "ffmpeg",
            "-y",
            "-i", box_output,
            "-filter_complex", complex_filter,
            "-map", "[outv]",
            "-map", "0:a?",  # Make audio mapping optional with ?
            "-c:v", "libx264",
            "-tag:v", "avc3",
            "-profile:v", "baseline",
            "-level", "3.0",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            "-c:a", "copy",
            zoom_output,
        ]
        
        print(f"Running zoom effect command: {' '.join(cmd_zoom)}")
        
        process = await asyncio.create_subprocess_exec(
            *cmd_zoom,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            print(f"FFmpeg zoom effect error: {stderr.decode()}")
            print(stderr.decode())
            # Return the box output if zoom fails
            return box_output, temp_files
        
        return zoom_output, temp_files

    except Exception as e:
        print(f"Error in zoom_in: {str(e)}")
        traceback.print_exc()
        return input_path, temp_files
