import { tags } from "typia";

export interface DownloadRatio {
  /**
   * 다운로드 진행도
   *
   * - 0 ~ 1 범위로 저장
   * - fileSize가 null이라 진행도를 계산할 수 없는 경우 `null`로 처리
   */
  downloadedRatio:
    | (number & tags.Type<"double"> & tags.Minimum<0> & tags.Maximum<1>)
    | null;

  /**
   * 다운로드 된 크기
   *
   * - 바이트 단위로 저장
   */
  downloadedSize: (number & tags.Type<"int64"> & tags.Minimum<0>) | null;

  /**
   * 총 파일 크기
   *
   * - 알 수 없는 경우, null로 처리
   * - fileSize와 downloadedSize를 통해 downloadedRatio를 계산함
   */
  fileSize: (number & tags.Type<"int64"> & tags.Minimum<0>) | null;
}
