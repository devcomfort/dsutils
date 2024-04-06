import _ from "lodash/fp";
import { BehaviorSubject } from "rxjs";
import { isURL } from "../validator/url";
import { DownloadStatus } from "./types/download-status";

/**
 * ### 단일 URL에 대한 파일 다운로드 핸들러
 */
export class SingleFileDownload {
  /** 다운로드된 파일 크기 (단위: 바이트) */
  private __downloadedSize: number;
  /** 파일 다운로드 진행도 (0~1 범위) */
  private __downloadedRatio: number;
  /** 파일 MIME 타입 (readonly 제안 적용, 내부에서는 `__mimeType`에 접근하여 수정 가능) */
  private __mimeType: string | null;
  /** 파일 총 크기 (get에 추가적인 검사 및 변환 로직 적용, 기본값 0 적용, 파일 크기가 유효하지 않을 때 0 반환) */
  private __fileSize: string | null;

  private controller: AbortController;
  public subject: BehaviorSubject<DownloadStatus>;

  private __blob: Blob | void;
  private url: string;

  /**
   *
   * @param url 다운로드 대상 (URL)
   * @param onUpdate 다운로드 진행도 정보를 업데이트 받을 콜백 함수 (각 속성을 통해 직접 조회도 가능)
   */
  constructor(
    url: string,
    onUpdate: (state: DownloadStatus) => void = () => {}
  ) {
    if (!isURL(url)) {
      throw new Error("URL이 유효하지 않아 진행할 수 없습니다");
    }

    this.__downloadedSize = 0;
    this.__downloadedRatio = 0;
    this.__fileSize = null;
    this.__mimeType = null;

    this.controller = new AbortController();
    this.__blob = undefined;
    this.url = url;

    this.subject = new BehaviorSubject<DownloadStatus>({
      downloadedRatio: 0,
      fileSize: null,
      mimeType: null,
      downloadedSize: 0,
    });

    this.subject.subscribe(onUpdate);
  }

  /**
   * ### 파일 다운로드 함수
   *
   * @param useCache 캐시 사용 여부 (true: 이전에 다운 받은 적이 있다면, 다운로드 받은 데이터를 그대로 반환합니다)
   */
  async download(useCache: boolean = true) {
    if (useCache && this.__blob instanceof Blob) return this.__blob;

    const response = await fetch(this.url, {
      method: "GET",
      signal: this.controller.signal,
    });

    const reader = response.body?.getReader();

    if (!reader) return;

    this.__mimeType = response.headers.get("Content-Type");
    this.fileSize = response.headers.get("Content-Length");

    // 다운로드된 파일 크기 초기화
    this.__downloadedSize = 0;

    let chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 다운로드 완료된 조각을 배열에 추가 (나중에 병합할 때 사용)
      chunks = [...chunks, value];

      // 다운로드 진행도 업데이트
      this.__downloadedSize += value.length; // 다운로드 완료된 조각의 크기를 다운로드 완료된 크기 정보에 반영
      this.__downloadedRatio = // 다운로드 된 파일 크기 업데이트
        this.fileSize === null ? 0 : this.__downloadedSize / this.fileSize;

      // 다운로드 진행도 전파
      this.subject.next({
        downloadedRatio: this.__downloadedRatio,
        downloadedSize: this.__downloadedSize,
        fileSize: this.fileSize,
        mimeType: this.mimeType,
      });
    }

    const mergedChunks = new Uint8Array(this.__downloadedSize);
    let pos = 0;
    for (let chunk of chunks) {
      mergedChunks.set(chunk, pos);
      pos += chunk.length;
    }

    this.__blob = new Blob([mergedChunks], {
      type: this.mimeType ?? undefined, // MIME 타입 그대로 사용, 유효하지 않다면 무시
    });

    return this.__blob;
  }

  /**
   * ### 파일 다운로드 취소 함수
   *
   * 호출 즉시 취소 요청이 수행됩니다
   */
  cancel() {
    this.controller.abort();
  }

  set fileSize(newFileSize: string | null) {
    this.__fileSize = newFileSize;
  }

  /**
   * ### 파일 크기 (단위: 바이트)
   *
   * - 저장된 파일 크기가 유효하지 않다면, null을 반환합니다
   */
  get fileSize(): number | null {
    if (this.__fileSize === null) return 0;

    return _.pipe(
      (fileSize: string) => parseInt(fileSize),
      _.cond([
        [
          (fileSize: number) => Number.isFinite(fileSize),
          (fileSize) => fileSize,
        ],
        [_.stubTrue, _.constant(null)],
      ])
    )(this.__fileSize);
  }

  get mimeType() {
    return this.__mimeType;
  }

  get downloadedSize() {
    return this.__downloadedSize;
  }

  get downloadedRatio() {
    return this.__downloadedRatio;
  }
}
