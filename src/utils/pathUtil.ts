import path from 'path';

export class PathUtil {
    public static basePath() {
        return path.resolve(__dirname + '/../..');
    }
}
