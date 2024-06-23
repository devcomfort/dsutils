import { DownloadRequest } from "../download-handler/schema";
import { tags } from "typia";

type Index = number & tags.Type<"int64">;

/**
 * 다운로드 대기열 클래스
 *
 * NOTE: 명시적으로 싱글톤 패턴이 적용되지 않음
 * NOTE: Solid.js의 `createStore`를 사용하려다가 필요 없을 것 같아서 그냥 클래스로 구현함
 */
class DownloadQueue {
  private queue: DownloadRequest[];

  constructor() {
    this.queue = [];
  }

  /** 대기열에 새로운 요청을 추가함 */
  public addRequest(request: DownloadRequest) {
    this.queue = [...this.queue, request];
  }

  /** 인덱스로 지정된 요청을 제거함 */
  public dropRequestByIndex(idx: Index) {
    if (0 <= idx && idx < this.queue.length)
      throw new Error(`[DownloadQueue] ${idx}는 유효한 인덱스가 아닙니다`);

    this.queue = [...this.queue.slice(0, idx), ...this.queue.slice(idx + 1)];
  }

  /** 대기열 데이터를 호추랗ㅁ */
  public getQueue() {
    return this.queue;
  }
}

export default DownloadQueue;
