import { Int32, Key, Ratio, State } from "../schemas/core";
import ChildWorker from "./fastest-download-worker?worker";
import { isMultipleRequest } from "../schemas/requests/validators";
import { isSingleRatio, isSingleResult } from "../schemas/responses/validators";
import { IRequest } from "../schemas/requests";
import { MultipleRatio, MultipleResult } from "../schemas/responses";
import { DownloadRequest } from "../../schema";

/** task pointer */
let pos: Int32 = 0;

// TODO: 동시 다운로드 수 제한량을 외부에서 전송하도록 설정하기
//       현재: 외부에서 지정할 수 있도록 기능은 열려있지만 실질적으로 지정하는 기능이 없음
let poolSize: Int32 = navigator.hardwareConcurrency - 1;
let keys: Key[];
let ratios: Record<Key, Ratio> = {};
let data: Record<Key, State> = {};

let requests: DownloadRequest[] = [];

let workers: Worker[];
/** 스레드의 유휴 상태 여부 */
let isIdle: boolean[];

const isQueueEmpty = () => pos >= requests.length;
/** 모든 worker가 활동 중임 여부 */
const isPoolOccupied = () => isIdle.every((isIdle) => isIdle === false);
/** 모든 worker가 유휴 상태임 여부 */
const isPoolEmpty = () => isIdle.every((isIdle) => isIdle === true);
const isDone = () => isQueueEmpty() && isPoolEmpty();

/** 대기열에서 하나의 작업을 가져와 하위 스레드에 작업을 요청함 */
const runTask = () => {
  // 이미 모든 요청이 진행되었거나 진행 중
  if (isQueueEmpty()) return false;
  // 모든 풀이 꽉 참
  if (isPoolOccupied()) return false;

  let idleWorkerIndex: Int32;
  for (
    idleWorkerIndex = 0;
    idleWorkerIndex < workers.length;
    idleWorkerIndex++
  ) {
    if (isIdle[idleWorkerIndex]) break;
  }

  // 하위 스레드에 작업 전송
  workers[idleWorkerIndex].postMessage({
    type: "single-request",
    key: keys[pos],
    message: requests[pos],
  } satisfies IRequest);

  isIdle[idleWorkerIndex] = false;
  pos++;

  return true;
};

/** 하위 스레드 이벤트 리스너 */
// TODO: index 반영하는 작업하기 (wrapper 함수 써야 할 듯, Currying이나)
//       어떤 worker의 유휴 상태를 변경할 지, 작업해야 함
type WorkerOnMessage = Exclude<Worker["onmessage"], null>;
const onChildWorkerMessage =
  (idx: Int32) =>
  ([ev]: Parameters<WorkerOnMessage>) => {
    /** 하위 스레드로부터의 응답 */
    const response = ev.data;

    if (isSingleRatio(response)) {
      const { message: ratio, key } = response;
      ratios[key] = ratio;
      // ratioUpdated++;

      // if (ratioUpdated % ratioUpdateRate === 0)
      self.postMessage({
        type: "multiple-ratio",
        keys,
        message: keys.map((key) => ratios[key]),
      } satisfies MultipleRatio);
    }

    if (isSingleResult(response)) {
      // 완료된 작업 반영
      isIdle[idx] = true;

      // 데이터 저장하고
      // 모든 데이터가 다운로드 되었다면, self.postMessage로 데이터 반환
      const {
        message: { key },
      } = response;

      // 응답 결과 저장
      data[key] = response.message;
      // 해당 작업이 완료되면, 작업을 수행 중이던 worker를 유휴 상태로 변경함
      isIdle[idx] = true;

      if (isDone()) {
        console.info(
          `[download-worker.ts] 단일 파일 다운로드 완료 처리됨 ${new Date().toLocaleString()}`
        );

        const results = keys.map((key) => data[key]);
        const faileds = results.filter((result) => result.state === "failed");
        const failedCount = faileds.length;

        if (failedCount >= 1) {
          console.warn(
            `[download-worker.ts] 실패한 요청이 ${failedCount}개 있습니다`
          );

          faileds.forEach((failed) => {
            if (failed.state === "failed") {
              console.warn(failed.reason);
            }
          });
        }

        self.postMessage({
          type: "multiple-result",
          message: results,
        } satisfies MultipleResult);
      }

      if (runTask()) {
        console.info(
          `[download-worker.ts] 수행 가능한 작업이 있어서 추가로 수행함 ${new Date().toLocaleString()}`
        );
      }
    }
  };

self.onmessage = (ev) => {
  const response = ev.data;

  if (!isMultipleRequest(response)) {
    throw new Error(`[download-worker.ts] 잘못된 다운로드 시작 요청입니다`);
  }

  const { message, poolSize: _poolSize } = response;
  requests = message;

  poolSize = _poolSize ?? poolSize;
  pos = 0;

  // 스레드 생성
  workers = new Array(poolSize).fill(0).map(() => new ChildWorker());
  // 이벤트 바인딩
  for (let i = 0; i < workers.length; i++) {
    workers[i].onmessage = (ev) => onChildWorkerMessage(i)([ev]);
  }
  isIdle = new Array(poolSize).fill(true);

  // key 생성
  keys = requests.map(() => crypto.randomUUID());
  // 진행도 객체, 데이터 객체 준비하기
  keys.forEach((key) => {
    ratios[key] = 0;
  });

  // 초기 작업; 처리 풀 크기에 맞게 모든 요청을 시작함
  while (runTask()) {
    console.info(
      `[download-worker.ts] 초기 작업 요청 ${new Date().toLocaleString()}`
    );
  }
};
