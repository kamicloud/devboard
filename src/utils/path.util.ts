import path from 'path';

export default class PathUtil {
    public static basePath() {
        return path.resolve(__dirname + '/../..');
    }
}
