import { describe, expect, it } from "vitest";
import typia, { tags } from "typia";
import Transformer from "./transformer";

type Hostname = string & tags.Format<"hostname">;
type Url = string & tags.Format<"url">;

describe("Transformer 클래스 테스트", () => {
  const hostname = typia.random<Hostname>();
  const url = typia.random<Url>();

  const urlObject = new URL(url);
  urlObject.hostname = hostname;
  const resultUrl = urlObject.toString();

  it("hostname 변환 테스트", () => {
    const transformed = new Transformer(url, hostname).getTransformedUrl();
    expect(transformed).toBe(resultUrl);
  });

  it("hostname 동적 변환 테스트", () => {
    const transformer = new Transformer(url);
    transformer.setHostname(hostname);
    const transformed = transformer.getTransformedUrl();
    expect(transformed).toBe(resultUrl);
  });
});
