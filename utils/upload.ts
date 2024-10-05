import tus from "tus-js-client";
import { getSupabaseClient } from "./supabase.ts";
import { getEnv } from "./env.ts";

const { SUPABASE_URL } = getEnv();

export async function uploadFile(
  file: Blob,
  bucket: string,
  key: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("No session found");
  }

  return new Promise((resolve, reject) => {
    console.log({ type: file.type });
    const upload = new tus.Upload(file, {
      endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 5000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: bucket,
        objectName: key,
        contentType: "video/mp4",
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError: (error) => {
        console.error("Failed because: " + error);
        reject(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + "%");
      },
      onSuccess: function () {
        console.log("Download %s from %s", upload.url);
        resolve();
      },
    });

    return upload.findPreviousUploads().then((previousUploads) => {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }

      // Start the upload
      upload.start();
    });
  });
}
