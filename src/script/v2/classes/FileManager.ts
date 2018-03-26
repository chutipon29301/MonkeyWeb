import { ensureDirSync, moveSync, removeSync } from "fs-extra";
import { join } from "path";
import { SlideshowManager } from "./SlideshowManager";

export class FileManager {

    static addSlideshowImage(files: Express.Multer.File[], showDate: Date) {
        ensureDirSync(SlideshowManager.getDir(showDate));
        files.forEach(file => {
            moveSync(file.path, SlideshowManager.getPath(showDate,file.filename));
        });
    }

    static removeSlideshowImage(path: string) {
        removeSync(path);
    }
}