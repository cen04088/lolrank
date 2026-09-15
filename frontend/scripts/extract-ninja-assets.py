"""
Ninja Adventure Asset Pack (CC0, Pixel-boy & AAA) 에서 앱에 필요한 스프라이트만 잘라
frontend/public/assets/ninja/ 로 복사한다.

사용법:
  python scripts/extract-ninja-assets.py [팩 경로]
  (기본 경로: ../.tmp-ninja-pack/Ninja Adventure - Asset Pack)

출력:
  public/assets/ninja/chars/{key}.png        정면 대기 1프레임 (16x16)
  public/assets/ninja/chars/{key}_face.png   초상화 (38x38)
  public/assets/ninja/chars/{key}_walk.png   걷기 스프라이트시트 (64x64, 행: 아래/위/왼/오른, 열: 4프레임)
  public/assets/ninja/tiles/*.png            반복 타일 (16x16)
  public/assets/ninja/props/*.png            나무/집/바위 등 소품
  public/assets/ninja/ui/*.png               말풍선/하트/아이콘
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

# key -> 팩의 캐릭터 폴더명. 순서가 캐릭터 선택 화면 순서다.
CHARACTERS: dict[str, str] = {
    "ninja_blue": "NinjaBlue",
    "ninja_red": "NinjaRed",
    "ninja_green": "NinjaGreen",
    "ninja_yellow": "NinjaYellow",
    "ninja_gray": "NinjaGray",
    "ninja_dark": "NinjaDark",
    "ninja_fire": "NinjaFire",
    "ninja_water": "NinjaWater",
    "ninja_thunder": "NinjaThunder",
    "ninja_leaf": "NinjaLeaf",
    "ninja_masked": "NinjaMasked",
    "ninja_mage_orange": "NinjaMageOrange",
    "samurai": "Samurai",
    "samurai_blue": "SamuraiBlue",
    "samurai_red": "SamuraiRed",
    "knight": "Knight",
    "knight_gold": "KnightGold",
    "gladiator_blue": "GladiatorBlue",
    "gladiator_red": "RedGladiator",
    "fighter_red": "FighterRed",
    "monk": "Monk",
    "hunter": "Hunter",
    "master": "Master",
    "princess": "Princess",
    "noble": "Noble",
    "boy": "Boy",
    "woman": "Woman",
    "villager": "Villager",
    "sultan": "Sultan",
    "vampire": "Vampire",
    "skeleton": "Skeleton",
    "tengu": "Tengu",
    # NPC (선택 목록에는 안 나옴)
    "npc_old_man": "OldMan",
}

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

# 소품: (파일, x0, y0, x1, y1) 픽셀 박스
PROPS: dict[str, tuple[str, int, int, int, int]] = {
    "tree_big": ("Backgrounds/Tilesets/TilesetNature.png", 64, 32, 128, 80),
    "tree_round": ("Backgrounds/Tilesets/TilesetNature.png", 256, 32, 320, 80),
    "tree_pine": ("Backgrounds/Tilesets/TilesetNature.png", 0, 32, 32, 80),
    "tree_small": ("Backgrounds/Tilesets/TilesetNature.png", 0, 0, 32, 32),
    "tree_pink": ("Backgrounds/Tilesets/TilesetNature.png", 192, 32, 256, 80),
    "bush": ("Backgrounds/Tilesets/TilesetNature.png", 96, 128, 128, 160),
    "rock_gray": ("Backgrounds/Tilesets/TilesetNature.png", 256, 80, 320, 128),
    "rock_brown": ("Backgrounds/Tilesets/TilesetNature.png", 208, 80, 256, 128),
    "stump": ("Backgrounds/Tilesets/TilesetNature.png", 32, 128, 64, 160),
    "house_orange": ("Backgrounds/Tilesets/TilesetHouse.png", 0, 0, 64, 64),
    "house_red": ("Backgrounds/Tilesets/TilesetHouse.png", 128, 0, 192, 64),
    "house_blue": ("Backgrounds/Tilesets/TilesetHouse.png", 256, 0, 304, 48),
    "dojo_sign": ("Backgrounds/Tilesets/TilesetHouse.png", 64, 64, 96, 80),
    "torii": ("Backgrounds/Tilesets/TilesetHouse.png", 0, 80, 48, 112),
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

    for sub in ("chars", "tiles", "props", "ui"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)

    for key, folder in CHARACTERS.items():
        base = pack / "Actor" / "Character" / folder
        idle = base / "SeparateAnim" / "Idle.png"
        walk = base / "SeparateAnim" / "Walk.png"
        sheet = base / "SpriteSheet.png"
        if idle.exists():
            crop(idle, (0, 0, TILE, TILE)).save(OUT / "chars" / f"{key}.png")
        else:
            # SpriteSheet: 위 4행이 걷기(아래/위/왼/오른), 첫 프레임이 정면
            crop(sheet, (0, 0, TILE, TILE)).save(OUT / "chars" / f"{key}.png")
        if walk.exists():
            shutil.copyfile(walk, OUT / "chars" / f"{key}_walk.png")
        else:
            crop(sheet, (0, 0, 4 * TILE, 4 * TILE)).save(OUT / "chars" / f"{key}_walk.png")
        shutil.copyfile(base / "Faceset.png", OUT / "chars" / f"{key}_face.png")

    for key, (file, col, row) in TILES.items():
        crop(pack / file, (col * TILE, row * TILE, (col + 1) * TILE, (row + 1) * TILE)).save(OUT / "tiles" / f"{key}.png")

    for key, (file, x0, y0, x1, y1) in PROPS.items():
        crop(pack / file, (x0, y0, x1, y1)).save(OUT / "props" / f"{key}.png")

    for key, file in {**UI_FILES, **EMOTES}.items():
        shutil.copyfile(pack / file, OUT / "ui" / f"{key}.png")

    # 라이선스 표기
    (OUT / "LICENSE.txt").write_text(
        "Ninja Adventure Asset Pack by Pixel-boy & AAA — CC0 1.0 Universal\n"
        "https://pixel-boy.itch.io/ninja-adventure-asset-pack\n",
        encoding="utf-8",
    )
    print(f"extracted to {OUT}: {len(CHARACTERS)} chars, {len(TILES)} tiles, {len(PROPS)} props, "
          f"{len(UI_FILES) + len(EMOTES)} ui")


if __name__ == "__main__":
    main()
