import { tryit } from "radash";
import { FastestDownloadHandler } from "../../handlers";
import { searchRegistry } from "../helper";
import type { SingleRatio, SingleResult } from "../schemas/responses";
import { isError } from "lodash/fp";
import { isSingleRequest } from "../schemas/requests/validators";

// NOTE: Main Worker는 DownloadRequest[]를 받아 Child Worker의 진행도들을 구독하고, pool size에 맞게 요청을 실행하도록 작업
//       Child Worker는 하나의 DownloadRequest를 받아 내부에서 인스턴스를 생성하고 결과를 반환하도록 작성

/**
 * @description DownloadRequest를 입력 받아 다운로드 작업을 수행함
 * @description [1] 다운로드 진행도와 [2] 다운로드 결과를 전송함
 * @throws 유효하지 않은 신호/요청은 타입 가드를 통해 무시함
 */
self.onmessage = (ev) => {
  // NOTE: self.close() 제거; 작업 중에 스레드가 제거되어 작업이 이어지지 않음
  (async () => {
    const data = ev.data;

    if (!isSingleRequest(data))
      throw new Error(`[fastest-download-worker.ts] 유효하지 않은 요청`);

    const { message: request, key } = data;
    let ratio: number | null = null;

    const host = searchRegistry(request);
    const handler = new FastestDownloadHandler(host);

    handler.onRatioUpdated = (newRatio) => {
      ratio = newRatio;
      self.postMessage({
        type: "single-ratio",
        key,
        message: ratio,
      } satisfies SingleRatio);
    };

    const [err, downloaded] = await tryit(async () => {
      const downloaded = await handler.download();
      return downloaded;
    })();

    if (isError(err)) {
      self.postMessage({
        type: "single-result",
        message: {
          key,
          reason: err,
          state: "failed",
        },
      } satisfies SingleResult);
      return;
    }

    // 다운로드 완료 신호 전송
    // NOTE: 참조 방식으로 데이터가 공유되기 때문에
    //       별도로 ID를 부여하는 등의 작업을 수행하지 않음
    self.postMessage({
      type: "single-result",
      message: {
        key,
        state: "succeed",
        data: downloaded!,
      },
    } satisfies SingleResult);
  })();
};
