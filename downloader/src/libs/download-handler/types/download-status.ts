export interface DownloadStatus {
  /** 다운로드 진행도 (범위: 0~1) */
  downloadedRatio: number;
  /** 다운로드 된 크기 (단위: 바이트) */
  downloadedSize: number;
  /**
   * ### 파일 크기 (기본값: 0, 단위: 바이트)
   *
   * - 유효하지 않은 경우, null로 처리됩니다
   */
  fileSize: number | null;
  mimeType: string | null;
}
