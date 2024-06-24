/** 다운로드 상태 인터페이스 */
export interface DownloadState {
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
