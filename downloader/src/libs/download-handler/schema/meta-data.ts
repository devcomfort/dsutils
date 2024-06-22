import { tags } from "typia";

/**
 * 파일 메타 데이터 정보
 *
 * `HEAD` 메소드를 통해 데이터를 요청한 경우, 응답 결과를 이 형태로 저장합니다
 */
export interface MetaData {
  /**
   * 파일 크기
   *
   * - 숫자가 아닌 내용이 입력되거나
   * - 정수가 아닌 값이 입력되거나
   * - 0 미만의 값이 입력되면 안 됨
   * - 해석 가능한 데이터가 없는 경우 `null`을 입력할 수 있도록 처리
   */
  fileSize: (number & tags.Type<"int64"> & tags.Minimum<0>) | null;
  /**
   * 파일 타입 (MIME)
   *
   * - 가져올 수 없는 경우, null이 저장됩니다
   */
  mimeType: string | null;
}
