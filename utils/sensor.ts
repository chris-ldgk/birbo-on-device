import { Gpio } from "onoff";

const TRIG_PIN: number = 526; // GPIO14
const ECHO_PIN: number = 527; // GPIO15

let trig: Gpio | null = null;
let echo: Gpio | null = null;

export function initializeSensor() {
  trig = new Gpio(TRIG_PIN, "out");
  echo = new Gpio(ECHO_PIN, "in");
}

export async function getDistance(): Promise<number> {
  if (!trig || !echo) {
    throw new Error("Sensor not initialized");
  }

  // Trigger a pulse with 10µs
  trig.writeSync(1);
  trig.writeSync(0);

  // Wait for the pulse to return
  let start: bigint | null = null;
  let end: bigint | null = null;
  while (echo.readSync() === 0) {
    start = process.hrtime.bigint();
  }
  while (echo.readSync() === 1) {
    end = process.hrtime.bigint();
  }
  if (!start || !end) {
    throw new Error("Invalid start or end time");
  }

  // Calculate the distance
  const duration = Number(end - start);
  return (duration * 0.034) / 2;
}

export function destroySensor() {
  trig?.unexport();
  echo?.unexport();
}
