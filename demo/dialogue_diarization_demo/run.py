# type: ignore
import gradio as gr
from pyannote.audio import Pipeline
import whisper

diarization_pipeline = None
whisper_model = None


def load_models():
    global diarization_pipeline, whisper_model  # noqa: PLW0603

    if diarization_pipeline is None:
        diarization_pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1", use_auth_token=True
        )

    if whisper_model is None:
        whisper_model = whisper.load_model("base")


def real_diarization(audio_file_path: str) -> list[dict[str, str]]:
    try:
        load_models()

        if diarization_pipeline is None or whisper_model is None:
            raise Exception("Failed to load models")

        diarization = diarization_pipeline(audio_file_path)

        transcription = whisper_model.transcribe(audio_file_path)
        segments = transcription["segments"]

        dialogue_segments = []
        speaker_mapping = {}
        speaker_counter = 1

        for segment in segments:
            start_time = segment["start"]
            end_time = segment["end"]
            text = segment["text"].strip()

            speaker = "Speaker 1"
            for turn, _, speaker_label in diarization.itertracks(yield_label=True):
                if (
                    turn.start <= start_time <= turn.end
                    or turn.start <= end_time <= turn.end
                ):
                    if speaker_label not in speaker_mapping:
                        speaker_mapping[speaker_label] = f"Speaker {speaker_counter}"
                        speaker_counter += 1
                    speaker = speaker_mapping[speaker_label]
                    break

            if text:
                dialogue_segments.append({"speaker": speaker, "text": text})

        return dialogue_segments

    except Exception as e:
        print(f"Error in diarization: {str(e)}")
        return []


def process_audio(audio_file):
    if audio_file is None:
        gr.Warning("Please upload an audio file first.")
        return []

    try:
        dialogue_segments = real_diarization(audio_file)
        return dialogue_segments
    except Exception as e:
        gr.Error(f"Error processing audio: {str(e)}")
        return []


speakers = [
    "Speaker 1",
    "Speaker 2",
    "Speaker 3",
    "Speaker 4",
    "Speaker 5",
    "Speaker 6",
]
tags = [
    "(pause)",
    "(background noise)",
    "(unclear)",
    "(overlap)",
    "(phone ringing)",
    "(door closing)",
    "(music)",
    "(applause)",
    "(laughter)",
]


def format_speaker(speaker, text):
    return f"{speaker}: {text}"


with gr.Blocks(title="Audio Diarization Demo") as demo:
    with gr.Row():
        with gr.Column(scale=1):
            audio_input = gr.Audio(
                label="Upload Audio File",
                type="filepath",
                sources=["upload", "microphone"],
            )

            process_btn = gr.Button("🔍 Analyze Speakers", variant="primary", size="lg")

        with gr.Column(scale=2):
            dialogue_output = gr.Dialogue(
                speakers=speakers,
                tags=tags,
                formatter=format_speaker,
                label="AI-generated speaker-separated conversation",
                value=[],
            )

    process_btn.click(fn=process_audio, inputs=[audio_input], outputs=[dialogue_output])

if __name__ == "__main__":
    demo.launch()
