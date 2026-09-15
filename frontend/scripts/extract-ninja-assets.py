"""
Ninja Adventure Asset Pack (CC0, Pixel-boy & AAA) 에서 앱에 필요한 스프라이트만 잘라
frontend/public/assets/ninja/ 로 복사한다.

사용법:
  python scripts/extract-ninja-assets.py [팩 경로]
  (기본 경로: ../.tmp-ninja-pack/Ninja Adventure - Asset Pack)

출력 (캐릭터/소품은 Tiny Swords 로 대체되어 타일과 UI 만 쓴다):
  public/assets/ninja/tiles/*.png            던전 석벽·등잔 타일 (16x16)
  public/assets/ninja/ui/*.png               말풍선/이모트/아이콘
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PACK = ROOT.parent / ".tmp-ninja-pack" / "Ninja Adventure - Asset Pack"
OUT = ROOT / "public" / "assets" / "ninja"
TILE = 16

# 타일: (파일, 열, 행) 16px 격자 기준
TILES: dict[str, tuple[str, int, int]] = {
    "grass": ("Backgrounds/Tilesets/TilesetFloor.png", 2, 11),
    "grass_tuft": ("Backgrounds/Tilesets/TilesetFloor.png", 3, 11),
    "grass_detail": ("Backgrounds/Tilesets/TilesetFloor.png", 2, 12),
    "dirt": ("Backgrounds/Tilesets/TilesetFloor.png", 2, 8),
    "dirt_left": ("Backgrounds/Tilesets/TilesetFloor.png", 1, 8),
    "dirt_right": ("Backgrounds/Tilesets/TilesetFloor.png", 3, 8),
    "dirt_top": ("Backgrounds/Tilesets/TilesetFloor.png", 2, 7),
    "dirt_top_left": ("Backgrounds/Tilesets/TilesetFloor.png", 1, 7),
    "dirt_top_right": ("Backgrounds/Tilesets/TilesetFloor.png", 3, 7),
    "wall_dark": ("Backgrounds/Tilesets/TilesetDungeon.png", 3, 1),
    "wall_red": ("Backgrounds/Tilesets/TilesetDungeon.png", 5, 1),
    "wall_light": ("Backgrounds/Tilesets/TilesetDungeon.png", 2, 1),
    "wall_stone": ("Backgrounds/Tilesets/TilesetDungeon.png", 4, 1),
    "carpet_red": ("Backgrounds/Tilesets/TilesetDungeon.png", 1, 1),
    "lamp_glow": ("Backgrounds/Tilesets/TilesetDungeon.png", 2, 2),
    "lamp_stand": ("Backgrounds/Tilesets/TilesetDungeon.png", 3, 3),
}

# UI: 파일 전체 복사
UI_FILES: dict[str, str] = {
    "dialog_box": "Ui/Dialog/DialogBox.png",
    "dialog_simple": "Ui/Dialog/DialogueBoxSimple.png",
    "dialog_info": "Ui/Dialog/DialogInfo.png",
    "heart": "Ui/Receptacle/IconHeart.png",
    "hearts": "Ui/Receptacle/Heart.png",
    "lifebar_under": "Ui/Receptacle/LifeBarMiniUnder.png",
    "lifebar_progress": "Ui/Receptacle/LifeBarMiniProgress.png",
    "gold_cup": "Items/Treasure/GoldCup.png",
    "silver_cup": "Items/Treasure/SilverCup.png",
    "gold_coin": "Items/Treasure/GoldCoin.png",
    "chest": "Items/Treasure/BigTreasureChest.png",
    "sword": "Items/Weapons/Sword/Sprite.png",
    "katana": "Items/Weapons/Katana/Sprite.png",
    "big_sword": "Items/Weapons/BigSword/Sprite.png",
    "icon_guard": "Ui/Skill Icon/Items & Weapon/Guard.png",
    "icon_kunai": "Ui/Skill Icon/Items & Weapon/Kunai.png",
    "icon_shuriken": "Ui/Skill Icon/Items & Weapon/Shuriken.png",
    "icon_arrow": "Ui/Skill Icon/Items & Weapon/Arrow.png",
    "icon_amulet": "Ui/Skill Icon/Items & Weapon/Amulet.png",
    "icon_scroll": "Ui/Skill Icon/Items & Weapon/Scroll.png",
    "icon_helmet": "Ui/Skill Icon/Items & Weapon/Helmet.png",
    "icon_talk": "Ui/Skill Icon/Job & Action/Talk.png",
    "fire_particle": "FX/Particle/Fire.png",
    "spark_particle": "FX/Particle/Spark.png",
}

# 감정 이모트 (밸런스 등급 표시용): PERFECT..UNBALANCED
EMOTES: dict[str, str] = {
    "emote_love": "Ui/Emote/emote1.png",
    "emote_happy": "Ui/Emote/emote2.png",
    "emote_ok": "Ui/Emote/emote3.png",
    "emote_sweat": "Ui/Emote/emote4.png",
    "emote_angry": "Ui/Emote/emote5.png",
    "emote_question": "Ui/Emote/emote6.png",
    "emote_exclaim": "Ui/Emote/emote7.png",
    "emote_sleep": "Ui/Emote/emote8.png",
}


def crop(src: Path, box: tuple[int, int, int, int]) -> Image.Image:
    return Image.open(src).convert("RGBA").crop(box)


def main() -> None:
    pack = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PACK
    if not pack.exists():
        sys.exit(f"asset pack not found: {pack}")

    for sub in ("tiles", "ui"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)

    for key, (file, col, row) in TILES.items():
        crop(pack / file, (col * TILE, row * TILE, (col + 1) * TILE, (row + 1) * TILE)).save(OUT / "tiles" / f"{key}.png")

    for key, file in {**UI_FILES, **EMOTES}.items():
        shutil.copyfile(pack / file, OUT / "ui" / f"{key}.png")

    # 라이선스 표기
    (OUT / "LICENSE.txt").write_text(
        "Ninja Adventure Asset Pack by Pixel-boy & AAA — CC0 1.0 Universal\n"
        "https://pixel-boy.itch.io/ninja-adventure-asset-pack\n",
        encoding="utf-8",
    )
    print(f"extracted to {OUT}: {len(TILES)} tiles, {len(UI_FILES) + len(EMOTES)} ui")


if __name__ == "__main__":
    main()
