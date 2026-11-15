"""Outline HARSHIT / KHEMANI in Anton for the Name construction drawing on the brand page: both lines
set to one length the way NameMark does it (extra letter space spread between the glyphs, glyphs never
stretched), with every on-curve point and the metrics for the guides. Needs Anton (SIL OFL, Google
Fonts) at scripts/fonts/Anton-Regular.ttf, which is not committed. Run: python scripts/name-construction.py"""
import json
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "scripts" / "fonts" / "Anton-Regular.ttf"
LINES = ["HARSHIT", "KHEMANI"]
# NameMark: font-size 22 in a 74-wide box, baselines at 18 and 40. Scaled up for drawing.
SIZE = 400
LENGTH = 74 / 22 * SIZE
LEAD = (40 - 18) / 22 * SIZE


class Collect(BasePen):
    def __init__(self, glyphset, dx, dy, scale):
        super().__init__(glyphset)
        self.d, self.on, self.dx, self.dy, self.s = [], [], dx, dy, scale

    def p(self, pt):
        return round(self.dx + pt[0] * self.s, 1), round(self.dy - pt[1] * self.s, 1)

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


font = TTFont(FONT)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
hmtx = font["hmtx"]
upem = font["head"].unitsPerEm
s = SIZE / upem
cap = font["OS/2"].sCapHeight * s

d, points, cells = [], [], []
for i, text in enumerate(LINES):
    names = [cmap[ord(c)] for c in text]
    advances = [hmtx[n][0] * s for n in names]
    natural = sum(advances)
    gap = (LENGTH - natural) / (len(names) - 1)
    x, y = 0.0, i * LEAD
    for n, adv in zip(names, advances):
        pen = Collect(gs, x, y, s)
        gs[n].draw(pen)
        d.append(" ".join(pen.d))
        points += pen.on
        cells.append([round(x, 1), round(x + adv, 1)])
        x += adv + gap

xs = [p[0] for p in points]
data = {
    "lines": LINES,
    "length": round(LENGTH, 1),
    "lead": round(LEAD, 1),
    "cap": round(cap, 1),
    "ink": [round(min(xs), 1), round(max(xs), 1)],
    "d": " ".join(d),
    "points": points,
    "cells": cells,
}
(ROOT / "site" / "name-construction.json").write_text(json.dumps(data), encoding="utf-8")
print(f"{len(points)} anchors, cap {data['cap']}, lead {data['lead']}, ink {data['ink']}, length {data['length']}")
