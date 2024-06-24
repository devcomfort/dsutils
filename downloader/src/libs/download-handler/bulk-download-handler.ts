import { Observable, combineLatest } from "rxjs";
import { isArray } from "remeda";
import { ITransformedHost } from "../address/schema";

import FastestDownloadHandler from "./fastest-download-handler";

/** 복수의 타겟 URL에 대한 복수의 요청 객체를 처리합니다 */
class BulkDownloadHandler {
  public blobs?: Blob[];
  private handlers: FastestDownloadHandler[];
  /** 여러 다운로드 핸들러의 다운로드 상태를 배열 형태로 나열합니다 */
  public subject: Observable<number[]>;

  constructor(requests: ITransformedHost[][]) {
    this.handlers = requests.map(
      (requests) => new FastestDownloadHandler(requests)
    );
    this.subject = combineLatest(
      this.handlers.map((handler) => handler.subject)
    );
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

    this.blobs = downloaded as Blob[];

    return this.blobs;
  }

  public cancel() {
    this.handlers.forEach((handler) => handler.cancel());
  }
}

export default BulkDownloadHandler;
