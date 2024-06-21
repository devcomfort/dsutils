import typia from "typia";
import { IMirrorHostRegistry } from "./schema";
import MirrorHostRegistry from "./registry.json";

/**
 * 미러 호스트 레지스트리를 로드, 검증 저장합니다
 *
 * 검증된 데이터는 `data` 필드에 저장되며
 *
 * 로드 과정에서 즉시 검사를 수행하여, 유효하지 않은 부분이 발견되면 throw 합니다 (typia)
 */
export class Loader {
  private data: IMirrorHostRegistry | undefined = undefined;

  constructor() {
    this.load();
  }

  public getData(): IMirrorHostRegistry {
    return this.data!;
  }

  /** JSON 데이터를 로드하여 반환하는 함수 */
  private load(): IMirrorHostRegistry {
    const parsedJson = MirrorHostRegistry;
    const validated = this.validate(parsedJson);

    if (!validated.success) {
      throw new Error(
        `[Loader] 레지스트리 데이터가 오염되었습니다\n${validated.errors
          .map(
            (error) =>
              `"${error.path}" 경로에서 "${error.expected}" 타입이 아닌 데이터가 입력됨 (입력된 값: ${error.value})`
          )
          .join("\n")}`
      );
    }

    this.data = parsedJson;

    return parsedJson;
  }

  /**
   * typia의 검증 결과 객체를 그대로 반환합니다
   * @param obj 검증 대상 객체
   * @returns
   */
  protected validate(obj: object) {
    return typia.validate<IMirrorHostRegistry>(obj);
  }
}
