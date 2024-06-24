import { isNullish } from "remeda";
import { Type, Minimum, Maximum } from "typia/lib/tags";

import { DownloadRatio, DownloadState, Downloaded, Url } from "./schema";
import FileSizeViwer from "../parser/file-size-viewer";
import MetaDataLoader from "./metadata-loader";
import { BehaviorSubject } from "rxjs";

/** 단일 URL의 데이터를 다운로드하는 기본 핸들러 */
class DownloadHandler
  extends MetaDataLoader
  implements DownloadRatio, Downloaded, DownloadState
{
  // Downloaded
  public blob?: Blob;
  // DownloadRatio
  public downloadedSize: (number & Type<"int64"> & Minimum<0>) | null;
  public downloadedRatio:
    | (number & Type<"double"> & Minimum<0> & Maximum<1>)
    | null;
  // DownloadRequest + MetaData
  public status: "initialized" | "fetching" | "downloaded" | "failed" =
    "initialized";
  public error?: Error | undefined;

  private abortController: AbortController;
  public subject: BehaviorSubject<DownloadRatio>;

  /**
   *
   * @param url 다운로드 대상 URL
   * @param filename 파일 이름 (undefined인 경우, URL에서 추출하여 사용)
   * @param onRatioUpdated 진행도 갱신 콜백 함수
   */
  constructor(url: Url) {
    super(url);

    // 파일 관련 변수들
    this.downloadedRatio = 0;
    this.downloadedSize = null;

    this.blob = undefined;

    this.mimeType = null;
    this.fileSize = null;

    // 요청 처리 관련 변수들
    this.abortController = new AbortController();
    this.subject = new BehaviorSubject<DownloadRatio>({
      fileSize: this.fileSize,
      downloadedSize: 0,
      downloadedRatio: 0,
    });

    this.loadMetaData().then(() => {
      this.status = "initialized";
    });
  }

  /**
   * 파일 다운로드 함수
   *
   * 이미 다운로드 한 파일이 있는 경우, 파일 객체를 반환함
   *
   * @param force_rerun 강제 재-다운로드 여부
   */
  public async download(force_rerun: boolean = false) {
    if (this.blob instanceof Blob && !force_rerun) return this.blob;

    this.downloadedSize = 0;
    this.downloadedRatio = 0;
    this.status = "fetching";

    const response = await fetch(this.url, {
      method: "GET",
      signal: this.abortController.signal,
    });
    const reader = response.body?.getReader();

    if (isNullish(reader)) {
      this.status = "failed";
      throw new Error(
        `[DownloadHandler.download] 응답 객체에서 data reader를 가져오지 못 했습니다`
      );
    }

    let chunks: Uint8Array[] = [];

    while (true) {
      // 데이터 청크 가져오기
      const { done, value } = await reader.read();
      // 다운로드 완료 시 종료
      if (done) break;

      // 다운로드 완료된 청크를 추가
      chunks = [...chunks, value];

      this.downloadedSize += value.length;
      this.downloadedRatio = isNullish(this.fileSize)
        ? null
        : this.downloadedSize / this.fileSize;

      this.subject.next({
        fileSize: this.fileSize,
        downloadedSize: this.downloadedSize,
        downloadedRatio: this.downloadedRatio,
      });
    }

    // 다운로드 완료 후, 청크 병합 및 인스턴스 변수에 저장
    const mergedChunks = new Uint8Array(this.downloadedSize);
    let pos = 0;
    for (let chunk of chunks) {
      mergedChunks.set(chunk, pos);
      pos += chunk.length;
    }

    this.blob = new Blob([mergedChunks], {
      type: this.mimeType ?? undefined,
    });

    this.status = "downloaded";

    return this.blob;
  }

  /** AbortController를 통해 취소 신호를 전송함 */
  public cancel() {
    this.abortController.abort();
  }

  /**
   * 파일 크기를 사람이 읽기 쉽도록 변환하여 반환합니다
   *
   * @description 파일 크기가 저장되지 않은 경우 `null`을 반환합니다
   * @description 파일 크기가 저장된 경우, human-readable하게 변환하여 반환합니다
   *              예시: `1337` &rarr; `1.34kB`
   *
   * @see https://www.npmjs.com/package/pretty-bytes
   *
   * @returns
   */
  public humanReadableFileSize() {
    if (isNullish(this.fileSize)) return null;
    return new FileSizeViwer(this.fileSize).prettified();
  }
}

export default DownloadHandler;
