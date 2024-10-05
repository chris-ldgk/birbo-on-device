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
import {
  CONVERT_VIDEO_FAIL_LOG,
  CONVERT_VIDEO_LOG,
  CONVERT_VIDEO_SUCCESS_LOG,
  DELETE_PROCESSED_VIDEO_FAIL_LOG,
  DELETE_PROCESSED_VIDEO_LOG,
  DELETE_PROCESSED_VIDEO_SUCCESS_LOG,
  DELETE_UNPROCESSED_VIDEO_FAIL_LOG,
  DELETE_UNPROCESSED_VIDEO_LOG,
  DELETE_UNPROCESSED_VIDEO_SUCCESS_LOG,
  getLogger,
  RECORD_VIDEO_FAIL_LOG,
  RECORD_VIDEO_LOG,
  RECORD_VIDEO_SUCCESS_LOG,
  UPLOAD_VIDEO_FAIL_LOG,
  UPLOAD_VIDEO_LOG,
  UPLOAD_VIDEO_SUCCESS_LOG,
} from "./utils/logger.ts";

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

const logger = getLogger();

async function recordVideo(timestamp: number) {
  logger.info(RECORD_VIDEO_LOG(timestamp));
  try {
    await recordVideoOnCamera({
      output: `${VIDEO_DIR}/${timestamp}.${UNPROCESSED_SUFFIX}`,
      timeout: VIDEO_RECORDING_DURATION,
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      framerate: VIDEO_FRAMERATE,
      level: 4.2,
    });

    logger.info(RECORD_VIDEO_SUCCESS_LOG(timestamp));
  } catch (e) {
    logger.error(RECORD_VIDEO_FAIL_LOG(timestamp));
  }
}

async function deleteUnprocessedVideo(timestamp: number) {
  logger.info(DELETE_UNPROCESSED_VIDEO_LOG(timestamp));
  try {
    await unlink(`${VIDEO_DIR}/${timestamp}.${UNPROCESSED_SUFFIX}`);
    logger.info(DELETE_UNPROCESSED_VIDEO_SUCCESS_LOG(timestamp));
  } catch (e) {
    logger.error(DELETE_UNPROCESSED_VIDEO_FAIL_LOG(timestamp));
  }
}

async function uploadVideo(timestamp: number) {
  logger.info(UPLOAD_VIDEO_LOG(timestamp));
  try {
    const file = createReadStream(
      `${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`
    );
    await uploadFile(file, BUCKET_NAME, `${timestamp}.${PROCESSED_SUFFIX}`);
    logger.info(UPLOAD_VIDEO_SUCCESS_LOG(timestamp));
  } catch (e) {
    logger.error(UPLOAD_VIDEO_FAIL_LOG(timestamp));
  }
}

async function convertVideo(timestamp: number) {
  logger.info(CONVERT_VIDEO_LOG(timestamp));
  try {
    await execAsync(
      `ffmpeg -framerate ${VIDEO_FRAMERATE} -i ${VIDEO_DIR}/${timestamp}.${UNPROCESSED_SUFFIX} -c copy ${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`
    );
    logger.info(CONVERT_VIDEO_SUCCESS_LOG(timestamp));
  } catch (e) {
    logger.error(CONVERT_VIDEO_FAIL_LOG(timestamp));
  }
}

async function deleteProcessedVideo(timestamp: number) {
  logger.info(DELETE_PROCESSED_VIDEO_LOG(timestamp));
  try {
    await unlink(`${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`);
    logger.info(DELETE_PROCESSED_VIDEO_SUCCESS_LOG(timestamp));
  } catch (e) {
    logger.error(DELETE_PROCESSED_VIDEO_FAIL_LOG(timestamp));
  }
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
    const distance = await getDistance();
    if (
      distance < TRIGGER_DISTANCE &&
      performance.now() - lastTrigger > VIDEO_RECORDING_DURATION
    ) {
      lastTrigger = performance.now();
      await videoFlow();
    }
    lastUpdate = performance.now();
    await sleep(TRIGGER_CHECK_INTERVAL);
  }
}

await main();

process.on("SIGINT", () => {
  stop = true;
  destroySensor();
  process.exit(0);
});
