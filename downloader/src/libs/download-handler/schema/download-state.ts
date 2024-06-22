import { tags } from "typia";

/** URL 타입 */
export type Url = string & tags.Format<"url">;

/** 다운로드 상태 인터페이스 */
export interface DownloadState {
  /** 파일 이름 (파일 저장 시 사용)
   * @description 입력된 값이 없는 경우 `null`로 처리, `url`에서 추출하여 사용
   */
  filename: string | null;
  /** 다운로드 대상 URL */
  url: Url;
  /**
   * 다운로드 진행 상태
   *
   * - `initialized`: 초기화됨
   * - `fetching`: 파일 다운로드 중
   * - `downloaded`: 다운로드 완료됨
   * - `failed`: 실패함 (이 경우, `error` 필드에 오류 내용이 저장됨)
   */
  status: "initialized" | "fetching" | "downloaded" | "failed";
  error?: Error;
}
