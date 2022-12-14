import _download from "downloadjs";
// @ts-ignore
import byteSize from "byte-size";

export interface URLStructure {
  /** 파일 이름 정보 (확장자 포함) */
  name?: string;
  /** URL 정보 */
  url: string;
  isFetching: boolean;
}

/** URL 메타 데이터 */
export interface URLMeta {
  /** 데이터 크기 (human readable) */
  readonly dataSize: () => Promise<string>;
  /** 데이터 크기 (정수를 문자로) */
  readonly blob: () => Promise<Blob | File>;
  /** MIME 타입 */
  readonly mimeType: () => Promise<string>;
  /** 파일 데이터 */
  readonly download: (name: string) => Promise<any>;
}

/** URLProfile 반환형 */
export type URLProfileType = URLMeta & {
  /** 파일 URL */
  url: () => string;
  /** 파일 이름 */
  name: () => string;
  /** fetch 상태 */
  isFetching: () => boolean;
};

/** 데이터 크기, 데이터 요청, 다운로드 동작 코드 */
export const fetcher = (url: string): URLMeta => {
  const _getMeta = () => fetch(url, { method: "head" });
  const _getMIMEType = () =>
    _getMeta().then((_fetched) => _fetched.headers.get("Content-Type") || "");
  const _getDatasize = () =>
    _getMeta()
      .then((_fetched) => _fetched.headers.get("Content-Length") || "0")
      .then((_dataSize) => ({
        size: () => _dataSize,
        toString: () => byteSize(_dataSize) as string,
      }));
  const _getData = () => fetch(url, { method: "GET" });
  const _getBlob = () => _getData().then((_fetched) => _fetched.blob());
  const download = (name: string) =>
    _getBlob().then((_blob) =>
      _download(_blob, name || new URL(url).pathname.split("/").at(-1) || "")
    );

  return {
    dataSize: () => _getDatasize().then((res) => res.toString()),
    mimeType: _getMIMEType,
    blob: _getBlob,
    download,
  };
};
