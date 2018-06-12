import { BlobService, createBlobService } from 'azure-storage';
import { createReadStream, createWriteStream, removeSync, WriteStream } from 'fs-extra';
import { join } from 'path';
import { Observable } from 'rxjs';

export class FileManager {

    public static getInstance(): FileManager {
        if (!this.instance) {
            this.instance = new FileManager();
        }
        return this.instance;
    }

    private static instance: FileManager;

    private blobService: BlobService;

    private constructor() {
        this.blobService = createBlobService();
    }

    public uploadProfilePicture(userID: string, images: Express.Multer.File): Observable<BlobService.BlobResult> {
        return new Observable((observer) => {
            this.blobService.createAppendBlobFromLocalFile('profile-picture', userID, images.path, (err, result) => {
                if (err) {
                    observer.error(err);
                } else {
                    removeSync(images.path);
                    observer.next(result);
                    observer.complete();
                }
            });
        });
    }

    public downloadProfilePicture(userID: string): Observable<string> {
        return new Observable((observer) => {
            const filePath = join(__dirname, '../assets/profile/', userID + '.jpg');
            this.blobService.getBlobToLocalFile('profile-picture', userID, filePath, (err) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(filePath);
                    observer.complete();
                }
            });
        });
    }
}
