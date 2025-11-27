# Visual Assets - AI Generation Prompts

This document contains detailed prompts for generating all visual assets for "Faris & The Letter Oasis" - an Arabic letter learning endless runner game set in a desert/oasis theme.

**Game Style:** Colorful, child-friendly, cartoon/pixel-art hybrid style. Similar to Kenney assets and Pixel Adventure aesthetic.

**Target Audience:** Children learning Arabic letters

---

## 1. PLAYER CHARACTER (Adventurer) - SPRITESHEET

### Base Character Design
**Theme:** Young adventurer/explorer in desert setting, friendly and approachable for children.

### player_spritesheet (All Poses in One Sheet)
- **Size:** 640x110 pixels (8 frames × 80px width, 1 row of 110px height)
- **Frame Size:** 80x110 pixels each
- **Transparency:** Yes, PNG with transparent background
- **Style:** Pixel art with smooth edges, 2D side-view platformer character
- **Frame Order:** idle, walk1, walk2, jump, fall, hurt, duck, action

**Full Spritesheet Prompt:**
"Pixel art character spritesheet, horizontal strip with 8 frames, each frame 80x110 pixels. Young adventurer character, side view facing right throughout. Consistent style across all frames.

Character design: Child-friendly explorer wearing tan/khaki shorts, light blue shirt, brown boots, small backpack. Friendly round face with simple features.

Frame layout (left to right):
1. IDLE: Standing relaxed, arms at sides
2. WALK1: Mid-walk, left leg forward, right arm forward
3. WALK2: Mid-walk, right leg forward, left arm forward
4. JUMP: Jumping up, arms raised, legs tucked, excited face
5. FALL: Falling down, arms spread for balance, legs extended
6. HURT: Recoiling from hit, eyes closed, leaning back
7. DUCK: Crouching low, knees bent, head down
8. ACTION: Dynamic aerial spin, arms and legs spread

Total size: 640x110 pixels. Transparent background. Kenney/Pixel Adventure style. Child-friendly cartoon aesthetic."

**Alternative: Generate Individual Frames Then Combine**

If your AI tool struggles with spritesheets, generate each frame separately with these prompts, then combine in an image editor:

#### Frame 1: Idle (Position 0-79px)
"Pixel art character, young adventurer standing idle, side view facing right. Wearing tan shorts, light blue shirt, brown boots, small backpack. Arms relaxed at sides. Friendly expression. Transparent background. 80x110 pixels. Kenney game asset style."

#### Frame 2: Walk1 (Position 80-159px)
"Pixel art character, young adventurer walk cycle frame 1, side view facing right. Left leg forward, right arm forward. Same outfit: tan shorts, light blue shirt, brown boots, backpack. Transparent background. 80x110 pixels."

#### Frame 3: Walk2 (Position 160-239px)
"Pixel art character, young adventurer walk cycle frame 2, side view facing right. Right leg forward, left arm forward. Same outfit. Transparent background. 80x110 pixels."

#### Frame 4: Jump (Position 240-319px)
"Pixel art character, young adventurer jumping upward, side view facing right. Arms raised, legs tucked. Excited expression. Same outfit. Transparent background. 80x110 pixels."

#### Frame 5: Fall (Position 320-399px)
"Pixel art character, young adventurer falling, side view facing right. Arms spread for balance, legs extended below. Slightly worried expression. Same outfit. Transparent background. 80x110 pixels."

#### Frame 6: Hurt (Position 400-479px)
"Pixel art character, young adventurer recoiling from hit, side view. Eyes closed, body leaning back. Same outfit. Child-friendly hurt pose. Transparent background. 80x110 pixels."

#### Frame 7: Duck (Position 480-559px)
"Pixel art character, young adventurer crouching/ducking, side view facing right. Knees bent, body lowered. Same outfit. Transparent background. 80x110 pixels."

#### Frame 8: Action (Position 560-639px)
"Pixel art character, young adventurer aerial spin/double jump, side view. Arms and legs spread dynamically. Excited expression. Same outfit. Transparent background. 80x110 pixels."

### Phaser Loading Code (Updated)
```javascript
// In BootScene.js - replace individual image loads with:
this.load.spritesheet('player', 'assets/images/adventurer/player_spritesheet.png', {
    frameWidth: 80,
    frameHeight: 110
});

// Animation definitions:
// Frame 0: idle
// Frame 1-2: walk/run cycle
// Frame 3: jump
// Frame 4: fall
// Frame 5: hurt
// Frame 6: duck
// Frame 7: action/double-jump
```

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

### coin_spritesheet (Rotating Coin Animation)
- **Size:** 192x32 pixels (6 frames of 32x32)
- **Frame Size:** 32x32 pixels each
- **Transparency:** Yes
- **Style:** Rotating gold star coin

**Prompt:**
"Pixel art spritesheet, rotating gold star coin, 6 frames horizontal strip. Each frame 32x32 pixels. Shows coin rotating 360 degrees.

Frame layout (left to right):
1. Front view - full star visible on golden coin
2. Slight angle - coin turning, star slightly distorted
3. Side angle - coin at 60 degrees, star compressed
4. Edge view - coin almost sideways, very thin line
5. Opposite angle - back side visible, star compressed
6. Nearly front - almost completed rotation

Golden yellow coin with star emblem. Shiny metallic appearance with highlights. Total size 192x32 pixels. Transparent background."

---

## 5. OBSTACLES & HAZARDS

### spikes
- **Size:** 32x16 pixels (will be scaled 2x in game to 64x32)
- **Transparency:** Yes
- **Style:** Dangerous ground hazard
- **Prompt:** "Pixel art ground spikes hazard, desert/sand colored. 4 triangular spikes pointing upward. Sandy brown/tan base merging with ground, silver/gray metallic spike tips. Dangerous but not gory - child-friendly design. 32x16 pixels. Transparent background."

### slime_spritesheet (Enemy - Optional)
- **Size:** 160x32 pixels (5 frames of 32x32) - idle + 4 walk frames
- **Frame Size:** 32x32 pixels each
- **Transparency:** Yes
- **Style:** Cute animated blob enemy
- **Frame Order:** idle, squash1, stretch1, squash2, stretch2

**Prompt:**
"Pixel art spritesheet, cute slime enemy, 5 frames horizontal strip. Each frame 32x32 pixels. Desert sand-colored slime blob with simple dot eyes.

Frame layout (left to right):
1. IDLE: Normal round blob shape, neutral
2. SQUASH1: Squashed flat, about to bounce
3. STRETCH1: Stretched tall, mid-bounce up
4. SQUASH2: Squashed again, landing
5. STRETCH2: Stretched, bouncing forward

Friendly-looking despite being enemy. Child-safe design. Total size 160x32 pixels. Transparent background."

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
│   │   └── player_spritesheet.png     (640x110 - 8 frames of 80x110)
│   ├── background/
│   │   ├── Yellow.png                  (1280x720)
│   │   ├── Blue.png                    (1280x720)
│   │   └── Brown.png                   (1280x720)
│   ├── parallax/
│   │   ├── rocky-mountains.png         (1280x720, tileable)
│   │   ├── rocky-far.png               (1280x720, tileable)
│   │   ├── rocky-mid.png               (1280x720, tileable)
│   │   └── rocky-close.png             (1280x720, tileable)
│   ├── terrain/
│   │   ├── sandLeft.png                (70x70)
│   │   ├── sandMid.png                 (70x70)
│   │   ├── sandRight.png               (70x70)
│   │   ├── sandCenter.png              (70x70)
│   │   ├── sandHalf.png                (70x70)
│   │   ├── sandHalfLeft.png            (70x70)
│   │   ├── sandHalfMid.png             (70x70)
│   │   ├── sandHalfRight.png           (70x70)
│   │   ├── sandHillLeft.png            (70x70)
│   │   └── sandHillRight.png           (70x70)
│   ├── items/
│   │   ├── Apple.png                   (544x32 spritesheet, 17 frames)
│   │   ├── Bananas.png                 (544x32 spritesheet, 17 frames)
│   │   ├── Cherries.png                (544x32 spritesheet, 17 frames)
│   │   ├── Orange.png                  (544x32 spritesheet, 17 frames)
│   │   ├── Melon.png                   (544x32 spritesheet, 17 frames)
│   │   ├── Kiwi.png                    (544x32 spritesheet, 17 frames)
│   │   ├── Strawberry.png              (544x32 spritesheet, 17 frames)
│   │   ├── Collected.png               (192x32 spritesheet, 6 frames)
│   │   └── coin_spritesheet.png        (192x32 spritesheet, 6 frames)
│   ├── enemies/
│   │   ├── spikes.png                  (32x16)
│   │   └── slime_spritesheet.png       (160x32 spritesheet, 5 frames)
│   ├── ui/
│   │   ├── Play.png                    (64x64)
│   │   ├── Restart.png                 (64x64)
│   │   ├── Back.png                    (64x64)
│   │   ├── Settings.png                (64x64)
│   │   ├── Next.png                    (64x64)
│   │   ├── Previous.png                (64x64)
│   │   └── Close.png                   (64x64)
│   └── decorations/
│       ├── palm_tree.png               (90x160)
│       ├── cactus.png                  (60x80)
│       └── oasis.png                   (120x60)
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
