import { exec } from "node:child_process";

export async function execAsync(command: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        if (child.exitCode === null || child.exitCode !== 0) {
          reject(new Error(`Command failed with exit code ${child.exitCode}`));
          if (stderr) console.error(stderr);
        }
        if (stdout) console.log(stdout);
        resolve(child.exitCode ?? 1);
      }
    });
  });
}
