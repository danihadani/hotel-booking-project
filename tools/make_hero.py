"""
Draws the home page banner and reduces it to pure black and white.

    python3 tools/make_hero.py

Nothing here is a photograph: the sea and sky are drawn from gradients and
noise, then run through the same dither as any other image, so the banner
has no external file and no licence attached to it.
"""
import random
import pathlib
from PIL import Image, ImageDraw, ImageFilter

from dither import prepare, fine

WIDTH, HEIGHT = 1400, 1750
HORIZON = 0.55                     # where the sea starts, as a fraction of the height
OUT = pathlib.Path(__file__).resolve().parent.parent / "client" / "public" / "hero.png"


def draw_scene():
    image = Image.new("L", (WIDTH, HEIGHT))
    pen = ImageDraw.Draw(image)
    horizon = int(HEIGHT * HORIZON)

    # sky: bright at the horizon, darker overhead. sea: darker as it nears us.
    for y in range(HEIGHT):
        if y < horizon:
            value = 235 - (horizon - y) * 0.16
        else:
            value = 120 - (y - horizon) * 0.06
        pen.line([(0, y), (WIDTH, y)], fill=int(max(8, min(255, value))))

    # the sun, just above the horizon
    sun_x, sun_y, radius = WIDTH // 2, horizon - 190, 110
    pen.ellipse([sun_x - radius, sun_y - radius, sun_x + radius, sun_y + radius], fill=245)

    # clouds: soft horizontal smears across the upper sky
    for _ in range(150):
        x = random.randint(0, WIDTH)
        y = random.randint(20, horizon - 260)
        pen.ellipse(
            [x, y, x + random.randint(60, 300), y + random.randint(8, 38)],
            fill=min(255, 200 + random.randint(0, 55)),
        )

    # waves: short bright strokes, denser and brighter near the sun's reflection
    for _ in range(3200):
        y = random.randint(horizon, HEIGHT)
        x = random.randint(0, WIDTH)
        near_reflection = 1.6 if abs(x - sun_x) < 150 else 1.0
        pen.line(
            [(x, y), (x + random.randint(10, 80), y)],
            fill=max(0, min(255, int((110 + random.randint(-70, 95)) * near_reflection))),
        )

    image = image.filter(ImageFilter.GaussianBlur(1.1))

    # a little grain, so the dither has texture to bite into
    pixels = image.load()
    for y in range(HEIGHT):
        for x in range(0, WIDTH, 2):
            pixels[x, y] = max(0, min(255, pixels[x, y] + random.randint(-16, 16)))

    return image


if __name__ == "__main__":
    random.seed(7)                                    # same picture every run
    banner = fine(prepare(draw_scene(), 1000, 1250))
    banner.convert("RGB").save(OUT)
    print(f"wrote {OUT}")
