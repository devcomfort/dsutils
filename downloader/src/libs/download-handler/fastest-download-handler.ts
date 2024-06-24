import { Observable, combineLatest, map } from "rxjs";
import DownloadHandler from "./download-handler";
import { Downloaded } from "./schema";
import { max } from "lodash/fp";
import { ITransformedHost } from "../address/schema";

/** 복수 URL 중 가장 빠른 응답의 데이터를 처리하는 핸들러 */
class FastestDownloadHandler implements Downloaded {
  public blob?: Blob;
  private handlers: DownloadHandler[];
  public subject: Observable<number>;

  constructor(requests: ITransformedHost[]) {
    // NOTE: 복수의 미러 호스트 프로필 속 개별 주소에 요청을 보낸 후
    //       가장 최초로 성공적인 응답을 한 객체를 사용합니다
    this.handlers = requests
      .map((host) => {
        return host.transformedUrls.map((url) => new DownloadHandler(url));
      })
      .flat();
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

  public async download(force_rerun: boolean = false) {
    if (this.blob instanceof Blob && !force_rerun) return this.blob;

    // NOTE: 최초로 성공적으로 다운로드를 완료하여 얻은 Blob 객체를 가져옴
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
