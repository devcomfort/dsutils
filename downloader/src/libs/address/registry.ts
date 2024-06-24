import { isURL } from "../validator/url";

import Finder from "./finder";
import Transformer from "./transformer";
import { IMirrorHost, ITransformedHost } from "./schema";

/** 레지스트리 속 데이터를 조회 및 변경하는 클래스 */
class Registry {
  private finder: Finder;

  constructor() {
    this.finder = new Finder();
  }

  /**
   * 해당 URL을 지원하는 미러 호스트가 있는지 반환합니다
   *
   * @throws `getCompatibleHosts` 메소드에서 throw되는 모든 오류
   *
   * @param url 조회 대상 URL
   */
  public isCompatible(url: string): boolean {
    return this.getCompatibleHosts(url).length > 0;
  }

  /**
   * 호환되는 URL 리스트를 반환하는 함수
   *
   * @throws 문자열이지만 적절한 URL 구조가 아닐 때
   * @throws 호환되는 미러 호스트가 아닐 때
   *
   * @param url 검색 대상 URL
   *
   * @returns
   */
  private getCompatibleHosts(url: string): IMirrorHost[] {
    if (!isURL(url)) throw new Error(`URL 구조가 아닌 문자열이 입력되었습니다`);

    // 호환되는 미러 호스트 조회
    const compatibleHosts = this.finder.findCompatibleMirrorHosts(url);
    return compatibleHosts;
  }

  /**
   * 입력된 URL의 hostname을 호환되는 호스트 리스트에 맞게 변환하여 반환함
   *
   * @see {@link ITransformedHost} 미러 호스트의 구분자와 변경된 URL 리스트만 저장한 구조의 인터페이스
   *
   * @param url
   * @returns
   */
  public getTransformedHosts(url: string): ITransformedHost[] {
    const compatibleMirrorHosts = this.getCompatibleHosts(url);
    const transformedHosts: ITransformedHost[] = compatibleMirrorHosts.map(
      (host) => {
        const { name, targetHosts } = host;
        /** 기존 URL의 호스트 이름을 호환되는 미러 서버 호스트 이름으로 변환한 URL 배열 */
        const transformedUrls = targetHosts.map((targetHost) => {
          return new Transformer(url, targetHost).getTransformedUrl();
        });

        return {
          name,
          transformedUrls,
        };
      }
    );

    return transformedHosts;
  }
}

export default Registry;
