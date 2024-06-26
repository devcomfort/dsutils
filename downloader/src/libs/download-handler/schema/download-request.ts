import { z } from "zod";
import { Url } from ".";

/** DownloadRequestSchema 검증자
 * @description DownloadRequest 인터페이스가 만들어지고 나서 만들어짐
 */
export const DownloadRequestSchema = z.object({
  url: z.string().url(),
  filename: z.string().nullable(),
});

/** 다운로드 요청 인터페이스 */
export interface DownloadRequest {
  /** 다운로드 대상 URL */
  url: Url;
  /** 파일 이름 (null인 경우, URL에서 추출하여 사용) */
  filename: string | null;
}
