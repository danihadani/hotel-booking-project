"""Turn a photo into the 1-bit look: high contrast, dithered, lime overlay."""
import sys, random
from PIL import Image, ImageEnhance, ImageOps, ImageFilter

LIME = (216, 255, 62)
INK  = (10, 10, 10)

def prepare(img, w=1100, h=460):
    img = ImageOps.exif_transpose(img).convert("L")
    img = ImageOps.fit(img, (w, h), Image.LANCZOS)          # crop to the banner shape
    img = ImageOps.autocontrast(img, cutoff=2)
    return ImageEnhance.Contrast(img).enhance(1.45)

def fine(img):
    """Floyd-Steinberg at full resolution - newsprint feel."""
    return img.convert("1")

def chunky(img, block=4):
    """Dither at 1/block scale, then blow it back up: fat, broken pixels."""
    w, h = img.size
    small = img.resize((w // block, h // block), Image.LANCZOS).convert("1")
    return small.resize((w, h), Image.NEAREST)

def halftone(img, cell=6):
    """Dots on a grid, like a printed newspaper."""
    w, h = img.size
    out = Image.new("1", (w, h), 1)
    px, src = out.load(), img.load()
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            tot = n = 0
            for j in range(y, min(y + cell, h)):
                for i in range(x, min(x + cell, w)):
                    tot += src[i, j]; n += 1
            r = (1 - tot / n / 255) * (cell / 1.7)
            cx, cy = x + cell / 2, y + cell / 2
            for j in range(y, min(y + cell, h)):
                for i in range(x, min(x + cell, w)):
                    if (i - cx) ** 2 + (j - cy) ** 2 <= r * r:
                        px[i, j] = 0
    return out

def tint(bw):
    """Black stays black, white becomes lime."""
    out = Image.new("RGB", bw.size, INK)
    out.paste(Image.new("RGB", bw.size, LIME), mask=bw.convert("L").point(lambda v: 255 if v else 0))
    return out

if __name__ == "__main__":
    src, stem = sys.argv[1], sys.argv[2]
    base = prepare(Image.open(src))
    for name, fn in (("fine", fine), ("chunky", chunky), ("halftone", halftone)):
        bw = fn(base)
        bw.convert("RGB").save(f"{stem}-{name}-bw.png")
        tint(bw).save(f"{stem}-{name}-lime.png")
    print("done")
