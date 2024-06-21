import { tags } from "typia";

type Hostname = string & tags.Format<"hostname">;
type Url = string & tags.Format<"url">;

/** 미러 호스트 프로필  */
export interface IMirrorHost {
  /** 구분자; 학교 이름 등 */
  name: string;
  /** 지원되는 원본 호스트들
   *
   * 예시: `["dongseo-cms.cdn.ntruss.com"]`
   */
  compatibleHosts: Hostname[];
  /**
   * 호환되는 미러 호스트들
   *
   * 예시: `["dcms.dongseo.ac.kr"]`
   */
  targetHosts: Hostname[];
}

export interface ITransformedHost {
  /** 구분자; 학교 이름 등 */
  name: string;
  /** 변환된 URL
   * {@link IMirrorHost}에 맞게 주어진 URL의 hostname을 변환한 리스트를 저장합니다
   *
   * 예시:
   *
   * ```
   * const host: IMirrorHost = {
   *    name: "동서대학교",
   *    compatibleHosts: ["dongseo-cms.cdn.ntruss.com"],
   *    targetHosts: ["dcms.dongseo.ac.kr"]
   * };
   *
   * const transformed = new Registry().getTransformedHosts("https://dongseo-cms.cdn.ntruss.com/...");
   *
   * console.log(transformed);
   * // [
   * //   {
   * //     name: "동서대학교",
   * //     transformedUrls: ["https://dcms.dongseo.ac.kr/..."]
   * //   }
   * // ]
   * ```
   */
  transformedUrls: Url[];
}

/** 미러 호스트 레지스트리 목록 */
export interface IMirrorHostRegistry {
  mirrorHosts: IMirrorHost[];
}
