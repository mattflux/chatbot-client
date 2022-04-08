from importlib.metadata import metadata
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import JSONFormatter
import json

video_ids = ["eXBq52rjoxA", "kS9E9eSG-Ow",
             "tU_IMaEjTpU", "H5HykNQmQBg", "BW7wmnnLsx4", "XcGVrDmrm3c"]

formatter = JSONFormatter()

with open('all_content.jsonl', 'w', encoding='utf-8') as json_file:
    for id in video_ids:
        transcript = YouTubeTranscriptApi.get_transcript(id)
        json_formatted = formatter.format_transcript(transcript)

        print(json_formatted)

        current_duration = 0
        current_start = 0
        current_text = ""

        for t in transcript:
            current_duration = t["start"] - current_start
            current_text = current_text + t["text"] + " "

            if current_duration > 30:
                start = t["start"]
                t.pop("start", None)
                t.pop("duration", None)
                json_file.write(json.dumps({"text": current_text, "metadata": {
                    "start": current_start, "video_id": id}}) + "\n")
                current_start = start
                current_duration = 0
                current_text = ""

