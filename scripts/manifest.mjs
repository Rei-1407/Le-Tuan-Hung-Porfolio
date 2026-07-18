/* Single source of truth for every image the site uses.
 *
 * Each entry maps a Figma node to a file under public/assets:
 *   id     — node id in the Portfolio file (cOlXV8ARFTUoFnxj8gWwm7)
 *   out    — destination path relative to public/assets
 *   frame  — which reference screenshot the node lives in (for placeholders)
 *   x/y/w/h— node bounds in design pixels, relative to its frame
 *   scale  — export scale for the real download (default 2)
 *
 * Consumed by figma-assets.mjs (real artwork via the Figma REST API) and
 * gen-placeholders.mjs (temporary crops from the low-res reference shots).
 */

export const FILE_KEY = "cOlXV8ARFTUoFnxj8gWwm7";

export const FRAMES = {
  branding: { ref: "branding.png", w: 1920, h: 7362 },
  graphic: { ref: "graphic2d.png", w: 1920, h: 6852 },
  game: { ref: "uxui.png", w: 1920, h: 887 },
};

export const MANIFEST = [
  // ------------------------------------------------------------ hero covers --
  { id: "4:4", out: "branding/hero-bg.png", frame: "branding", x: 0, y: 58, w: 1920, h: 840 },
  { id: "30:531", out: "graphic/hero-bg.png", frame: "graphic", x: 0, y: 0, w: 1920, h: 1063 },
  { id: "1:7", out: "game/hero-bg.png", frame: "game", x: 0, y: 58, w: 1920, h: 829 },

  // --------------------------------------------------------------- branding --
  { id: "12:43", out: "branding/logo-mark.png", frame: "branding", x: 113, y: 934, w: 64, h: 64, scale: 4 },
  { id: "12:48", out: "branding/header-icon-1.png", frame: "branding", x: 1585, y: 930, w: 56, h: 71, scale: 4 },
  { id: "12:49", out: "branding/header-icon-2.png", frame: "branding", x: 1612, y: 963, w: 93, h: 85, scale: 4 },
  { id: "12:50", out: "branding/header-icon-3.png", frame: "branding", x: 1776, y: 930, w: 85, h: 85, scale: 4 },
  { id: "12:58", out: "branding/logo-main.png", frame: "branding", x: 132, y: 1201, w: 398, h: 288, scale: 3 },
  { id: "12:110", out: "branding/packaging.png", frame: "branding", x: 1468, y: 1304, w: 474, h: 487 },

  // logo guidelines card
  { id: "12:123", out: "branding/guide-size.png", frame: "branding", x: 177, y: 1756, w: 338, h: 304 },
  { id: "21:72", out: "branding/guide-construction.png", frame: "branding", x: 560, y: 1640, w: 800, h: 438 },
  { id: "21:75", out: "branding/guide-safe-area.png", frame: "branding", x: 1422, y: 1771, w: 321, h: 273 },

  // colour & typography card
  { id: "21:79", out: "branding/palette.png", frame: "branding", x: 132, y: 2256, w: 702, h: 218 },
  { id: "12:129", out: "branding/logo-variant-light.png", frame: "branding", x: 234, y: 2485, w: 498, h: 146 },
  { id: "12:128", out: "branding/logo-variant-dark.png", frame: "branding", x: 881, y: 2236, w: 466, h: 227 },
  { id: "21:82", out: "branding/logo-badge-black.png", frame: "branding", x: 1347, y: 2252, w: 191, h: 195 },
  { id: "21:88", out: "branding/logo-badge-yellow.png", frame: "branding", x: 1573, y: 2283, w: 170, h: 123 },
  { id: "21:91", out: "branding/typography.png", frame: "branding", x: 1060, y: 2474, w: 573, h: 190 },

  // mascots
  { id: "21:108", out: "branding/mascot-1.png", frame: "branding", x: 132, y: 2891, w: 243, h: 303 },
  { id: "21:107", out: "branding/mascot-2.png", frame: "branding", x: 577, y: 2893, w: 288, h: 302 },
  { id: "21:112", out: "branding/mascot-3.png", frame: "branding", x: 1026, y: 2950, w: 250, h: 244 },
  { id: "21:106", out: "branding/mascot-4.png", frame: "branding", x: 1378, y: 2891, w: 409, h: 303 },

  // products
  { id: "21:187", out: "branding/product-burger.png", frame: "branding", x: 166, y: 3423, w: 460, h: 447 },
  { id: "21:186", out: "branding/product-chips.png", frame: "branding", x: 651, y: 3335, w: 617, h: 588 },
  { id: "21:188", out: "branding/product-hotdog.png", frame: "branding", x: 1275, y: 3458, w: 479, h: 342 },
  { id: "21:189", out: "branding/product-card-1.png", frame: "branding", x: 204, y: 3959, w: 368, h: 216 },
  { id: "21:183", out: "branding/product-card-2.png", frame: "branding", x: 201, y: 4195, w: 371, h: 218 },
  { id: "21:192", out: "branding/product-poster.png", frame: "branding", x: 839, y: 4024, w: 242, h: 342 },
  { id: "21:190", out: "branding/product-image-10.png", frame: "branding", x: 1311, y: 3993, w: 419, h: 189 },
  { id: "21:191", out: "branding/product-image-11.png", frame: "branding", x: 1311, y: 4200, w: 415, h: 183 },

  // brand communications
  { id: "21:235", out: "branding/comm-standee.png", frame: "branding", x: 193, y: 4706, w: 389, h: 544 },
  { id: "21:242", out: "branding/comm-banner.png", frame: "branding", x: 813, y: 4691, w: 849, h: 321 },
  { id: "21:247", out: "branding/logo-group-1.png", frame: "branding", x: 716, y: 5117, w: 492, h: 150 },
  { id: "21:251", out: "branding/logo-group-2.png", frame: "branding", x: 1285, y: 5117, w: 492, h: 150 },
  { id: "21:225", out: "branding/comm-collage-large.png", frame: "branding", x: 282, y: 5347, w: 809, h: 393 },
  { id: "21:231", out: "branding/comm-collage-tall.png", frame: "branding", x: 1141, y: 5347, w: 497, h: 983 },
  { id: "21:228", out: "branding/comm-collage-wide.png", frame: "branding", x: 282, y: 5788, w: 809, h: 542 },
  { id: "26:272", out: "branding/animlogo.png", frame: "branding", x: 282, y: 6373, w: 1356, h: 763 },
  { id: "21:37", out: "branding/footer-icon-group.png", frame: "branding", x: 20, y: 7199, w: 278, h: 85, scale: 3 },

  // ------------------------------------------------------------- 2d graphic --
  { id: "30:507", out: "graphic/brochure-01.png", frame: "graphic", x: 137, y: 1068, w: 808, h: 454 },
  { id: "30:510", out: "graphic/brochure-02.png", frame: "graphic", x: 978, y: 1068, w: 809, h: 454 },
  { id: "30:513", out: "graphic/brochure-03.png", frame: "graphic", x: 135, y: 1548, w: 810, h: 458 },
  { id: "30:516", out: "graphic/brochure-04.png", frame: "graphic", x: 978, y: 1548, w: 809, h: 452 },
  { id: "30:519", out: "graphic/brochure-05.png", frame: "graphic", x: 135, y: 2032, w: 810, h: 454 },
  { id: "30:522", out: "graphic/brochure-06.png", frame: "graphic", x: 978, y: 2032, w: 805, h: 454 },
  { id: "30:525", out: "graphic/brochure-07.png", frame: "graphic", x: 135, y: 2512, w: 810, h: 456 },
  { id: "30:528", out: "graphic/brochure-08.png", frame: "graphic", x: 978, y: 2512, w: 809, h: 453 },
  { id: "30:530", out: "graphic/brochure-video-poster.png", frame: "graphic", x: 135, y: 3022, w: 1648, h: 927 },

  { id: "30:286", out: "graphic/amath-avatar.png", frame: "graphic", x: 142, y: 4215, w: 440, h: 440 },
  { id: "30:285", out: "graphic/amath-cover.png", frame: "graphic", x: 627, y: 4215, w: 1156, h: 440 },
  { id: "30:293", out: "graphic/amath-teacher-1.png", frame: "graphic", x: 137, y: 4784, w: 384, h: 384 },
  { id: "30:294", out: "graphic/amath-teacher-2.png", frame: "graphic", x: 558, y: 4784, w: 384, h: 384 },
  { id: "30:295", out: "graphic/amath-teacher-3.png", frame: "graphic", x: 978, y: 4784, w: 383, h: 383 },
  { id: "30:296", out: "graphic/amath-teacher-4.png", frame: "graphic", x: 1399, y: 4784, w: 384, h: 384 },
  { id: "30:292", out: "graphic/amath-poster-opening.png", frame: "graphic", x: 137, y: 5195, w: 1092, h: 685 },
  { id: "30:297", out: "graphic/amath-post-teachers.png", frame: "graphic", x: 1271, y: 5195, w: 512, h: 682 },
  { id: "35:2", out: "graphic/deco-left.png", frame: "graphic", x: 0, y: 4041, w: 226, h: 109, scale: 4 },
  { id: "35:3", out: "graphic/deco-right.png", frame: "graphic", x: 1783, y: 4043, w: 137, h: 108, scale: 4 },

  { id: "35:21", out: "graphic/poster-3l.png", frame: "graphic", x: 142, y: 6185, w: 384, h: 479 },
  { id: "35:22", out: "graphic/poster-cung-nhau.png", frame: "graphic", x: 562, y: 6185, w: 387, h: 480 },
  { id: "35:24", out: "graphic/poster-weone.png", frame: "graphic", x: 982, y: 6185, w: 384, h: 480 },
  { id: "35:23", out: "graphic/poster-no-van-de.png", frame: "graphic", x: 1398, y: 6185, w: 383, h: 480 },
];
