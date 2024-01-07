import { bottom, cat, owo } from "./lib/owo.js";
import { lescape } from "./lib/escape.js";
import chroma from 'chroma-js';
import { prefix } from "./index.js";

const gradient = (start: string, end: string, length: number) => {
  const colors: string[] = [];

  for (let i = 1; i <= length; i++) {
    colors.push(chroma.mix(start, end, i / length).hex('rgb'));
  }

  return colors;
}

const gay = async (s: string) => {
  const steps = 360 / s.length;
  let i = 0;

  return s
    .split("\n")
    .map(
      s => surroundGradient(Array.from(s)
        .map(lescape)
        .map(c => {
          if (!c.trim().length) return ' ';
          const color = chroma.hsv(steps * ++i, 0.9, 1);
          return `\\color{${color.hex('rgb')}}${c}`;
        }))
    )
    .join("\n");
};

const trans = async (s: string) => {
  const colors = ["3ae", "e7b", "fff"];
  const segments = Math.floor(s.length / 4);
  const g = [
    chroma(colors[0]).hex('rgb'),
    ...gradient(colors[0], colors[1], segments),
    ...gradient(colors[1], colors[2], segments),
    ...gradient(colors[2], colors[1], segments),
    ...gradient(colors[1], colors[0], s.length - (segments * 3) - 1),
  ];

  return s
    .split("\n")
    .map(
      (s) => surroundGradient(Array.from(s)
        .map(lescape)
        .map((c, i) => c.trim().length ? `\\color{${g[i]}}${c}` : ' '))
    )
    .join("\n");
};

const help = async (_: string): Promise<string> => {
  return '**Funny selfbot command list**\n###### <https://github.com/sussycatgirl/revolumi>\n'
    + Array.from(commands.keys()).map((item) => '- ' + prefix + item).join('\n');
}

export const commands = new Map([
  ["shrug", async (_: string) =>  "¯\\\\\\_(ツ)\\_/¯"],
  ["gay", gay],
  ["trans", trans],
  ["bottom", async (s: string) => bottom(s)],
  ["owo", owo],
  ["cat", cat],
  ["owocat", async (s: string) => owo(await cat(s))],
  ["help", help],
]);

function surroundGradient(input: string[]) {
  const left = '\$\\textsf{';
  const right = '}\$';

  let result = '';

  while (input.length) {
    let current = '';

    while (input.length && current.length + input[0].length < 128 - left.length - right.length) {
      current += input.shift();
    }

    // katex breaks if we don't separate the sections in some way so we'll put a zero width character
    result += left + current + right + '\u200b';
    current = '';
  }

  return result;
}
