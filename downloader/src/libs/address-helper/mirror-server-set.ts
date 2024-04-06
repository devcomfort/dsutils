import { isURL } from "../validator/url";

/**
 * ### 호스트 대치 정보
 *
 * - [학교 이름, 호환되는 호스트 주소, 대상 호스트 주소] 구조로 이루어집니다.
 * - 호환되는 미러 호스트 정보를 탐색하기 위해 사용됩니다.
 * - 호환되는 호스트가 복수 개 있을 수 있으므로, 호환되는 호스트 주소와 대상 호스트 주소는 배열로 작성하였습니다.
 */
type HostSet = [string, string[], string[]];

/**
 * ### 호스트 셋 호출 함수
 *
 * - 추후 데이터베이스 도입을 고려하여, 비동기 함수로 작성하였습니다.
 *
 * @returns
 */
async function getHosts(): Promise<HostSet[]> {
  return [
    ["동서대학교", ["dongseo-cms.cdn.ntruss.com"], ["dcms.dongseo.ac.kr"]],
  ] as const;
}

export class MirrorHostTransformer {
  /**
   * ## `hostname`과 호환되는 미러 서버 호스트가 있는지 조회합니다
   *
   * - 호환되는 미러 서버 호스트가 있으면, 미러 서버 정보 리스트를 배열 형태로 반환합니다
   * - 반환값은 학교 이름과 변환된 주소 정보를 포함한 배열을 반환합니다
   * - 호환되는 미러 서버 호스트가 하나도 없다면, 빈 배열(`[]`)을 반환합니다
   *
   * @param hostname
   * @returns
   */
  static async getCompatibleHostList(hostname: string) {
    const hostList = await getHosts();
    return hostList.reduce<HostSet[]>(function (returnValue, currentValue) {
      const [
        ,
        /** (현재 바라보는 미러 호스트 셋이) 지원하는 미러 호스트 정보 */
        compatibleHostList,
      ] = currentValue;
      /** 호환 여부 */
      const isCompatible = compatibleHostList.includes(hostname);

      if (isCompatible) return [...returnValue, currentValue];
      return returnValue;
    }, []);
  }

  /**
   * URL에 대응되는 미러 서버 URL을 조회, 변환하여 반환합니다
   *
   * - URL에 대응되는 미러 서버 주소가 여러 개인 경우, 복수의 값이 반환될 수 있습니다 (배열 형태로)
   * - 대응되는 미러 서버 주소가 없다면, 빈 배열 `[]`을 반환합니다
   *
   * @param targetUrl 조회할 URL
   * @returns 대치되는 URL 리스트
   */
  static async getMirrorUrlList(targetUrl: string): Promise<Array<string[]>> {
    // URL 구조가 입력된 것이 아니라면, 무시합니다
    if (!isURL(targetUrl)) return [];

    const urlObj = new URL(targetUrl);
    /** 호환되는 미러 서버 주소 정보 */
    const mirrorUrls = await this.getCompatibleHostList(urlObj.host);

    /** 호환되는 미러 서버가 없는 경우, 예외 처리합니다 */
    if (mirrorUrls.length === 0) return [];

    return mirrorUrls.map(function ([
      ,
      ,
      /**
       * ### 호환되는 미러 서버 hostname 목록
       *
       * - 예시: `["www.google.com", "www.naver.com"]`
       * - 제공된 URL에서 호스트 이름을 변경하여 반환합니다
       * - 입력이 `https://www.daum.net/korea`라면 `["https://www.google.com/korea", "https://www.naver.com/korea"]`로 대치되도록 합니다.
       */
      targetHost,
    ]) {
      return targetHost.map(
        /**
         * `targetUrl`(URL)의 `hostname`을 대치되는 서버 호스트로 대치하여 반환합니다
         *
         * - `newHostname`이 `"www.google.com"`이고 `targetUrl`이 `"https://www.naver.com/korea"`라면, `"https://www.google.com/korea"`를 반환합니다
         *
         * @param newHostname 대치할 호스트 정보
         * @returns hostname을 변환한 새로운 URL
         */
        function (newHostname) {
          urlObj.host = newHostname;
          urlObj.port = "";
          return urlObj.toString();
        }
      );
    });
  }
}
