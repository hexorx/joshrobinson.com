import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import satori from "satori";
import sharp from "sharp";

export function postImagePath(id) {
  return `/og/posts/${encodeURIComponent(id).replaceAll("_", "_5F").replaceAll("%", "_")}.png`;
}
let resources;
function loadResources() {
  return (resources ??= Promise.all([
    readFile(resolve("public/hexorx/hexorx-S09-og.webp")),
    readFile(
      resolve(
        "node_modules/@fontsource/geist/files/geist-latin-700-normal.woff",
      ),
    ),
    readFile(
      resolve(
        "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff",
      ),
    ),
  ]));
}
// Build-time composition of supplied kit art, with S09 reserved for Josh's replacement.
export async function renderPostCard(title, home = false) {
  const [mascot, geist, mono] = await loadResources();
  const fontData = (buffer) =>
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );
  const mascotPng = await sharp(mascot).png().toBuffer();
  const text = (children, style) => ({
    type: "div",
    props: {
      children,
      style: { position: "absolute", display: "flex", ...style },
    },
  });
  const fontSize = title.length > 120 ? 32 : title.length > 85 ? 40 : 56;
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: 1200,
          height: 630,
          display: "flex",
          position: "relative",
          backgroundColor: "#0A0C0F",
          color: "#E8EDF2",
          fontFamily: "Geist",
        },
        children: [
          text(home ? "$ whoami" : "$ cat ./writing", {
            left: 72,
            top: 72,
            fontFamily: "Mono",
            fontSize: 22,
            color: "#C6F432",
          }),
          text(title, {
            left: 72,
            top: 136,
            width: 620,
            height: 270,
            fontSize,
            fontWeight: 700,
            lineHeight: 1.18,
            lineClamp: 3,
            overflow: "hidden",
            wordBreak: "break-word",
          }),
          text("Josh Robinson", {
            left: 72,
            top: 448,
            fontSize: 30,
            fontWeight: 700,
          }),
          text("joshrobinson.com", {
            left: 72,
            top: 520,
            fontFamily: "Mono",
            fontSize: 18,
            color: "#9AA6B2",
          }),
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                position: "absolute",
                left: 748,
                top: 72,
                width: 380,
                height: 486,
                border: "1px dashed #C6F432",
              },
              children: [
                {
                  type: "img",
                  props: {
                    src: `data:image/png;base64,${mascotPng.toString("base64")}`,
                    width: 380,
                    height: 486,
                    style: { objectFit: "contain" },
                  },
                },
                text("S09 · HEXORX · POSE: THUMBS UP · TBD", {
                  left: 0,
                  top: 0,
                  fontFamily: "Mono",
                  fontSize: 12,
                  backgroundColor: "#0A0C0F",
                  color: "#C6F432",
                }),
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Geist", data: fontData(geist), weight: 700, style: "normal" },
        { name: "Mono", data: fontData(mono), weight: 400, style: "normal" },
      ],
    },
  );
  const image = await sharp(Buffer.from(svg)).png().toBuffer();
  if (image.length > 300_000) throw new Error("Social card exceeds 300 KB");
  return image;
}
