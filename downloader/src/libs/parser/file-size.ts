import _ from "lodash/fp";
import { isString } from "../download-handler/helper/is-string";
import { isNumber } from "../download-handler/helper/is-number";
import prettyBytes from "pretty-bytes";

/**
 * ### 바이트 단위의 파일 크기를 human-readable 한 단위를 붙여 문자열로 만들어줍니다
 *
 * - 단, 입력이 유효하지 않다면 `null`을 반환합니다
 */
export function parseFileSize(fileSize: string | number): string;
export function parseFileSize(fileSize: unknown): null;
export function parseFileSize(fileSize: unknown): string | null {
  // 문자열 형태의 파일 크기인 경우
  // 숫자로 변환, human-readable filesize로 변환 후 반환합니다
  if (isString(fileSize) && /^\d+$/.test(fileSize))
    return _.pipe(
      // 문자열 -> 정수 형태로 변경
      _.toInteger,
      // human-readable size로 변경, 반환
      (fileSize) => prettyBytes(fileSize)
    )(fileSize);

  // 숫자 형태의 파일 크기인 경우
  // 그대로 human-readable filesize로 변환 후 반환합니다
  if (isNumber(fileSize)) return prettyBytes(fileSize);

  // 해당되는 사항이 없다면, null을 반환합니다
  return null;
}
