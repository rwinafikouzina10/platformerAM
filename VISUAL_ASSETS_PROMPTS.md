# Visual Assets - AI Generation Prompts

This document contains detailed prompts for generating all visual assets for "Faris & The Letter Oasis" - an Arabic letter learning endless runner game set in a desert/oasis theme.

**Game Style:** Colorful, child-friendly, cartoon/pixel-art hybrid style. Similar to Kenney assets and Pixel Adventure aesthetic.

**Target Audience:** Children learning Arabic letters

---

## 1. PLAYER CHARACTER (Adventurer)

### Base Character Design
**Theme:** Young adventurer/explorer in desert setting, friendly and approachable for children.

#### player_idle (Standing Pose)
- **Size:** 80x110 pixels
- **Transparency:** Yes, PNG with transparent background
- **Style:** Pixel art with smooth edges, 2D side-view platformer character
- **Prompt:** "Pixel art character, young adventurer standing idle, side view facing right. Wearing explorer outfit with tan/khaki shorts, light blue shirt, brown boots, and a small backpack. Friendly round face with simple features. Arms relaxed at sides. Desert explorer theme. Transparent background. 80x110 pixels. Child-friendly cartoon style similar to Kenney game assets."

#### player_walk1 (Walking Frame 1)
- **Size:** 80x110 pixels
- **Transparency:** Yes, PNG with transparent background
- **Style:** Same as idle, walking animation frame
- **Prompt:** "Pixel art character, young adventurer mid-walk cycle frame 1, side view facing right. Left leg forward, right arm forward. Same outfit as standing pose: tan shorts, light blue shirt, brown boots, small backpack. Transparent background. 80x110 pixels. Walking animation frame for 2D platformer."

#### player_walk2 (Walking Frame 2)
- **Size:** 80x110 pixels
- **Transparency:** Yes, PNG with transparent background
- **Style:** Same as idle, walking animation frame
- **Prompt:** "Pixel art character, young adventurer mid-walk cycle frame 2, side view facing right. Right leg forward, left arm forward. Same outfit: tan shorts, light blue shirt, brown boots, small backpack. Transparent background. 80x110 pixels. Walking animation frame for 2D platformer."

#### player_jump (Jumping Pose)
- **Size:** 80x110 pixels
- **Transparency:** Yes, PNG with transparent background
- **Style:** Dynamic jumping pose
- **Prompt:** "Pixel art character, young adventurer jumping upward, side view facing right. Arms raised up, legs tucked slightly. Excited expression. Same explorer outfit: tan shorts, light blue shirt, brown boots, backpack. Dynamic upward motion pose. Transparent background. 80x110 pixels."

#### player_fall (Falling Pose)
- **Size:** 80x110 pixels
- **Transparency:** Yes, PNG with transparent background
- **Style:** Falling/descending pose
- **Prompt:** "Pixel art character, young adventurer falling downward, side view facing right. Arms spread out for balance, legs extended below. Slightly worried but not scared expression. Same explorer outfit. Downward falling pose. Transparent background. 80x110 pixels."

#### player_hurt (Hit/Hurt Pose)
- **Size:** 80x110 pixels
- **Transparency:** Yes, PNG with transparent background
- **Style:** Recoiling pose showing damage taken
- **Prompt:** "Pixel art character, young adventurer recoiling from hit, side view. Eyes closed or squinting, slight grimace. Body leaning back as if pushed. Same explorer outfit. Shows impact but not violent - child-friendly hurt animation. Transparent background. 80x110 pixels."

#### player_duck (Ducking Pose)
- **Size:** 80x110 pixels
- **Transparency:** Yes, PNG with transparent background
- **Style:** Crouching/ducking pose
- **Prompt:** "Pixel art character, young adventurer crouching/ducking low, side view facing right. Knees bent, body lowered, head down. Same explorer outfit. Avoiding obstacle pose. Transparent background. 80x110 pixels."

#### player_action (Double Jump/Action Pose)
- **Size:** 80x110 pixels
- **Transparency:** Yes, PNG with transparent background
- **Style:** Dynamic action pose
- **Prompt:** "Pixel art character, young adventurer doing aerial spin or double jump, side view. Arms and legs spread in dynamic star-like pose. Excited expression. Same explorer outfit. High-energy action pose. Transparent background. 80x110 pixels."

---

## 2. PARALLAX BACKGROUND LAYERS

**Theme:** Rocky desert landscape with depth, Middle Eastern/Arabian oasis setting. Colors should be warm (oranges, tans, browns) with hints of blue sky.

### parallax_mountains (Furthest Layer)
- **Size:** 1280x720 pixels (tileable horizontally)
- **Transparency:** Partial - sky area should blend or be transparent
- **Style:** Soft, low-detail silhouette style for distant mountains
- **Prompt:** "Parallax background layer, distant desert mountains silhouette, tileable horizontally. Very soft edges, low contrast, hazy purple-brown mountains against pale orange/peach sky. Minimal detail - just shapes suggesting far-away rocky peaks. Should tile seamlessly left-to-right. 1280x720 pixels. Bottom portion can be transparent or gradient fade. Arabian desert landscape style."

### parallax_far (Far Layer)
- **Size:** 1280x720 pixels (tileable horizontally)
- **Transparency:** Yes, upper portion transparent
- **Style:** Medium-low detail rocky terrain
- **Prompt:** "Parallax background layer, far desert rocky terrain, tileable horizontally. Medium-brown rocky hills and mesas in distance. More detail than mountains but still soft. Some variation in rock formations. Warm tan and brown colors. Upper 60% transparent. Seamless horizontal tile. 1280x720 pixels. Arabian desert landscape."

### parallax_mid (Middle Layer)
- **Size:** 1280x720 pixels (tileable horizontally)
- **Transparency:** Yes, upper portion transparent
- **Style:** Medium detail desert terrain with some features
- **Prompt:** "Parallax background layer, mid-ground desert terrain, tileable horizontally. Rocky outcrops, small cliffs, desert shrubs silhouettes. More saturated warm browns and oranges. Medium detail level. Upper 50% transparent. Occasional small cactus or rock formation silhouettes. Seamless horizontal tile. 1280x720 pixels."

### parallax_close (Closest Layer)
- **Size:** 1280x720 pixels (tileable horizontally)
- **Transparency:** Yes, upper portion transparent
- **Style:** Higher detail foreground elements
- **Prompt:** "Parallax background layer, close foreground desert elements, tileable horizontally. Large rocks, desert plants, detailed sand dunes in foreground. Rich warm browns, tans, and orange tones. Highest detail of parallax layers. Upper 40% transparent. Some grass tufts and small stones. Seamless horizontal tile. 1280x720 pixels."

### Solid Backgrounds (Optional)

#### bg_yellow
- **Size:** 1280x720 pixels
- **Transparency:** No
- **Prompt:** "Solid gradient background, warm yellow/sand color. Subtle gradient from lighter yellow at top to slightly darker tan at bottom. Desert sky feeling. 1280x720 pixels. No objects, just color gradient."

#### bg_blue
- **Size:** 1280x720 pixels
- **Transparency:** No
- **Prompt:** "Solid gradient background, soft blue sky color. Subtle gradient from light blue at top to pale blue/white at horizon. Peaceful sky feeling. 1280x720 pixels."

#### bg_brown
- **Size:** 1280x720 pixels
- **Transparency:** No
- **Prompt:** "Solid gradient background, warm brown/sepia tones. Evening desert sky feeling. Gradient from darker brown at top to lighter tan at bottom. 1280x720 pixels."

---

## 3. TERRAIN TILES (Sand/Desert)

**Theme:** Sandy desert ground tiles in Kenney platformer style. Warm tan/beige colors.

### sand_mid (Main Ground Tile)
- **Size:** 70x70 pixels
- **Transparency:** No (solid tile)
- **Style:** Pixel art platformer tile
- **Prompt:** "Pixel art ground tile, sandy desert terrain, top-down visible surface. Top edge shows grass/sand tufts, main body is packed sand with subtle texture variation. Warm tan/beige color (#D4A574 main, darker edges). Flat top surface for character to walk on. 70x70 pixels. Seamless tileable design. Kenney platformer style."

### sand_left (Ground Left Edge)
- **Size:** 70x70 pixels
- **Transparency:** Partial - left side rounded/transparent
- **Style:** Left edge cap for ground
- **Prompt:** "Pixel art ground tile, sandy desert terrain, LEFT edge piece. Rounded left edge that curves down, flat top and right edges for connecting to mid tiles. Same tan/beige sand texture. 70x70 pixels. Kenney platformer tile style."

### sand_right (Ground Right Edge)
- **Size:** 70x70 pixels
- **Transparency:** Partial - right side rounded/transparent
- **Style:** Right edge cap for ground
- **Prompt:** "Pixel art ground tile, sandy desert terrain, RIGHT edge piece. Rounded right edge that curves down, flat top and left edges for connecting to mid tiles. Same tan/beige sand texture. 70x70 pixels. Kenney platformer tile style."

### sand_center (Underground Fill)
- **Size:** 70x70 pixels
- **Transparency:** No
- **Style:** Underground/fill tile
- **Prompt:** "Pixel art underground tile, packed sand/dirt fill. No grass on top - just solid tan/brown earth texture. Slightly darker than surface tiles. Used to fill below ground level. Seamless tileable. 70x70 pixels."

### sand_half (Half-Height Platform)
- **Size:** 70x70 pixels
- **Transparency:** Yes - bottom half transparent
- **Style:** Thin floating platform
- **Prompt:** "Pixel art platform tile, half-height sandy platform. Only top 35 pixels are solid, bottom half transparent. Sandy texture with grass tufts on top. Used for floating platforms. 70x70 pixels total, top half solid."

### sand_half_left (Half-Height Left Edge)
- **Size:** 70x70 pixels
- **Transparency:** Yes - bottom and partial left transparent
- **Style:** Half platform left cap
- **Prompt:** "Pixel art platform tile, half-height sandy platform LEFT edge. Rounded left edge, only top portion solid. Matches sand_half style. 70x70 pixels."

### sand_half_mid (Half-Height Middle)
- **Size:** 70x70 pixels
- **Transparency:** Yes - bottom half transparent
- **Style:** Half platform middle section
- **Prompt:** "Pixel art platform tile, half-height sandy platform MIDDLE section. Flat left and right edges for connecting, only top 35px solid. Tileable. 70x70 pixels."

### sand_half_right (Half-Height Right Edge)
- **Size:** 70x70 pixels
- **Transparency:** Yes - bottom and partial right transparent
- **Style:** Half platform right cap
- **Prompt:** "Pixel art platform tile, half-height sandy platform RIGHT edge. Rounded right edge, only top portion solid. 70x70 pixels."

### sand_hill_left (Hill Left Slope)
- **Size:** 70x70 pixels
- **Transparency:** Partial - diagonal transparent
- **Style:** Sloped terrain piece
- **Prompt:** "Pixel art terrain tile, sandy hill LEFT slope. Diagonal slope rising from bottom-left to top-right. Sandy texture. Creates hill/ramp effect. 70x70 pixels. Kenney style."

### sand_hill_right (Hill Right Slope)
- **Size:** 70x70 pixels
- **Transparency:** Partial - diagonal transparent
- **Style:** Sloped terrain piece
- **Prompt:** "Pixel art terrain tile, sandy hill RIGHT slope. Diagonal slope rising from bottom-right to top-left. Sandy texture. Creates hill/ramp effect. 70x70 pixels. Kenney style."

---

## 4. COLLECTIBLE FRUITS (Animated Spritesheets)

**Theme:** Bouncy, shiny animated fruits. Pixel art style with sparkle/shine animation.
**Format:** Horizontal spritesheet, 17 frames, each frame 32x32 pixels
**Total spritesheet size:** 544x32 pixels (17 frames × 32px)

### apple
- **Size:** 544x32 pixels (17 frames of 32x32)
- **Transparency:** Yes
- **Style:** Animated pixel art with idle bounce/sparkle
- **Prompt:** "Pixel art spritesheet, red apple collectible item, 17 frame animation in horizontal strip. Each frame 32x32 pixels. Animation shows subtle bounce and rotating sparkle/shine effect. Bright red apple with small green leaf, cartoony style. Frames show: idle, slight squash, stretch, sparkle appears, sparkle rotates around apple, return to idle. Loop-friendly. Transparent background. Total size 544x32 pixels."

### banana
- **Size:** 544x32 pixels (17 frames of 32x32)
- **Transparency:** Yes
- **Style:** Animated pixel art
- **Prompt:** "Pixel art spritesheet, yellow banana bunch collectible item, 17 frame animation in horizontal strip. Each frame 32x32 pixels. Animation shows bounce and sparkle effect. Bright yellow banana bunch (2-3 bananas), cartoony style. Sparkle animation rotating around. Transparent background. Total size 544x32 pixels."

### cherry
- **Size:** 544x32 pixels (17 frames of 32x32)
- **Transparency:** Yes
- **Style:** Animated pixel art
- **Prompt:** "Pixel art spritesheet, red cherries collectible item, 17 frame animation in horizontal strip. Each frame 32x32 pixels. Two cherries connected by stems with green leaf. Animation shows bounce and sparkle effect. Bright red, shiny appearance. Transparent background. Total size 544x32 pixels."

### orange
- **Size:** 544x32 pixels (17 frames of 32x32)
- **Transparency:** Yes
- **Style:** Animated pixel art
- **Prompt:** "Pixel art spritesheet, orange fruit collectible item, 17 frame animation in horizontal strip. Each frame 32x32 pixels. Round orange with small leaf, textured peel appearance. Animation shows bounce and sparkle effect. Bright orange color. Transparent background. Total size 544x32 pixels."

### melon
- **Size:** 544x32 pixels (17 frames of 32x32)
- **Transparency:** Yes
- **Style:** Animated pixel art
- **Prompt:** "Pixel art spritesheet, watermelon slice collectible item, 17 frame animation in horizontal strip. Each frame 32x32 pixels. Triangular watermelon slice showing red flesh, black seeds, green rind. Animation shows bounce and sparkle effect. Transparent background. Total size 544x32 pixels."

### kiwi
- **Size:** 544x32 pixels (17 frames of 32x32)
- **Transparency:** Yes
- **Style:** Animated pixel art
- **Prompt:** "Pixel art spritesheet, kiwi fruit collectible item, 17 frame animation in horizontal strip. Each frame 32x32 pixels. Halved kiwi showing green interior with seeds and brown fuzzy exterior. Animation shows bounce and sparkle effect. Transparent background. Total size 544x32 pixels."

### strawberry
- **Size:** 544x32 pixels (17 frames of 32x32)
- **Transparency:** Yes
- **Style:** Animated pixel art
- **Prompt:** "Pixel art spritesheet, strawberry collectible item, 17 frame animation in horizontal strip. Each frame 32x32 pixels. Red strawberry with yellow seeds and green leaf top. Animation shows bounce and sparkle effect. Transparent background. Total size 544x32 pixels."

### collected (Collection Effect)
- **Size:** 192x32 pixels (6 frames of 32x32)
- **Transparency:** Yes
- **Style:** Disappearing/collected effect animation
- **Prompt:** "Pixel art spritesheet, item collected feedback effect, 6 frame animation in horizontal strip. Each frame 32x32 pixels. Shows sparkles/stars bursting outward and fading. Golden/yellow sparkle particles expanding from center then disappearing. Used when player collects item. Transparent background. Total size 192x32 pixels."

### Coin Animation (6 individual images)

#### coin1 through coin6
- **Size:** 32x32 pixels each
- **Transparency:** Yes
- **Style:** Rotating gold star coin
- **Prompt for coin1:** "Pixel art gold star coin, rotation frame 1 of 6, front view. Golden star shape inside circular coin. Shiny metallic appearance. 32x32 pixels. Transparent background."
- **Prompt for coin2:** "Pixel art gold star coin, rotation frame 2 of 6, slightly angled. Star coin rotating, showing slight 3D depth. 32x32 pixels. Transparent background."
- **Prompt for coin3:** "Pixel art gold star coin, rotation frame 3 of 6, side angle. Coin at 60-degree rotation showing edge. 32x32 pixels. Transparent background."
- **Prompt for coin4:** "Pixel art gold star coin, rotation frame 4 of 6, thin edge view. Coin almost sideways, very thin appearance. 32x32 pixels. Transparent background."
- **Prompt for coin5:** "Pixel art gold star coin, rotation frame 5 of 6, opposite side angle. Coin rotating back, reverse side visible. 32x32 pixels. Transparent background."
- **Prompt for coin6:** "Pixel art gold star coin, rotation frame 6 of 6, nearly front again. Almost completed rotation back to front view. 32x32 pixels. Transparent background."

---

## 5. OBSTACLES & HAZARDS

### spikes
- **Size:** 32x16 pixels (will be scaled 2x in game to 64x32)
- **Transparency:** Yes
- **Style:** Dangerous ground hazard
- **Prompt:** "Pixel art ground spikes hazard, desert/sand colored. 4 triangular spikes pointing upward. Sandy brown/tan base merging with ground, silver/gray metallic spike tips. Dangerous but not gory - child-friendly design. 32x16 pixels. Transparent background."

### slime (Enemy - Optional)
- **Size:** 32x32 pixels
- **Transparency:** Yes
- **Style:** Cute blob enemy
- **Prompt:** "Pixel art slime enemy, cute blob creature. Green gelatinous body with simple dot eyes. Friendly-looking despite being enemy. Bouncy appearance. Desert variation could be tan/sand colored. 32x32 pixels. Transparent background."

### slime_walk (Enemy Animation - Optional)
- **Size:** 128x32 pixels (4 frames of 32x32)
- **Transparency:** Yes
- **Style:** Animated bouncing movement
- **Prompt:** "Pixel art spritesheet, slime enemy walking animation, 4 frames horizontal strip. Each frame 32x32 pixels. Shows slime squashing and stretching as it bounces/moves. Cute bouncy movement. Transparent background. Total size 128x32 pixels."

---

## 6. UI BUTTONS

**Theme:** Clean, rounded, child-friendly buttons with icons. Pixel Adventure / Kenney UI style.

### btn_play
- **Size:** 64x64 pixels
- **Transparency:** Yes
- **Style:** Circular play button
- **Prompt:** "Pixel art UI button, play/start button. Circular green button with white play triangle icon (pointing right). Slight 3D bevel effect, darker green shadow on bottom. Child-friendly game UI style. 64x64 pixels. Transparent background."

### btn_restart
- **Size:** 64x64 pixels
- **Transparency:** Yes
- **Style:** Circular restart button
- **Prompt:** "Pixel art UI button, restart/retry button. Circular orange button with white circular arrow icon (restart symbol). Slight 3D bevel effect. Child-friendly game UI style. 64x64 pixels. Transparent background."

### btn_back
- **Size:** 64x64 pixels
- **Transparency:** Yes
- **Style:** Circular back button
- **Prompt:** "Pixel art UI button, back/return button. Circular blue button with white left-pointing arrow icon. Slight 3D bevel effect. Child-friendly game UI style. 64x64 pixels. Transparent background."

### btn_settings
- **Size:** 64x64 pixels
- **Transparency:** Yes
- **Style:** Circular settings button
- **Prompt:** "Pixel art UI button, settings/options button. Circular gray button with white gear/cog icon. Slight 3D bevel effect. Child-friendly game UI style. 64x64 pixels. Transparent background."

### btn_next
- **Size:** 64x64 pixels
- **Transparency:** Yes
- **Style:** Circular next button
- **Prompt:** "Pixel art UI button, next/forward button. Circular green button with white right-pointing arrow icon. Slight 3D bevel effect. Child-friendly game UI style. 64x64 pixels. Transparent background."

### btn_previous
- **Size:** 64x64 pixels
- **Transparency:** Yes
- **Style:** Circular previous button
- **Prompt:** "Pixel art UI button, previous button. Circular green button with white left-pointing arrow icon. Slight 3D bevel effect. Child-friendly game UI style. 64x64 pixels. Transparent background."

### btn_close
- **Size:** 64x64 pixels
- **Transparency:** Yes
- **Style:** Circular close button
- **Prompt:** "Pixel art UI button, close/exit button. Circular red button with white X icon. Slight 3D bevel effect. Child-friendly game UI style. 64x64 pixels. Transparent background."

---

## 7. DECORATIVE ELEMENTS

### palm_tree
- **Size:** 90x160 pixels
- **Transparency:** Yes
- **Style:** Desert oasis palm tree
- **Prompt:** "Pixel art palm tree, desert oasis style. Brown textured trunk with horizontal stripe pattern. Green palm fronds/leaves spreading from top in all directions. Tropical but desert-appropriate. Slight cartoon style. 90x160 pixels. Transparent background."

### cactus
- **Size:** 60x80 pixels
- **Transparency:** Yes
- **Style:** Classic desert cactus
- **Prompt:** "Pixel art cactus, classic saguaro style with arms. Green body with lighter green highlights. Small spines visible. Two arms branching from main body. Desert decoration, not a hazard (no spiky threat appearance). 60x80 pixels. Transparent background."

### oasis (Water Feature)
- **Size:** 120x60 pixels
- **Transparency:** Yes
- **Style:** Small oasis water pool
- **Prompt:** "Pixel art oasis water feature, top-down/side view. Blue water ellipse/pool with lighter blue highlights showing reflection. Small green plants/reeds around edges. Desert water source decoration. 120x60 pixels. Transparent background."

---

## 8. UI ELEMENTS (Generated but could be images)

These are currently procedurally generated but could be replaced with image assets:

### heart (Lives Indicator)
- **Size:** 40x40 pixels
- **Transparency:** Yes
- **Style:** Classic game heart
- **Prompt:** "Pixel art heart icon, game lives indicator. Bright red heart shape with pink highlight in upper left. Slight 3D appearance. Classic video game health/lives heart. 40x40 pixels. Transparent background."

### star (Feedback Effect)
- **Size:** 60x60 pixels
- **Transparency:** Yes
- **Style:** Shiny gold star
- **Prompt:** "Pixel art star icon, collectible feedback star. Golden yellow 5-pointed star with orange outline and white sparkle highlight. Shiny celebratory appearance. Used for positive feedback effects. 60x60 pixels. Transparent background."

### joystick_base
- **Size:** 100x100 pixels
- **Transparency:** Partial (semi-transparent)
- **Style:** Virtual joystick background
- **Prompt:** "Pixel art virtual joystick base, circular touch control background. Semi-transparent dark gray/black circle with lighter gray ring border. Subtle inner circle guide showing movement range. Mobile game touch control style. 100x100 pixels. 60% opacity."

### joystick_thumb
- **Size:** 50x50 pixels
- **Transparency:** Partial (semi-transparent)
- **Style:** Virtual joystick movable part
- **Prompt:** "Pixel art virtual joystick thumb/stick, circular touch control. Semi-transparent white/light gray circle. Sits on top of joystick base. Draggable control appearance. 50x50 pixels. 80% opacity."

### jump_button
- **Size:** 80x80 pixels
- **Transparency:** Partial (semi-transparent)
- **Style:** Virtual jump button
- **Prompt:** "Pixel art virtual jump button, circular touch control. Blue circle with white upward-pointing triangle/arrow in center. Semi-transparent. Mobile game jump control. Action button appearance. 80x80 pixels. 70% opacity."

---

## COLOR PALETTE REFERENCE

### Primary Colors
- **Sand/Ground:** #D4A574 (main), #B8956A (shadow), #E8C49A (highlight)
- **Sky:** #87CEEB (blue), #F5DEB3 (desert yellow), #E8D4B8 (sunset)
- **Player Shirt:** #87CEEB (light blue)
- **Player Shorts:** #D4A574 (tan/khaki)
- **Gold/UI Accent:** #F4D03F (main), #8B4513 (border)
- **Heart Red:** #E74C3C
- **Success Green:** #27AE60
- **Error Red:** #E74C3C
- **UI Background:** #2C3E50, #1A1A2E

### Arabic Letter Circle Colors
- **Circle Background:** #F4D03F (golden yellow)
- **Circle Border:** #8B4513 (brown)
- **Text Color:** #2C1810 (dark brown)

---

## FILE ORGANIZATION

```
assets/
├── images/
│   ├── adventurer/
│   │   └── Poses/
│   │       ├── adventurer_stand.png
│   │       ├── adventurer_walk1.png
│   │       ├── adventurer_walk2.png
│   │       ├── adventurer_jump.png
│   │       ├── adventurer_fall.png
│   │       ├── adventurer_hurt.png
│   │       ├── adventurer_duck.png
│   │       └── adventurer_action1.png
│   ├── background/
│   │   ├── Yellow.png
│   │   ├── Blue.png
│   │   └── Brown.png
│   ├── parallax/
│   │   ├── rocky-mountains.png
│   │   ├── rocky-far.png
│   │   ├── rocky-mid.png
│   │   └── rocky-close.png
│   ├── terrain/
│   │   ├── sandLeft.png
│   │   ├── sandMid.png
│   │   ├── sandRight.png
│   │   ├── sandCenter.png
│   │   ├── sandHalf.png
│   │   ├── sandHalfLeft.png
│   │   ├── sandHalfMid.png
│   │   ├── sandHalfRight.png
│   │   ├── sandHillLeft.png
│   │   └── sandHillRight.png
│   ├── items/
│   │   ├── Apple.png (spritesheet 544x32)
│   │   ├── Bananas.png (spritesheet 544x32)
│   │   ├── Cherries.png (spritesheet 544x32)
│   │   ├── Orange.png (spritesheet 544x32)
│   │   ├── Melon.png (spritesheet 544x32)
│   │   ├── Kiwi.png (spritesheet 544x32)
│   │   ├── Strawberry.png (spritesheet 544x32)
│   │   ├── Collected.png (spritesheet 192x32)
│   │   └── star coin rotate [1-6].png
│   ├── enemies/
│   │   ├── spikes.png
│   │   ├── slime.png
│   │   └── slime_walk.png
│   ├── ui/
│   │   ├── Play.png
│   │   ├── Restart.png
│   │   ├── Back.png
│   │   ├── Settings.png
│   │   ├── Next.png
│   │   ├── Previous.png
│   │   └── Close.png
│   └── decorations/
│       ├── palm_tree.png
│       ├── cactus.png
│       └── oasis.png
```

---

## GENERATION TIPS

1. **Consistency:** Generate all player poses in same session to maintain consistent style
2. **Spritesheets:** May need to generate individual frames and combine into spritesheet
3. **Transparency:** Always request PNG format with transparent background
4. **Pixel Art:** Specify "no anti-aliasing" or "hard pixel edges" if getting blurry results
5. **Tileable:** For terrain and parallax, test that edges connect seamlessly
6. **Color Match:** Use the hex color codes provided to maintain visual consistency
7. **Size Exact:** AI may not respect exact pixel sizes - resize in image editor after generation
