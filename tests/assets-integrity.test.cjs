const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

test('all assets referenced in aether theme exist on disk in public/', () => {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const expectedAetherAssets = [
    'aether/btn_A.png',
    'aether/btn_L.png',
    'aether/btn_M.png',
    'aether/btn_S.png',
    'aether/close_red.png',
    'aether/cloud.png',
    'aether/feather.png',
    'aether/sword.png',
    'aether/search_gold.png',
    'aether/crystal.png',
    'aether/wallpaper_aether_sky.jpg'
  ];

  for (const rel of expectedAetherAssets) {
    const full = path.join(publicDir, rel);
    assert.ok(fs.existsSync(full), `Asset ${rel} must exist in public/`);
    const size = fs.statSync(full).size;
    assert.ok(size > 500, `Asset ${rel} must not be empty (size: ${size} bytes)`);
  }
});

test('wallpaper_aether_sky.jpg is high-pixel (>300KB)', () => {
  const skyPath = path.resolve(__dirname, '..', 'public', 'aether', 'wallpaper_aether_sky.jpg');
  const size = fs.statSync(skyPath).size;
  assert.ok(size > 300000, `wallpaper_aether_sky.jpg must be high definition (got ${size} bytes)`);
});

test('deathnote and kawaii external wallpapers are high-pixel (>1MB)', () => {
  const dnPath = path.resolve(__dirname, '..', 'public', 'deathnote', 'backgrounds', 'wallpaper_kira_l_divided.png');
  assert.ok(fs.existsSync(dnPath), 'wallpaper_kira_l_divided.png must exist');
  const dnSize = fs.statSync(dnPath).size;
  assert.ok(dnSize > 1000000, `deathnote wallpaper must be >1MB high-pixel (got ${dnSize} bytes)`);

  const kwPath = path.resolve(__dirname, '..', 'public', 'kawaii', 'wallpaper_kawaii_nook.png');
  assert.ok(fs.existsSync(kwPath), 'wallpaper_kawaii_nook.png must exist');
  const kwSize = fs.statSync(kwPath).size;
  assert.ok(kwSize > 1000000, `kawaii wallpaper must be >1MB high-pixel (got ${kwSize} bytes)`);
});

test('eldenring vertical wallpapers are high-definition (>1MB)', () => {
  const eldenWallpapers = [
    'eldenring/backgrounds/weary_knight_beneath_the_golden_tree.png',
    'eldenring/backgrounds/vertical_golden_tree_wallpaper.png',
    'eldenring/backgrounds/vertical_moon_ruins_wallpaper.png',
    'eldenring/backgrounds/vertical_erdtree_wallpaper.png'
  ];
  for (const rel of eldenWallpapers) {
    const full = path.resolve(__dirname, '..', 'public', rel);
    assert.ok(fs.existsSync(full), `Wallpaper ${rel} must exist`);
    const size = fs.statSync(full).size;
    assert.ok(size > 1000000, `Wallpaper ${rel} must be >1MB high-definition (got ${size} bytes)`);
  }
});

test('eldenring theme assets exist on disk in public/eldenring/', () => {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const expectedEldenAssets = [
    'eldenring/backgrounds/elden_great_rune_stone_slab.png',
    'eldenring/backgrounds/hero_landscape.png',
    'eldenring/backgrounds/weary_knight_beneath_the_golden_tree.png',
    'eldenring/backgrounds/vertical_golden_tree_wallpaper.png',
    'eldenring/backgrounds/vertical_erdtree_wallpaper.png',
    'eldenring/backgrounds/vertical_moon_ruins_wallpaper.png',
    'eldenring/textures/elden_damask_pattern.png',
    'eldenring/sidebar/calendar_sidebar.png',
    'eldenring/sidebar/cloud_sidebar.png',
    'eldenring/sidebar/gamepad_sidebar.png',
    'eldenring/sidebar/music_sidebar.png',
    'eldenring/header/header_controls.png',
    'eldenring/header/header_control_search.png',
    'eldenring/header/header_control_expand.png',
    'eldenring/header/header_control_close.png',
    'eldenring/header/title_bar.png',
    'eldenring/misc/settings_button.png',
    'eldenring/misc/search_bar.png',
    'eldenring/misc/decorative_rune_panel.png',
    'eldenring/misc/runestone_icon.png',
    'eldenring/misc/decorative_rune_great_rune.png',
    'eldenring/misc/decorative_rune_site_of_grace.png',
    'eldenring/icons/search.png',
    'eldenring/icons/close.png',
    'eldenring/icons/expand.png',
    'eldenring/icons/settings.png',
    'eldenring/header/category_game_icon.png',
    'eldenring/cards/game_card_frame.png',
    'eldenring/cards/add_card.png',
    'eldenring/textures/dark_stone_texture.png',
    'eldenring/textures/cloud_mist_texture.png',
    'eldenring/textures/embers_texture.png'
  ];

  for (const rel of expectedEldenAssets) {
    const full = path.join(publicDir, rel);
    assert.ok(fs.existsSync(full), `Asset ${rel} must exist in public/`);
    const size = fs.statSync(full).size;
    assert.ok(size > 500, `Asset ${rel} must not be empty (size: ${size} bytes)`);
  }
});

test('onepiece and candy vertical backgrounds from 01_backgrounds are high-definition (>2MB)', () => {
  const opPath = path.resolve(__dirname, '..', 'public', 'onepiece', 'backgrounds', 'straw_hat_crew_over_skull_island.png');
  assert.ok(fs.existsSync(opPath), 'straw_hat_crew_over_skull_island.png must exist');
  const opSize = fs.statSync(opPath).size;
  assert.ok(opSize > 2000000, `onepiece background must be >2MB high-definition (got ${opSize} bytes)`);

  const candyPath = path.resolve(__dirname, '..', 'public', 'candy', 'backgrounds', 'sweet_home_candy_cottage.png');
  assert.ok(fs.existsSync(candyPath), 'sweet_home_candy_cottage.png must exist');
  const candySize = fs.statSync(candyPath).size;
  assert.ok(candySize > 2000000, `candy background must be >2MB high-definition (got ${candySize} bytes)`);
});

test('onepiece theme assets exist on disk in public/onepiece/', () => {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const expectedOnePieceAssets = [
    'onepiece/backgrounds/straw_hat_crew_over_skull_island.png',
    'onepiece/backgrounds/hero_sea_ship_background.png',
    'onepiece/backgrounds/portrait_ship_background.png',
    'onepiece/backgrounds/upper_sky_ocean_background.png',
    'onepiece/icons/search.png',
    'onepiece/icons/close.png',
    'onepiece/icons/expand.png',
    'onepiece/icons/settings.png',
    'onepiece/icons/straw_hat_emblem.png',
    'onepiece/sidebar/sidebar_wood_panel.png',
    'onepiece/decorations/luffy_hat_dock.png',
    'onepiece/textures/wood_dock_texture.png',
    'onepiece/textures/ocean_texture.png',
    'onepiece/fonts/one_piece_font.ttf'
  ];

  for (const rel of expectedOnePieceAssets) {
    const full = path.join(publicDir, rel);
    assert.ok(fs.existsSync(full), `Asset ${rel} must exist in public/`);
    const size = fs.statSync(full).size;
    assert.ok(size > 500, `Asset ${rel} must not be empty (size: ${size} bytes)`);
  }
});

test('candy theme assets exist on disk in public/candy/', () => {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const expectedCandyAssets = [
    'candy/backgrounds/sweet_home_candy_cottage.png',
    'candy/backgrounds/full_candy_land_wallpaper.png',
    'candy/backgrounds/candy_castle_sky.png',
    'candy/backgrounds/candy_river_village.png',
    'candy/backgrounds/candy_cafe_dock.png',
    'candy/buttons/primary_search_button.png',
    'candy/buttons/secondary_expand_button.png',
    'candy/buttons/close_button.png',
    'candy/buttons/settings_button.png',
    'candy/decorations/lollipop_candy.png',
    'candy/decorations/cute_cat_header.png',
    'candy/decorations/strawberry_header_charm.png',
    'candy/textures/candy_sky_texture.png'
  ];

  for (const rel of expectedCandyAssets) {
    const full = path.join(publicDir, rel);
    assert.ok(fs.existsSync(full), `Asset ${rel} must exist in public/`);
    const size = fs.statSync(full).size;
    assert.ok(size > 500, `Asset ${rel} must not be empty (size: ${size} bytes)`);
  }
});

test('custom theme icons exist on disk', () => {
  const publicDir = path.resolve(__dirname, '..', 'public');
  const customLogos = [
    'stickers/star_helmet.png',
    'aether/crafting_table.png',
    'deathnote/decorations/apple.png',
    'eldenring/icons/sword.png',
    'onepiece/icons/straw_hat_emblem.png',
    'candy/decorations/lollipop_candy.png'
  ];

  for (const rel of customLogos) {
    const full = path.join(publicDir, rel);
    assert.ok(fs.existsSync(full), `Custom theme logo ${rel} must exist in public/`);
    const size = fs.statSync(full).size;
    assert.ok(size > 200, `Custom theme logo ${rel} must not be empty`);
  }
});

test('no hardcoded absolute asset src paths without getAssetUrl in tsx files', () => {
  const srcDir = path.resolve(__dirname, '..', 'src');
  function checkDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkDir(full);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        const content = fs.readFileSync(full, 'utf8');
        // Catch src="/aether/, src="/stickers/, src="/deathnote/, src="/kawaii/, src="/eldenring/, src="/onepiece/, src="/candy/
        const badSrcMatches = content.match(/src=["']\/(?:aether|stickers|deathnote|kawaii|eldenring|onepiece|candy)\/[^"']+["']/g);
        assert.strictEqual(badSrcMatches, null, `Found un-wrapped asset src in ${entry.name}: ${JSON.stringify(badSrcMatches)}`);
      }
    }
  }
  checkDir(srcDir);
});

