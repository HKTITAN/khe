"""Outline "khe" in Inter and export the path, its on-curve points and the font metrics
for the construction drawing on the brand page. Needs the Inter variable TTF (SIL OFL, rsms.me/inter)
at scripts/fonts/Inter.ttf, which is not committed. Run: python scripts/construction.py"""
import json
from pathlib import Path

import pathops
import uharfbuzz as hb
from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "scripts" / "fonts" / "Inter.ttf"
TEXT, SIZE, WGHT, OPSZ = "khe", 400, 900, 32


class Collect(BasePen):
    def __init__(self, dx, scale):
        super().__init__(None)
        self.d, self.on, self.dx, self.s = [], [], dx, scale

    def p(self, pt):
        return round(self.dx + pt[0] * self.s, 1), round(-pt[1] * self.s, 1)

    def _moveTo(self, pt):
        x, y = self.p(pt)
        self.d.append(f"M{x} {y}")
        self.on.append([x, y])

    def _lineTo(self, pt):
        x, y = self.p(pt)
        self.d.append(f"L{x} {y}")
        self.on.append([x, y])

    def _curveToOne(self, a, b, c):
        (ax, ay), (bx, by), (cx, cy) = self.p(a), self.p(b), self.p(c)
        self.d.append(f"C{ax} {ay} {bx} {by} {cx} {cy}")
        self.on.append([cx, cy])

    def _qCurveToOne(self, a, b):
        (ax, ay), (bx, by) = self.p(a), self.p(b)
        self.d.append(f"Q{ax} {ay} {bx} {by}")
        self.on.append([bx, by])

    def _closePath(self):
        self.d.append("Z")


face = hb.Face(hb.Blob.from_file_path(str(FONT)))
font = hb.Font(face)
font.set_variations({"wght": WGHT, "opsz": OPSZ})
buf = hb.Buffer()
buf.add_str(TEXT)
buf.guess_segment_properties()
hb.shape(font, buf, {"kern": True})
scale = SIZE / face.upem

d, points, glyphs, x = [], [], [], 0.0
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    # Variable fonts keep overlapping contours (the k is a stem plus two strokes). Union them so
    # every letter is one outline, the way a drawn mark would be.
    outline = pathops.Path()
    font.draw_glyph_with_pen(info.codepoint, outline.getPen())
    outline.simplify(fix_winding=True)
    outline.convertConicsToQuads()
    pen = Collect(x + pos.x_offset * scale, scale)
    outline.draw(pen)
    d += pen.d
    points += pen.on
    glyphs.append([round(x, 1), round(x + pos.x_advance * scale, 1)])
    x += pos.x_advance * scale

os2 = TTFont(str(FONT))["OS/2"]
metrics = {
    "ascender": round(-os2.sTypoAscender * scale, 1),
    "cap": round(-os2.sCapHeight * scale, 1),
    "x": round(-os2.sxHeight * scale, 1),
    "baseline": 0,
    "descender": round(-os2.sTypoDescender * scale, 1),
}
out = {"text": TEXT, "width": round(x, 1), "d": " ".join(d), "points": points, "glyphs": glyphs, "metrics": metrics}
(ROOT / "site" / "construction.json").write_text(json.dumps(out), encoding="utf-8")
print(f"{len(points)} points, width {x:.0f}, metrics {metrics}")
