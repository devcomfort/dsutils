// 여러 개의 파일을 다운로드 받는데 사용하는 구현체입니다

import _ from "lodash/fp";
import { BehaviorSubject } from "rxjs";
import { FirstFileDownload } from "./first-file-download";
import type { DownloadStatus } from "./types/download-status";
import { isIntArray } from "./helper/is-int-array";
import { isInt } from "./helper/is-int";

/**
 * ### 인덱스가 유효한 범위 내에 있는지 검사합니다
 *
 * start <= index && index < end
 *
 * @param index 검사할 인덱스
 * @param start 시작 인덱스
 * @param end 끝 인덱스
 * @returns
 */
const isRange = (index: number, start: number, end: number) =>
  isInt(index) && start <= index && index < end;

export class MultipleFileDownload {
  private handlers: FirstFileDownload[] = [];
  public states: DownloadStatus[];

  /**
   * ### 복수 파일의 다운로드 상태를 관찰할 수 있도록하는 subject들
   *
   * - 다운로드 진행 중인 개별 파일에 대한 상태를 관찰할 수 있도록 합니다
   */
  public subscriptions: BehaviorSubject<DownloadStatus>[];

  constructor(urls: string[][]) {
    this.handlers = urls.map((url) => new FirstFileDownload(url));
    this.subscriptions = this.handlers.map((handler) => handler.subject);

    this.states = new Array(urls.length).map(() => ({
      downloadedRatio: 0,
      downloadedSize: 0,
      fileSize: null,
      mimeType: null,
    }));
  }

  async download(useCache?: boolean) {
    return Promise.all(
      this.handlers.map((handler) => handler.download(useCache))
    );
  }

  cancel(): void;
  cancel(index: number): void;
  cancel(index: number[]): void;
  cancel(index?: number | number[]) {
    /** 취소 처리할 인덱스 */
    let targetIndexes: number[] = [];

    if (isInt(index) && isRange(index, 0, this.handlers.length))
      targetIndexes = [index];
    else if (isIntArray(index))
      targetIndexes = _.filter(
        (idx) => isRange(idx, 0, this.handlers.length),
        index
      );
    // 입력이 없거나(undefined), 지원되지 않는 값인 경우
    else targetIndexes = [];

    targetIndexes.forEach((index) => {
      this.handlers[index].cancel();
    });
  }
}
