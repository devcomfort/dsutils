import { Observable, combineLatest, map } from "rxjs";
import DownloadHandler from "./download-handler";
import { DownloadRequest, Downloaded } from "./schema";
import { max } from "lodash/fp";

/** 복수 URL 중 가장 빠른 응답의 데이터를 처리하는 핸들러 */
class FastestDownloadHandler implements Downloaded {
  public blob?: Blob;
  private handlers: DownloadHandler[];
  public subject: Observable<number>;

  constructor(requests: DownloadRequest[]) {
    this.handlers = requests.map((request) => {
      const { filename, url } = request;
      return new DownloadHandler(url, filename ?? undefined);
    });
    this.subject = combineLatest(
      this.handlers.map((handler) => handler.subject)
    ).pipe(
      map((states) =>
        states
          .map((state) => state.downloadedRatio)
          .reduce(
            (returnValue, currentValue) =>
              max([returnValue, currentValue ?? 0]) ?? 0,
            0
          )
      )
    );
  }

  public subscribe(args: Parameters<(typeof this.subject)["subscribe"]>) {
    return this.subject.subscribe(...args);
  }

  public async download(force_rerun: boolean = false) {
    if (this.blob instanceof Blob && !force_rerun) return this.blob;

    const downloaded = await Promise.any(
      this.handlers.map((handler) => handler.download(force_rerun))
    );

    this.cancel();

    this.blob = downloaded;

    return this.blob;
  }

  public cancel() {
    this.handlers.forEach((handler) => handler.cancel());
  }
}

export default FastestDownloadHandler;
