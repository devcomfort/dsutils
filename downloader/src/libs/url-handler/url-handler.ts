import { pipe, split } from "remeda";
import { trim } from "lodash/fp";
import path from "path-browserify";

import { DownloadRequest } from "../download-handler/schema";

class URLHandler {
  /** `<URL>;<filename>` 구조의 문자열에서 데이터를 추출합니다
   * @throws 구조가 유효하지 않는 경우
   */
  static parse(urlString: string): DownloadRequest {
    const splitted = pipe(urlString, trim, split(";"));

    if (splitted.length > 2)
      throw new Error(
        `[URLHandler.parse] 유효하지 않은 구조입니다\nexpected "<URL>;<filename>", but got ${urlString}`
      );

    let [url, filename] = splitted;

    // NOTE: 파일 이름이 누락된 경우, URL에서 파일 이름을 추출하여 사용
    filename ??= URLHandler.basename(url);

    // NOTE: 파일 이름의 파일 확장자 교정

    /**
     * 파일 확장자
     *
     * 저장할 파일의 확장자 교정을 위해 다음과 같은 우선순위로 파일 확장자를 가져옴
     *
     * 1. URL에 포함된 확장자 (예시: `"https://www.google.com/video.mp4"` -> `".mp4"`)
     * 2. 파일 이름에 포함된 확장자 (예시: `"video.mp4"` -> `".mp4"`)
     * 3. 빈 문자열 ("")
     *
     * path.extanme(path)에서 path에 확장자가 없는 경우, 빈 문자열 `""`를 반환함
     */
    const ext =
      path.extname(url).length > 0 ? path.extname(url) : path.extname(filename);

    filename = path.join(
      path.join(
        // 파일 이름 (확장자 제외, 예시: `"video.mp4"` -> `"video"`)
        path.basename(filename, path.extname(filename)),
        // 파일 확장자 (ext 변수 참조)
        ext
      )
    );

    return {
      filename,
      url,
    };
  }

  /** URL에서 파일 이름을 추출합니다 */
  static basename(url: string) {
    return path.basename(url);
  }

  /**
   * `<URL>;<filename>` 구조로 URL과 filename을 병합하여 반환합니다
   */
  static stringify({ url, filename }: DownloadRequest): string {
    filename ??= URLHandler.basename(url);

    return `${url};${filename}`;
  }
}

export default URLHandler;
