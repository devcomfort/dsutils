import { isInt } from "radash";
import prettyBytes from "pretty-bytes";

/**
 * 파일 크기를 사람이 읽기 쉽도록 변환함
 *
 * @see https://www.npmjs.com/package/pretty-bytes `pretty-bytes` 라이브러리
 */
class FileSizeViwer {
  /** 바이트 단위 파일 크기 */
  private rawFileSize: number;

  constructor(rawFileSize: number) {
    if (!isInt(rawFileSize))
      throw new Error(
        `[FileSizeViewer] 유효하지 않은 파일 크기입니다 (expected int, but got number)`
      );
    this.rawFileSize = rawFileSize;
  }

  /**
   * human-readable하게 변환된 파일 크기를 반환합니다
   *
   * @see https://www.npmjs.com/package/pretty-bytes
   */
  prettified() {
    return prettyBytes(this.rawFileSize);
  }

  setRawFileSize(rawFileSize: number) {
    if (!isInt(rawFileSize))
      throw new Error(
        `[FileSizeViewer] 유효하지 않은 파일 크기입니다 (expected int, but got number)`
      );
    this.rawFileSize = rawFileSize;
  }
}

export default FileSizeViwer;
