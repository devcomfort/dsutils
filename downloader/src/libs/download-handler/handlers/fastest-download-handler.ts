import DownloadHandler from "./download-handler";
import { ITransformedHost } from "~/libs/address/schema";
import { Downloaded } from "../schema";
import { filter, isFunction, isNumber, pipe } from "remeda";
import { OnRatioUpdated } from ".";
import { max } from "lodash/fp";

/** 복수 URL 중 가장 빠른 응답의 데이터를 처리하는 핸들러 */
class FastestDownloadHandler implements Downloaded {
  public blob?: Blob;
  private handlers: DownloadHandler[];

  public ratio: number | null;
  private ratios: (number | null)[];
  /** 진행도 업데이트 이벤트 함수
   * @description 외부에서 필드에 접근하여 함수를 등록하도록 함
   */
  public onRatioUpdated?: OnRatioUpdated;

  /**
   *
   * @param requests
   * @param onRatioUpdated 진행도 갱신 콜백 함수; 생성자 또는 외부에서 필드에 접근하여 이벤트 함수를 등록할 수 있습니다
   */
  constructor(requests: ITransformedHost[], onRatioUpdated?: OnRatioUpdated) {
    // NOTE: 복수의 미러 호스트 프로필 속 개별 주소에 요청을 보낸 후
    //       가장 최초로 성공적인 응답을 한 객체를 사용합니다
    this.handlers = requests
      .map((host) => {
        return host.transformedUrls.map((url) => new DownloadHandler(url));
      })
      .flat();
    this.ratios = new Array(this.handlers.length).fill(0);
    this.ratio = 0;

    this.onRatioUpdated = onRatioUpdated;

    this.handlers.forEach((handler, idx) => {
      handler.onRatioUpdated = (newRatio) => {
        this.ratios[idx] = newRatio;

        const ratio = pipe(this.ratios, filter(isNumber), (ratios) => {
          // 모든 데이터가 null(모두 걸러짐) => null 반환
          if (ratios.length === 0) return null;
          // 숫자 데이터 있음 => 진행도 반환
          return max(ratios)!;
        });

        // 진행도 업데이트
        this.ratio = ratio;

        // 외부에 진행도 전파
        if (isFunction(this.onRatioUpdated)) this.onRatioUpdated(ratio);
      };
    });
  }

  public async download(force_rerun: boolean = false) {
    if (this.blob instanceof Blob && !force_rerun) return this.blob;
    // NOTE: 최초로 성공적으로 다운로드를 완료하여 얻은 Blob 객체를 가져옴
    const downloaded = await Promise.any(
      this.handlers.map((handler) => handler.download(force_rerun))
    );

    this.blob = downloaded;

    return this.blob;
  }
}

export default FastestDownloadHandler;
