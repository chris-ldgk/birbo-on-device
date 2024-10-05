import { resolve } from "node:path";
import { mkdir, unlink } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { recordVideoOnCamera } from "./utils/camera.ts";
import { execAsync } from "./utils/execAsync.ts";
import {
  destroySensor,
  getDistance,
  initializeSensor,
} from "./utils/sensor.ts";
import { getEnv } from "./utils/env.ts";
import { uploadFile } from "./utils/upload.ts";

const {
  TRIGGER_DISTANCE,
  TRIGGER_CHECK_INTERVAL,
  VIDEO_RECORDING_DURATION,
  VIDEO_FRAMERATE,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
} = getEnv();

const BUCKET_NAME = "videos";
const VIDEO_DIR = resolve(process.cwd(), "videos");

const UNPROCESSED_SUFFIX = "h264";
const PROCESSED_SUFFIX = "mp4";

async function recordVideo(timestamp: number) {
  console.log(`Recording video ${timestamp}...`);
  await recordVideoOnCamera({
    output: `${VIDEO_DIR}/${timestamp}.${UNPROCESSED_SUFFIX}`,
    timeout: VIDEO_RECORDING_DURATION,
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    framerate: VIDEO_FRAMERATE,
    level: 4.2,
  });
  console.log(`Video ${timestamp} recorded`);
}

async function deleteUnprocessedVideo(timestamp: number) {
  console.log(`Deleting unprocessed video ${timestamp}...`);
  await unlink(`${VIDEO_DIR}/${timestamp}.${UNPROCESSED_SUFFIX}`);
  console.log(`Unprocessed video ${timestamp} deleted`);
}

async function uploadVideo(timestamp: number) {
  console.log(`Uploading video ${timestamp}...`);
  const file = createReadStream(
    `${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`
  );
  await uploadFile(file, BUCKET_NAME, `${timestamp}.${PROCESSED_SUFFIX}`);
}

async function convertVideo(timestamp: number) {
  console.log(`Converting video ${timestamp}...`);
  await execAsync(
    `ffmpeg -framerate 30 -i ${VIDEO_DIR}/${timestamp}.${UNPROCESSED_SUFFIX} -c copy ${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`
  );
  console.log(`Video ${timestamp} converted`);
}

async function deleteProcessedVideo(timestamp: number) {
  console.log(`Deleting processed video ${timestamp}...`);
  await unlink(`${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`);
  console.log(`Processed video ${timestamp} deleted`);
}

async function videoFlow() {
  await mkdir(VIDEO_DIR, { recursive: true });
  const now = Date.now();
  await recordVideo(now);
  await convertVideo(now);
  await deleteUnprocessedVideo(now);
  await uploadVideo(now);
  await deleteProcessedVideo(now);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastUpdate: number = 0;
let lastTrigger: number = 0;
let stop: boolean = false;

async function main() {
  initializeSensor();
  while (!stop) {
    console.log({
      lastUpdate,
      now: performance.now(),
      diff: performance.now() - lastUpdate,
    });
    try {
      const distance = await getDistance();
      if (
        distance < TRIGGER_DISTANCE &&
        performance.now() - lastTrigger > VIDEO_RECORDING_DURATION
      ) {
        lastTrigger = performance.now();
        await videoFlow();
      }
      lastUpdate = performance.now();
    } catch (e) {
      console.error(e);
    }
    await sleep(TRIGGER_CHECK_INTERVAL);
  }
}

await main();

process.on("SIGINT", () => {
  stop = true;
  destroySensor();
  process.exit(0);
});
