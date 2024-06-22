import { pipe, split } from "remeda";
import { trim } from "lodash/fp";
import path from "path";

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
    filename ??= URLHandler.extractFileName(url);

    return {
      filename,
      url,
    };
  }

  /** URL에서 파일 이름을 추출합니다 */
  static extractFileName(url: string) {
    return path.parse(url).base;
  }

  /**
   * `<URL>;<filename>` 구조로 URL과 filename을 병합하여 반환합니다
   */
  static stringify({ url, filename }: DownloadRequest): string {
    filename ??= URLHandler.extractFileName(url);
    return `${url};${filename}`;
  }
}

export default URLHandler;
