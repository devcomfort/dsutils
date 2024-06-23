import { SetStoreFunction, createStore } from "solid-js/store";
import { DownloadRequest } from "../download-handler/schema";
import { tags } from "typia";
import { difference, range } from "remeda";

type Index = number & tags.Type<"int64">;

/**
 * 다운로드 대기열 클래스
 *
 * NOTE: 명시적으로 싱글톤 패턴이 적용되지 않음
 * NOTE: Solid.js의 `createStore`를 사용하려다가 필요 없을 것 같아서 그냥 클래스로 구현함
 */
class DownloadQueue {
  private readonly queue: DownloadRequest[];
  private setQueue: SetStoreFunction<DownloadRequest[]>;

  constructor() {
    const [queue, setQueue] = createStore<DownloadRequest[]>([]);
    this.queue = queue;
    this.setQueue = setQueue;
  }

  /** 대기열에 새로운 요청을 추가함 */
  public addRequest(request: DownloadRequest) {
    /** 원본 배열 인덱스 */
    const indexes = range(0, this.queue.length);

    /** 중복 요소 인덱스 (URL 기준)
     * request.url과 같은 url을 가진 요청 인덱스를 저장함
     */
    const duplicatedIndexes = this.queue.reduce<number[]>(
      (returnValue, currentValue, index) => {
        if (currentValue.url === request.url) return [...returnValue, index];
        return returnValue;
      },
      []
    );

    /** 중복 인덱스를 제거한 인덱스 */
    const remainIndexes = difference(indexes, duplicatedIndexes);
    /** 중복을 제거한 배열 */
    const cleanedQueue = remainIndexes.map((idx) => this.queue[idx]);
    /** 새로운 요청을 추가한 큐 배열 */
    const newQueue = [...cleanedQueue, request];

    // 대기열 정보 업데이트
    this.setQueue(newQueue);
  }

  /** 인덱스로 지정된 요청을 제거함 */
  public dropRequestByIndex(idx: Index) {
    if (0 <= idx && idx < this.queue.length)
      throw new Error(`[DownloadQueue] ${idx}는 유효한 인덱스가 아닙니다`);

    const newQueue = [
      ...this.queue.slice(0, idx),
      ...this.queue.slice(idx + 1),
    ];
    this.setQueue(newQueue);
  }

  /** 대기열 데이터를 호추랗ㅁ */
  public getQueue() {
    return this.queue;
  }
}

export default DownloadQueue;
