import { isString } from "remeda";

/** 주어진 URL의 hostname을 변경하여 반환하는 클래스 */
class Transformer {
  /** URL 객체
   * @description 생성자 내에서 명시적으로 초기값이 지정되지 않고, setter를 통해 지정되면 타입 추론이 이루어지지 않기
   *              때문에 nullable하게 처리함
   */
  private __url: URL | undefined;

  constructor(url: string, hostname?: string) {
    this.url = url;
    if (isString(hostname)) this.setHostname(hostname);
  }

  get url(): URL {
    return this.__url!;
  }

  set url(newUri: string) {
    this.__url = new URL(newUri);
  }

  /** 호스트 이름 지정 */
  public setHostname(newHostname: string) {
    this.url.hostname = newHostname;
  }

  /** 호스트 이름이 변경된 URL 반환 */
  public getTransformedUrl() {
    return this.url.toString();
  }
}

export default Transformer;
