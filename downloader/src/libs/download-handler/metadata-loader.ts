import { Type, Minimum } from "typia/lib/tags";
import { DownloadRequest, MetaData } from "./schema";
import { Url } from "./schema/download-request";
import { isInt } from "radash";
import { isString } from "remeda";
import parseFileSize from "./parse-file-size";

/**
 * 메타데이터를 가져오는 클래스입니다
 */
class MetaDataLoader implements MetaData, DownloadRequest {
  public url: Url;
  public filename: string | null;
  public fileSize: (number & Type<"int64"> & Minimum<0>) | null;
  public mimeType: string | null;

  constructor(url: Url, filename?: string) {
    this.url = url;
    this.filename = filename ?? null;

    this.fileSize = null;
    this.mimeType = null;
  }

  /** 메타데이터 소유 여부
   * 파일 타입 또는 파일 크기 필드가 입력되었는지 반환합니다
   */
  protected hasMetaData(): boolean {
    return isString(this.mimeType) || isInt(this.fileSize);
  }

  /**
   * 메타데이터를 로드하여 인스턴스 변수에 저장함
   *
   * 이미 로드된 적 잇는 경우, 로드된 데이터를 반환함
   *
   * @param force_rerun 강제 재시도 여부 [default: false]
   * @returns
   */
  public async loadMetaData(force_rerun: boolean = false) {
    if (this.hasMetaData() && !force_rerun) return;

    const response = await fetch(this.url, {
      method: "GET",
    });

    if (!response.ok) {
      const responseMessage = await response.text();
      throw new Error(
        `[DownloadHandler.loadMetaData] 데이터를 가져오는데 실패하였습니다\n(상태 코드: ${response.status}\n메시지: ${responseMessage})`
      );
    }

    const mimeType = response.headers.get("Content-Type");
    const fileSize = parseFileSize(response.headers.get("Content-Length"));

    this.mimeType = mimeType;
    this.fileSize = fileSize;
  }
}

export default MetaDataLoader;
