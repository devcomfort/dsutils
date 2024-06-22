import { isNull } from "lodash/fp";
import { conditional, isString } from "remeda";

/**
 * 문자로 입력된 파일 크기를 숫자로 해석하여 반환합니다
 *
 * @description `"Content-Length"`에서 얻은 순수 문자열을 숫자로 변환하여 반환함
 *
 * @param fileSize 처리되지 않은 파일 크기 ("Content-Length" 추출 데이터)
 * @returns
 */
const parseFileSize = (fileSize: string | null) =>
  conditional(fileSize, [isNull, (data) => data], [isString, parseInt]);

export default parseFileSize;
