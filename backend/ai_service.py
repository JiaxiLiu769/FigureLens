
import base64
import json
import os

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


async def recognize_figure(
        image_bytes: bytes,
        content_type: str
):
    # 将图片转换成 Base64
    encoded_image = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    image_url = (
        f"data:{content_type};base64,{encoded_image}"
    )

    response = await client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {
                "role": "system",
                "content": (
                    "You analyze anime figure photographs. "
                    "Identify visible clues carefully. "
                    "Do not invent manufacturers, scales, "
                    "or exact product versions. "
                    "Return only a JSON object with keys: "
                    "character, series, manufacturer, "
                    "scale, description. "
                    "Use null for unknown values."
                ),
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Analyze this anime figure photo. "
                            "Identify the character and series "
                            "if possible, and describe distinctive "
                            "visual features."
                        ),
                    },
                    {
                        "type": "input_image",
                        "image_url": image_url,
                    },
                ],
            },
        ],
        text={
            "format": {
                "type": "json_object",
            }
        },
    )

    return json.loads(response.output_text)
