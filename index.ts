import { createClient } from "@supabase/supabase-js";
import { resolve } from "node:path";
// import { unlink, readFile } from "node:fs/promises";
// import { recordVideoOnCamera } from "./utils/camera";
// import { execAsync } from "./utils/execAsync";
import {
  destroySensor,
  getDistance,
  initializeSensor,
} from "./utils/sensor.ts";
import { getEnv } from "./utils/env.ts";
// import { clearSensor, readSensor } from "./utils/sensor";

const { SUPABASE_URL, SUPABASE_KEY } = getEnv();
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET_NAME = "videos";
const VIDEO_DIR = resolve(process.cwd(), "videos");

const UNPROCESSED_SUFFIX = "h264";
const PROCESSED_SUFFIX = "mp4";

// async function recordVideo(timestamp: number) {
//   console.log(`Recording video ${timestamp}...`);
//   await recordVideoOnCamera({
//     output: `${VIDEO_DIR}/${timestamp}.${UNPROCESSED_SUFFIX}`,
//     timeout: "5000",
//     width: 1920,
//     height: 1080,
//     framerate: 30,
//     level: 4.2,
//   });
//   console.log(`Video ${timestamp} recorded`);
// }

// async function deleteUnprocessedVideo(timestamp: number) {
//   console.log(`Deleting unprocessed video ${timestamp}...`);
//   await unlink(`${VIDEO_DIR}/${timestamp}.${UNPROCESSED_SUFFIX}`);
//   console.log(`Unprocessed video ${timestamp} deleted`);
// }

// async function uploadVideo(timestamp: number) {
//   console.log(`Uploading video ${timestamp}...`);
//   // Create a single supabase client for interacting with your database
//   //   const file = Bun.file(`${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`);
//   //   const content = await file.bytes();
//   const content = await readFile(
//     `${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`,
//     {
//       encoding: "binary",
//     }
//   );
//   const { error } = await supabase.storage
//     .from(BUCKET_NAME)
//     .upload(`${timestamp}.mp4`, content, {
//       contentType: `video/mp4`,
//     });
//   if (error) {
//     throw error;
//   }
// }

// async function convertVideo(timestamp: number) {
//   console.log(`Converting video ${timestamp}...`);
//   await execAsync(
//     `ffmpeg -framerate 30 -i ${VIDEO_DIR}/${timestamp}.${UNPROCESSED_SUFFIX} -c copy ${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`
//   );
//   console.log(`Video ${timestamp} converted`);
// }

// async function deleteProcessedVideo(timestamp: number) {
//   console.log(`Deleting processed video ${timestamp}...`);
//   await unlink(`${VIDEO_DIR}/${timestamp}.${PROCESSED_SUFFIX}`);
//   console.log(`Processed video ${timestamp} deleted`);
// }

async function main() {
  initializeSensor();
  while (true) {
    console.log({ distance: await getDistance() });
  }
  // await mkdir(VIDEO_DIR, { recursive: true });
  // const now = Date.now();

  // await recordVideo(now);
  // await convertVideo(now);
  // await deleteUnprocessedVideo(now);
  // await uploadVideo(now);
  // await deleteProcessedVideo(now);
}

await main();

process.on("SIGINT", () => {
  destroySensor();
  process.exit(0);
});
