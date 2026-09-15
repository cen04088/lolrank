"""
Tiny Swords (Pixel Frog) 에서 앱에 필요한 스프라이트를 잘라 frontend/public/assets/tiny/ 로 복사한다.

두 소스를 함께 쓴다.
  - Free Pack (현행판):   기사단 5종(Warrior, Archer, Lancer, Monk, Pawn) × 5색(Black, Blue, Purple, Red, Yellow)
                          라이선스: 개인·상업 사용/수정 가능, 재배포·재판매 금지
  - 구버전 (Update 010, CC0): 고블린 3종(Torch, TNT, Barrel) × 4색, 성/집/탑/나무/장식, 타일, 리본 UI

사용법:
  python scripts/extract-tiny-swords.py
  (기본 경로: ../.tmp-tiny-swords/old/Tiny Swords (Update 010), ../.tmp-tiny-swords/free/Tiny Swords (Free Pack))

출력:
  public/assets/tiny/chars/{key}.png        대기 1프레임 96x96
  public/assets/tiny/chars/{key}_face.png   얼굴 60x60 (머리 위치 기준 자동 크롭)
  public/assets/tiny/chars/{key}_walk.png   달리기 시트 384x384 (행: 아래/위/왼/오른, 열: 4프레임)
  public/assets/tiny/tiles/*.png            잔디/모래 타일 64x64
  public/assets/tiny/props/*.png            성/집/탑/나무/장식/양
  public/assets/tiny/ui/*.png               리본/배너/버튼/아이콘
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OLD_PACK = ROOT.parent / ".tmp-tiny-swords" / "old" / "Tiny Swords (Update 010)"
FREE_PACK = ROOT.parent / ".tmp-tiny-swords" / "free" / "Tiny Swords (Free Pack)"
OUT = ROOT / "public" / "assets" / "tiny"

CANVAS = 96  # 캐릭터 한 프레임 출력 크기
FACE_SIZE = 60
WALK_FRAMES = 4

# ---------------------------------------------------------------- Free Pack 기사단
FREE_COLORS = ["Black", "Blue", "Purple", "Red", "Yellow"]
# unit -> (idle 스트립, run 스트립, 프레임 크기, 크롭 크기)
FREE_UNITS: dict[str, tuple[str, str, int, int]] = {
    "warrior": ("Warrior/Warrior_Idle.png", "Warrior/Warrior_Run.png", 192, 96),
    "archer": ("Archer/Archer_Idle.png", "Archer/Archer_Run.png", 192, 96),
    "lancer": ("Lancer/Lancer_Idle.png", "Lancer/Lancer_Run.png", 320, 144),
    "monk": ("Monk/Idle.png", "Monk/Run.png", 192, 96),
    "pawn": ("Pawn/Pawn_Idle.png", "Pawn/Pawn_Run.png", 192, 96),
}

# ---------------------------------------------------------------- 구버전 고블린
OLD_COLORS = ["Blue", "Red", "Yellow", "Purple"]
# unit -> (시트 경로 패턴, 달리기 행)
OLD_UNITS: dict[str, tuple[str, int]] = {
    "torch": ("Factions/Goblins/Troops/Torch/{c}/Torch_{c}.png", 1),
    "tnt": ("Factions/Goblins/Troops/TNT/{c}/TNT_{c}.png", 1),
    "barrel": ("Factions/Goblins/Troops/Barrel/{c}/Barrel_{c}.png", 1),  # 통에서 나오는 동작을 걷기로 쓴다
}
OLD_FRAME = 192

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


def load(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def strip_frames(strip: Image.Image, frame: int) -> list[Image.Image]:
    """가로 한 줄 스트립에서 내용이 있는 프레임만."""
    frames = []
    for col in range(strip.width // frame):
        f = strip.crop((col * frame, 0, (col + 1) * frame, frame))
        if f.getbbox():
            frames.append(f)
    return frames


def sheet_row_frames(sheet: Image.Image, row: int, frame: int) -> list[Image.Image]:
    frames = []
    for col in range(sheet.width // frame):
        f = sheet.crop((col * frame, row * frame, (col + 1) * frame, (row + 1) * frame))
        if f.getbbox():
            frames.append(f)
    return frames


def center_crop(frame_img: Image.Image, crop: int) -> Image.Image:
    """프레임 중앙 crop×crop 을 잘라 CANVAS 크기로 맞춘다 (크롭이 더 크면 부드럽게 축소)."""
    w, h = frame_img.size
    left, top = (w - crop) // 2, (h - crop) // 2
    img = frame_img.crop((left, top, left + crop, top + crop))
    if crop != CANVAS:
        img = img.resize((CANVAS, CANVAS), Image.LANCZOS)
    return img


def face_box(idle: Image.Image) -> tuple[int, int, int, int]:
    """대기 프레임의 몸통 상단(머리)에서 시작하는 정사각 영역.
    창·횃불처럼 가늘고 긴 부분은 알파를 침식(erode)해서 무시한다."""
    alpha = idle.getchannel("A").point(lambda a: 255 if a > 40 else 0)
    body = alpha.filter(ImageFilter.MinFilter(7))
    bbox = body.getbbox() or alpha.getbbox() or (0, 0, idle.width, idle.height)
    cx = (bbox[0] + bbox[2]) // 2
    top = max(0, min(bbox[1] - 6, idle.height - FACE_SIZE))
    left = max(0, min(cx - FACE_SIZE // 2, idle.width - FACE_SIZE))
    return (left, top, left + FACE_SIZE, top + FACE_SIZE)


def sample(items: list[Image.Image], count: int) -> list[Image.Image]:
    if len(items) <= count:
        return (items * count)[:count]
    step = len(items) / count
    return [items[int(i * step)] for i in range(count)]


def build_walk_sheet(run_frames: list[Image.Image]) -> Image.Image:
    picked = sample(run_frames, WALK_FRAMES)
    sheet = Image.new("RGBA", (CANVAS * WALK_FRAMES, CANVAS * 4))
    for col, f in enumerate(picked):
        sheet.alpha_composite(f, (col * CANVAS, 0 * CANVAS))  # down: 원본(오른쪽 보기)
        sheet.alpha_composite(f, (col * CANVAS, 1 * CANVAS))  # up
        sheet.alpha_composite(ImageOps.mirror(f), (col * CANVAS, 2 * CANVAS))  # left: 좌우 반전
        sheet.alpha_composite(f, (col * CANVAS, 3 * CANVAS))  # right
    return sheet


def save_character(key: str, idle: Image.Image, run: list[Image.Image]) -> None:
    idle.save(OUT / "chars" / f"{key}.png")
    idle.crop(face_box(idle)).save(OUT / "chars" / f"{key}_face.png")
    build_walk_sheet(run or [idle]).save(OUT / "chars" / f"{key}_walk.png")


def main() -> None:
    for pack in (OLD_PACK, FREE_PACK):
        if not pack.exists():
            sys.exit(f"asset pack not found: {pack}")
    for sub in ("chars", "tiles", "props", "ui"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)
    for stale in (OUT / "chars").glob("*.png"):
        stale.unlink()

    count = 0
    for unit, (idle_rel, run_rel, frame, crop) in FREE_UNITS.items():
        for color in FREE_COLORS:
            base = FREE_PACK / "Units" / f"{color} Units"
            idle_frames = strip_frames(load(base / idle_rel), frame)
            run_frames = strip_frames(load(base / run_rel), frame)
            idle = center_crop(idle_frames[0], crop)
            run = [center_crop(f, crop) for f in run_frames]
            save_character(f"ts_{unit}_{color.lower()}", idle, run)
            count += 1

    for unit, (pattern, run_row) in OLD_UNITS.items():
        for color in OLD_COLORS:
            sheet = load(OLD_PACK / pattern.format(c=color))
            idle = center_crop(sheet_row_frames(sheet, 0, OLD_FRAME)[0], CANVAS)
            run = [center_crop(f, CANVAS) for f in sheet_row_frames(sheet, run_row, OLD_FRAME)]
            save_character(f"ts_{unit}_{color.lower()}", idle, run)
            count += 1

    tilemap = load(OLD_PACK / "Terrain/Ground/Tilemap_Flat.png")
    for key, (col, row) in TILES.items():
        tilemap.crop((col * 64, row * 64, (col + 1) * 64, (row + 1) * 64)).save(OUT / "tiles" / f"{key}.png")

    for key, (rel, box) in PROPS.items():
        img = load(OLD_PACK / rel)
        if box:
            img = img.crop(box)
        img.save(OUT / "props" / f"{key}.png")

    for key, rel in UI.items():
        shutil.copyfile(OLD_PACK / rel, OUT / "ui" / f"{key}.png")

    (OUT / "LICENSE.txt").write_text(
        "Tiny Swords by Pixel Frog — https://pixelfrog-assets.itch.io/tiny-swords\n"
        "- Free Pack (Knights units): free for personal and commercial projects, modification allowed;\n"
        "  redistribution, resale or repackaging of the assets is not permitted.\n"
        "- Old version (goblins, buildings, terrain, UI): CC0 1.0 Universal\n",
        encoding="utf-8",
    )
    print(f"extracted to {OUT}: {count} chars, {len(TILES)} tiles, {len(PROPS)} props, {len(UI)} ui")


if __name__ == "__main__":
    main()
