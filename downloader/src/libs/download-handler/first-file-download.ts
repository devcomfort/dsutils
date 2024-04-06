import { BehaviorSubject, Subscription, combineLatest, map } from "rxjs";
import { SingleFileDownload } from "./single-file-download";
import { DownloadStatus } from "./types/download-status";

/**
 * ### 파일 다운로드 클래스
 *
 * - {@link SingleFileDownload}를 사용합니다
 * - 같은 파일을 가리키는 복수의 URL에 동시에 파일을 요청하여, 가장 먼저 응답이 완료된 파일만 반환합니다
 */
export class FirstFileDownload {
  private handlers: SingleFileDownload[];
  private state: DownloadStatus;

  /**
   * ### 복수 파일의 다운로드 상태를 관찰하는 옵저버
   *
   * - 구독자가 GC에 의해 제거되는 것을 방지하기 위해 제거하면 안 됩니다.
   */
  // @ts-ignore
  private _subscription: Subscription;
  /**
   * ### 복수 파일의 다운로드 상태를 전파하는 subject 객체
   *
   * - 복수 파일의 다운로드 상황을 취합한 후, subject를 통해 외부로 전파할 수 있습니다.
   * - {@link state}에 값을 전파하는 역할도 수행합니다
   */
  public subject: BehaviorSubject<DownloadStatus>;
  private controller: AbortController;

  constructor(urls: string[]) {
    this.handlers = urls.map((url) => new SingleFileDownload(url));
    this.state = {
      downloadedRatio: 0,
      downloadedSize: 0,
      fileSize: null,
      mimeType: null,
    };

    this.subject = new BehaviorSubject(this.state);

    this._subscription = combineLatest(
      this.handlers.map((handler) => handler.subject)
    )
      .pipe(
        map(function (states) {
          return states.reduce((returnValue, currentValue) => {
            // 가장 큰 값 남기기
            return currentValue.downloadedRatio > returnValue.downloadedRatio
              ? currentValue
              : returnValue;
          });
        })
      )
      .subscribe((newState) => {
        this.state = newState;
        this.subject.next(this.state);
      });

    this.controller = new AbortController();
    this.controller.signal.addEventListener("abort", () => {
      this.handlers.forEach((handler) => handler.cancel());
    });
  }

  /**
   * ### 다운로드 함수
   *
   * 복수의 URL로 다운로드를 시도한 후, 가장 먼저 도착한 응답을 반환합니다
   *
   * @param useCache 캐시 사용 여부 (true: 이전에 다운받은 적이 있다면, 다운로드 받은 데이터를 그대로 사용합니다)
   * @returns
   */
  async download(useCache?: boolean) {
    return Promise.any(
      this.handlers.map((handler) => handler.download(useCache))
    );
  }

  /**
   * ### 다운로드 취소 함수
   *
   * 진행 중인 모든 다운로드 요청을 취소합니다
   */
  cancel() {
    this.controller.abort();
  }
}
