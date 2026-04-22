import sharp from "sharp";
import { readdirSync } from "fs";
import { join } from "path";

const tasks = [
  { src: "img/destinos/Guachimontones.webp", width: 800, height: 534 },
  { src: "img/hero/portada-jalisco.webp", width: 1200, height: 675 },
  { src: "img/destinos/foodie.webp", width: 800, height: 534 },
  { src: "img/destinos/chapala1.webp", width: 800, height: 534 },
  { src: "img/destinos/mazamitla.webp", width: 800, height: 534 },
  { src: "img/destinos/tequila.webp", width: 800, height: 534 },
  { src: "img/destinos/aeropuerto.webp", width: 800, height: 534 },
  { src: "img/destinos/tonala1.1.1.webp", width: 800, height: 534 },
  { src: "img/destinos/atumedida.webp", width: 800, height: 534 },
  { src: "img/destinos/tlaquepaque.webp", width: 800, height: 534 },
];

for (const task of tasks) {
  await sharp(task.src)
    .resize(task.width, task.height, { fit: "cover", position: "centre" })
    .webp({ quality: 75 })
    .toFile(task.src.replace(".webp", "-opt.webp"));
  console.log(`✓ ${task.src}`);
}
console.log("Listo.");
