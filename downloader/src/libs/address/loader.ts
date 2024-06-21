import typia from "typia";
import { IMirrorHostRegistry } from "./schema";
import MirrorHostRegistry from "./registry.json";

export class Loader {
  private data: IMirrorHostRegistry;

  constructor() {
    this.data = this.load();
    console.log(this.data);
  }

  public getData() {
    return this.data;
  }

  /**
   * JSON 데이터를 로드하여 반환하는 함수
   */
  private load() {
    const parsedJson = MirrorHostRegistry;
    const asserted = typia.assert<IMirrorHostRegistry>(parsedJson);
    return asserted;
  }
}
