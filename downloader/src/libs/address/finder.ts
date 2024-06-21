import Loader from "./loader";
import { IMirrorHost } from "./schema";
import { isURL } from "../validator/url";

// NOTE: 검색 결과로 나온 IMirrorHost가 2개 이상인 경우, 사용자 경험을 위해 학교명을 표시할 수 있도록 그대로 배열 형태로 반환합니다
// URL만 추출하여 1-D 배열 형태로 반환할까 하다가, 정보량이 높을 수록 추후에 할 수 있는 것이 많아지기에 이렇게 결정했습니다

/**
 * {@link Loader} 클래스가 로드한 데이터를 조회하는 기능을 제공함
 *
 * @see {@link Loader} 미러 호스트 레지스트리 정보를 로드함
 */
class Finder {
  private loader: Loader;

  constructor() {
    this.loader = new Loader();
  }

  /**
   * 주어진 URL에 호환되는 미러 호스트 배열을 반환함
   *
   * @throws 적절한 URL 구조가 아닐 때
   *
   * @param targetUrl 조회 대상 URL
   */
  public findCompatibleMirrorHosts(targetUrl: string): IMirrorHost[] {
    if (!isURL(targetUrl))
      throw new Error(`URL 구조가 아닌 문자열이 입력되었습니다`);

    /** 검색 대상 URL */
    const targetURL = new URL(targetUrl);
    /** 호스트 주소 (추출된)
     *
     * 예시: `"https://www.naver.com/..."` &rarr; `"www.naver.com"`
     */
    const targetHostname = targetURL.hostname;
    return this.loader.getData().mirrorHosts.filter(
      /** 미러 호스트 프로필(`host`)가 target hostname을 지원하는지 검사, 그것만 남김(filter) */
      (host) => host.compatibleHosts.includes(targetHostname)
    );
  }
}

export default Finder;
