import "dotenv/config";

interface InputEnv {
  // Supabase stuff
  SUPABASE_URL?: string;
  SUPABASE_KEY?: string;

  // Trigger stuff
  TRIGGER_DISTANCE?: string | number; // Distance in cm
  TRIGGER_CHECK_INTERVAL?: string | number; // Interval in ms
  // Video stuff
  VIDEO_RECORDING_DURATION?: string | number; // Duration in ms
  VIDEO_FRAMERATE?: string | number;
  VIDEO_WIDTH?: string | number;
  VIDEO_HEIGHT?: string | number;

  // GPIO stuff
  GPIO_TRIGGER_PIN?: string | number;
  GPIO_ECHO_PIN?: string | number;
}

interface ParsedEnv {
  SUPABASE_URL?: string;
  SUPABASE_KEY?: string;

  TRIGGER_DISTANCE: number;
  TRIGGER_CHECK_INTERVAL: number;

  VIDEO_RECORDING_DURATION: number;
  VIDEO_FRAMERATE: number;
  VIDEO_WIDTH: number;
  VIDEO_HEIGHT: number;

  GPIO_TRIGGER_PIN: number;
  GPIO_ECHO_PIN: number;
}

export function getEnv(): ParsedEnv {
  const env = process.env as InputEnv;

  return {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_KEY: env.SUPABASE_KEY,

    TRIGGER_DISTANCE: Number(env.TRIGGER_DISTANCE) ?? 10,
    TRIGGER_CHECK_INTERVAL: Number(env.TRIGGER_CHECK_INTERVAL) ?? 1000,

    VIDEO_RECORDING_DURATION: Number(env.VIDEO_RECORDING_DURATION) ?? 5000,
    VIDEO_FRAMERATE: Number(env.VIDEO_FRAMERATE) ?? 30,
    VIDEO_WIDTH: Number(env.VIDEO_WIDTH) ?? 1920,
    VIDEO_HEIGHT: Number(env.VIDEO_HEIGHT) ?? 1080,

    GPIO_TRIGGER_PIN: Number(env.GPIO_TRIGGER_PIN) ?? 526,
    GPIO_ECHO_PIN: Number(env.GPIO_ECHO_PIN) ?? 527,
  };
}
