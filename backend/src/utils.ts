import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";

export async function getFirstImageOrVideoFrame(
  folderPath: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        reject(`Failed to read directory: ${err}`);
        return;
      }

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const extension = path.extname(file).toLowerCase();

        if ([".jpg", ".jpeg", ".png", ".gif"].includes(extension)) {
          // It's an image, convert to base64
          sharp(filePath)
            .toBuffer()
            .then((buffer) => resolve(buffer.toString("base64")))
            .catch((err) => reject(`Failed to process image: ${err}`));
          return;
        } else if ([".mp4", ".mkv", ".avi"].includes(extension)) {
          // It's a video, extract the first frame
          ffmpeg(filePath)
            .screenshots({
              count: 1,
              folder: "/tmp",
              filename: "thumbnail-%b.png",
            })
            .on("end", () => {
              const thumbnailPath = path.join(
                "/tmp",
                "thumbnail-" + path.basename(file, path.extname(file)) + ".png",
              );
              sharp(thumbnailPath)
                .toBuffer()
                .then((buffer) => resolve(buffer.toString("base64")))
                .catch((err) => reject(`Failed to process video frame: ${err}`))
                .finally(() => fs.unlinkSync(thumbnailPath)); // Clean up the thumbnail
            })
            .on("error", (err) => reject(`Failed to process video: ${err}`));
          return;
        }
      }

      reject("No suitable images or videos found.");
    });
  });
}
