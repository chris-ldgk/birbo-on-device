import { execAsync } from "./execAsync.ts";

export const codecs = ["h264", "mjpeg", "mp4"] as const;

export interface RecordVideoOptions {
  output: string;
  timeout: number;
  codec?: "mjpeg" | "yuv420";
  level?: number;
  segment?: number;
  framerate?: number;
  width?: number;
  height?: number;
  denoise?: "cdn_off";
}

function buildArguments(options: RecordVideoOptions) {
  const args: string[] = [];
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined) {
      continue;
    } else if (typeof value === "boolean") {
      args.push(`--${key}`);
    } else {
      args.push(`--${key} ${value}`);
    }
  }
  return args.join(" ");
}

export async function recordVideoOnCamera(options: RecordVideoOptions) {
  const {
    output,
    timeout,
    codec,
    segment,
    level,
    framerate = 30,
    width = 1280,
    height = 720,
    denoise,
  } = options;
  const args = buildArguments({
    output,
    timeout,
    codec,
    level,
    segment,
    framerate,
    width,
    height,
    denoise,
  });
  const command = `rpicam-vid ${args}`;

  await execAsync(command);
}
