import { createStore } from "solid-js/store";
import { DownloadRequest } from "../download-handler/schema";
import { tags } from "typia";

type Index = number & tags.Type<"int64">;

export const downloadQueue = (() => {
  const [queue, setQueue] = createStore<DownloadRequest[]>([]);
  const getQueue = () => queue;
  const length = () => getQueue().length;

  /** 동일한 URL의 데이터를 제거함 */
  const dropByUrl = (request: DownloadRequest) =>
    setQueue((queue) => queue.filter((task) => task.url !== request.url));

  const enqueue = (request: DownloadRequest) => {
    // 중복 요소를 제거함 (URL 기준)
    // : 기존 데이터를 업데이트 하는 효과를 낼 수 있음
    dropByUrl(request);
    // 데이터를 삽입함
    setQueue((queue) => [...queue, request]);
  };
  const dequeue = () => {
    const _return = queue[0];
    setQueue((queue) => queue.slice(1));
    return _return;
  };

  const dropByIndex = (idx: Index) => {
    const _return = queue.at(idx);
    // idx 요소 제거
    setQueue((queue) => [...queue.slice(0, idx), ...queue.slice(idx + 1)]);
    return _return;
  };

  return {
    // 기존 상태들
    getQueue,
    setQueue,
    // 추가된 메소드들
    enqueue,
    dequeue,
    dropByIndex,
    length,
  };
})();
