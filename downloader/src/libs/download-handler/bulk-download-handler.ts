import { Observable, combineLatest } from "rxjs";
import { isArray } from "remeda";
import { DownloadRequest } from "./schema";
import FastestDownloadHandler from "./fastest-download-handler";

/** 다수 타겟의 데이터를 병렬로 처리하는 핸들러 */
class BulkDownloadHandler {
  public blobs?: Blob[];
  private handlers: FastestDownloadHandler[];
  /** 여러 다운로드 핸들러의 다운로드 상태를 배열 형태로 나열합니다 */
  public subject: Observable<number[]>;

  constructor(requests: DownloadRequest[][]) {
    this.handlers = requests.map(
      (requests) => new FastestDownloadHandler(requests)
    );
    this.subject = combineLatest(
      this.handlers.map((handler) => handler.subject)
    );
  }

  public subscribe(args: Parameters<(typeof this.subject)["subscribe"]>) {
    return this.subject.subscribe(...args);
  }

  public async download(force_rerun: boolean = false) {
    if (
      isArray(this.blobs) &&
      this.blobs.every((blob) => blob instanceof Blob) &&
      this.blobs.length
    )
      return this.blobs;

    const downloaded = await Promise.all(
      this.handlers.map((handler) => handler.download(force_rerun))
    );

    this.cancel();

    this.blobs = downloaded;

    return this.blobs;
  }

  public cancel() {
    this.handlers.forEach((handler) => handler.cancel());
  }
}

export default BulkDownloadHandler;
