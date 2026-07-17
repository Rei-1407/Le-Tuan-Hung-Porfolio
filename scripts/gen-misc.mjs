/* Generates the neutral "no image yet" placeholder used by new admin slots. */
import sharp from "sharp";

const svg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="800" height="600" fill="#e8e2d8"/>
    <g fill="none" stroke="#b0a489" stroke-width="6">
      <rect x="290" y="210" width="220" height="160" rx="14"/>
      <circle cx="345" cy="265" r="18"/>
      <path d="M300 350 L370 290 L420 330 L460 300 L500 350"/>
    </g>
    <text x="400" y="420" font-family="sans-serif" font-size="26" fill="#8a8272" text-anchor="middle">Chưa có ảnh</text>
  </svg>`
);

await sharp(svg).png().toFile("public/assets/placeholder.png");
console.log("placeholder ok");
