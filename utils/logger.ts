import { pino } from "pino";
import type { Logger } from "pino";

let logger: Logger | null = null;

export function getLogger() {
  if (!logger) {
    logger = pino();
  }
  return logger;
}

export const RECORD_VIDEO_LOG = (timestamp: number) => ({
  action: "record_video",
  timestamp,
});

export const RECORD_VIDEO_SUCCESS_LOG = (timestamp: number) => ({
  action: "record_video_success",
  timestamp,
});

export const RECORD_VIDEO_FAIL_LOG = (timestamp: number) => ({
  action: "record_video_fail",
  timestamp,
});

export const DELETE_UNPROCESSED_VIDEO_LOG = (timestamp: number) => ({
  action: "delete_unprocessed_video",
  timestamp,
});

export const DELETE_UNPROCESSED_VIDEO_SUCCESS_LOG = (timestamp: number) => ({
  action: "delete_unprocessed_video_success",
  timestamp,
});

export const DELETE_UNPROCESSED_VIDEO_FAIL_LOG = (timestamp: number) => ({
  action: "delete_unprocessed_video_fail",
  timestamp,
});

export const CONVERT_VIDEO_LOG = (timestamp: number) => ({
  action: "convert_video",
  timestamp,
});

export const CONVERT_VIDEO_SUCCESS_LOG = (timestamp: number) => ({
  action: "convert_video_success",
  timestamp,
});

export const CONVERT_VIDEO_FAIL_LOG = (timestamp: number) => ({
  action: "convert_video_fail",
  timestamp,
});

export const DELETE_PROCESSED_VIDEO_LOG = (timestamp: number) => ({
  action: "delete_processed_video",
  timestamp,
});

export const DELETE_PROCESSED_VIDEO_SUCCESS_LOG = (timestamp: number) => ({
  action: "delete_processed_video_success",
  timestamp,
});

export const DELETE_PROCESSED_VIDEO_FAIL_LOG = (timestamp: number) => ({
  action: "delete_processed_video_fail",
  timestamp,
});

export const UPLOAD_VIDEO_LOG = (timestamp: number) => ({
  action: "upload_video",
  timestamp,
});

export const UPLOAD_VIDEO_SUCCESS_LOG = (timestamp: number) => ({
  action: "upload_video_success",
  timestamp,
});

export const UPLOAD_VIDEO_FAIL_LOG = (timestamp: number) => ({
  action: "upload_video_fail",
  timestamp,
});
