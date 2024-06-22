import typia, { tags } from "typia";
import { describe, expect, it } from "vitest";

import { IMirrorHost, ITransformedHost } from "./schema";
import Loader from "./loader";
import { Registry } from ".";

type Url = string & tags.Format<"url">;

describe("Registry 클래스 테스트", () => {
  const loader = new Loader();
  const hosts = loader.getData().mirrorHosts;

  it("테스트 데이터 유효성", () => {
    expect(hosts.length).greaterThan(0);
    expect(hosts.every((host) => typia.is<IMirrorHost>(host)));
  });

  /** 테스트에 사용할 유효 URL */
  const compatibleUrl = `https://${hosts[0].compatibleHosts[0]}/...`;
  /** 테스트에 사용할 유효하지 않은 URL */
  const incompatibleRandomUrl = typia.random<Url>();

  describe("Registry.isCompatible: 호환되는 미러 호스트 탐색 함수", () => {
    it("호환되는 URL 테스트", () => {
      const registry = new Registry();
      expect(registry.isCompatible(compatibleUrl)).toBeTruthy();
      /** 조회 결과들 */
      const transformedUrls = registry.getTransformedHosts(compatibleUrl);
      // NOTE: 호환되는 URL의 조회 결과 길이가 1 이상이며
      //       모든 배열 요소가 유효한 구조인지 검증함
      expect(transformedUrls.length).greaterThan(0);
      expect(
        transformedUrls.every((url) => typia.is<ITransformedHost>(url))
      ).toBe(true);
    });
    it("호환되지 않는 URL 테스트", () => {
      const registry = new Registry();
      expect(registry.isCompatible(incompatibleRandomUrl)).toBeFalsy();
      /** 조회 결과들 */
      const transformedUrls = registry.getTransformedHosts(
        incompatibleRandomUrl
      );
      // NOTE: 호환되지 않는 URL의 조회 결과가 0인지 검증함
      expect(transformedUrls.length).toBe(0);
      // NOTE: 길이가 0이면 every에서 true 나옴
      // expect(
      //   transformedUrls.every((url) => typia.is<ITransformedHost>(url))
      // ).toBe(false);
    });
  });
});
