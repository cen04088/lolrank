"""
Tiny Swords (구버전 "TS_old version", CC0, Pixel Frog) 에서 앱에 필요한 스프라이트를 잘라
frontend/public/assets/tiny/ 로 복사한다. 재배포 금지 조건인 Free Pack 은 사용하지 않는다.

사용법:
  python scripts/extract-tiny-swords.py [팩 경로]
  (기본 경로: ../.tmp-tiny-swords/old/Tiny Swords (Update 010))

출력 (모두 원본 해상도 1x):
  public/assets/tiny/chars/{key}.png        대기 1프레임 96x96 (192 프레임의 중앙 크롭)
  public/assets/tiny/chars/{key}_face.png   얼굴 52x52 (머리 위치 기준 자동 크롭)
  public/assets/tiny/chars/{key}_walk.png   달리기 시트 384x384 (행: 아래/위/왼/오른, 열: 4프레임)
  public/assets/tiny/tiles/*.png            잔디/모래 타일 64x64
  public/assets/tiny/props/*.png            성/집/탑/나무/장식/양
  public/assets/tiny/ui/*.png               리본/배너/버튼/아이콘
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PACK = ROOT.parent / ".tmp-tiny-swords" / "old" / "Tiny Swords (Update 010)"
OUT = ROOT / "public" / "assets" / "tiny"

FRAME = 192
CROP = (48, 48, 144, 144)  # 프레임 중앙 96x96
FACE_SIZE = 60  # 머리+어깨 정사각 크롭 한 변
WALK_FRAMES = 4

COLORS = ["Blue", "Red", "Yellow", "Purple"]

# key 접두어 -> (시트 경로 패턴, 달리기 행 index)
UNITS: dict[str, tuple[str, int]] = {
    "warrior": ("Factions/Knights/Troops/Warrior/{c}/Warrior_{c}.png", 1),
    "archer": ("Factions/Knights/Troops/Archer/{c}/Archer_{c}.png", 1),
    "pawn": ("Factions/Knights/Troops/Pawn/{c}/Pawn_{c}.png", 1),
    "torch": ("Factions/Goblins/Troops/Torch/{c}/Torch_{c}.png", 1),
    "tnt": ("Factions/Goblins/Troops/TNT/{c}/TNT_{c}.png", 1),
    "barrel": ("Factions/Goblins/Troops/Barrel/{c}/Barrel_{c}.png", 1),  # 통에서 나오는 동작을 걷기로 쓴다
}

# 팩의 오타 파일명 보정
FILE_FIXES = {"Factions/Knights/Troops/Archer/Purple/Archer_Purple.png": "Factions/Knights/Troops/Archer/Purple/Archer_Purlple.png"}

TILES: dict[str, tuple[int, int]] = {  # Tilemap_Flat 의 (열, 행), 64px 격자
    "grass": (1, 1),
    "grass_top": (1, 0),
    "grass_bottom": (1, 2),
    "sand": (6, 1),
    "sand_left": (5, 1),
    "sand_right": (7, 1),
    "sand_top": (6, 0),
}

PROPS: dict[str, tuple[str, tuple[int, int, int, int] | None]] = {
    "castle_blue": ("Factions/Knights/Buildings/Castle/Castle_Blue.png", None),
    "castle_red": ("Factions/Knights/Buildings/Castle/Castle_Red.png", None),
    "castle_yellow": ("Factions/Knights/Buildings/Castle/Castle_Yellow.png", None),
    "house_blue": ("Factions/Knights/Buildings/House/House_Blue.png", None),
    "house_red": ("Factions/Knights/Buildings/House/House_Red.png", None),
    "house_yellow": ("Factions/Knights/Buildings/House/House_Yellow.png", None),
    "house_purple": ("Factions/Knights/Buildings/House/House_Purple.png", None),
    "tower_blue": ("Factions/Knights/Buildings/Tower/Tower_Blue.png", None),
    "tower_red": ("Factions/Knights/Buildings/Tower/Tower_Red.png", None),
    "goblin_house": ("Factions/Goblins/Buildings/Wood_House/Goblin_House.png", None),
    "tree": ("Resources/Trees/Tree.png", (0, 0, 192, 192)),
    "sheep": ("Resources/Sheep/HappySheep_Idle.png", (0, 0, 128, 128)),
    "gold": ("Resources/Resources/G_Idle.png", None),
    "wood": ("Resources/Resources/W_Idle.png", None),
    "meat": ("Resources/Resources/M_Idle.png", None),
    "bridge": ("Terrain/Bridge/Bridge_All.png", None),
}
for i in range(1, 19):
    PROPS[f"deco_{i:02d}"] = (f"Deco/{i:02d}.png", None)

UI: dict[str, str] = {
    "ribbon_blue": "UI/Ribbons/Ribbon_Blue_3Slides.png",
    "ribbon_red": "UI/Ribbons/Ribbon_Red_3Slides.png",
    "ribbon_yellow": "UI/Ribbons/Ribbon_Yellow_3Slides.png",
    "banner_horizontal": "UI/Banners/Banner_Horizontal.png",
    "banner_vertical": "UI/Banners/Banner_Vertical.png",
    "carved_regular": "UI/Banners/Carved_Regular.png",
    "carved_3slides": "UI/Banners/Carved_3Slides.png",
    "carved_9slides": "UI/Banners/Carved_9Slides.png",
    "button_blue": "UI/Buttons/Button_Blue_3Slides.png",
    "button_blue_pressed": "UI/Buttons/Button_Blue_3Slides_Pressed.png",
    "button_red": "UI/Buttons/Button_Red_3Slides.png",
    "button_red_pressed": "UI/Buttons/Button_Red_3Slides_Pressed.png",
    "button_disable": "UI/Buttons/Button_Disable_3Slides.png",
    "pointer_01": "UI/Pointers/01.png",
    "fire": "Effects/Fire/Fire.png",
}
for i in range(1, 11):
    UI[f"icon_{i:02d}"] = f"UI/Icons/Regular_{i:02d}.png"


def load(pack: Path, rel: str) -> Image.Image:
    rel = FILE_FIXES.get(rel, rel)
    return Image.open(pack / rel).convert("RGBA")


def face_box(idle: Image.Image) -> tuple[int, int, int, int]:
    """대기 프레임의 알파 경계 상단(머리)에서 시작하는 정사각 영역."""
    bbox = idle.getbbox() or (0, 0, idle.width, idle.height)
    cx = (bbox[0] + bbox[2]) // 2
    top = max(0, bbox[1] - 6)
    left = max(0, min(cx - FACE_SIZE // 2, idle.width - FACE_SIZE))
    top = min(top, idle.height - FACE_SIZE)
    return (left, top, left + FACE_SIZE, top + FACE_SIZE)


def frame(sheet: Image.Image, col: int, row: int) -> Image.Image:
    return sheet.crop((col * FRAME, row * FRAME, (col + 1) * FRAME, (row + 1) * FRAME))


def frames_in_row(sheet: Image.Image, row: int) -> list[Image.Image]:
    """행에서 내용이 있는 프레임만 순서대로."""
    result = []
    for col in range(sheet.width // FRAME):
        f = frame(sheet, col, row)
        if f.getbbox():
            result.append(f)
    return result


def sample(items: list[Image.Image], count: int) -> list[Image.Image]:
    if len(items) <= count:
        return (items * count)[:count]
    step = len(items) / count
    return [items[int(i * step)] for i in range(count)]


def build_walk_sheet(run_frames: list[Image.Image]) -> Image.Image:
    size = CROP[2] - CROP[0]
    picked = [f.crop(CROP) for f in sample(run_frames, WALK_FRAMES)]
    sheet = Image.new("RGBA", (size * WALK_FRAMES, size * 4))
    for col, f in enumerate(picked):
        sheet.alpha_composite(f, (col * size, 0 * size))  # down: 원본(오른쪽 보기)
        sheet.alpha_composite(f, (col * size, 1 * size))  # up
        sheet.alpha_composite(ImageOps.mirror(f), (col * size, 2 * size))  # left: 좌우 반전
        sheet.alpha_composite(f, (col * size, 3 * size))  # right
    return sheet


def main() -> None:
    pack = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PACK
    if not pack.exists():
        sys.exit(f"asset pack not found: {pack}")
    for sub in ("chars", "tiles", "props", "ui"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)

    count = 0
    for unit, (pattern, run_row) in UNITS.items():
        for color in COLORS:
            key = f"ts_{unit}_{color.lower()}"
            sheet = load(pack, pattern.format(c=color))
            idle = frame(sheet, 0, 0).crop(CROP)
            idle.save(OUT / "chars" / f"{key}.png")
            idle.crop(face_box(idle)).save(OUT / "chars" / f"{key}_face.png")
            run = frames_in_row(sheet, run_row) or [frame(sheet, 0, 0)]
            build_walk_sheet(run).save(OUT / "chars" / f"{key}_walk.png")
            count += 1

    tilemap = load(pack, "Terrain/Ground/Tilemap_Flat.png")
    for key, (col, row) in TILES.items():
        tilemap.crop((col * 64, row * 64, (col + 1) * 64, (row + 1) * 64)).save(OUT / "tiles" / f"{key}.png")

    for key, (rel, box) in PROPS.items():
        img = load(pack, rel)
        if box:
            img = img.crop(box)
        img.save(OUT / "props" / f"{key}.png")

    for key, rel in UI.items():
        shutil.copyfile(pack / rel, OUT / "ui" / f"{key}.png")

    (OUT / "LICENSE.txt").write_text(
        "Tiny Swords (old version) by Pixel Frog — CC0 1.0 Universal\n"
        "https://pixelfrog-assets.itch.io/tiny-swords\n",
        encoding="utf-8",
    )
    print(f"extracted to {OUT}: {count} chars, {len(TILES)} tiles, {len(PROPS)} props, {len(UI)} ui")


if __name__ == "__main__":
    main()
