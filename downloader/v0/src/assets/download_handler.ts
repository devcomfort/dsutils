import _download from "downloadjs";
// @ts-ignore
import byteSize from "byte-size";
import { URLStructure } from "../store";

/** 데이터 헤더 가져오기 (HEAD) */
export const fetchMeta = (url: string) => fetch(url, { method: "head" });
/** 데이터 길이 값 가져오기 (as bytes, HEAD) */
export const fetchDataSize = (url: string) =>
  fetchMeta(url).then((_fetch) => {
    const _size = _fetch.headers.get("content-length") || "0";
    return {
      size: () => _size,
      toString: () => byteSize(_size.toString()),
    };
  });
/** 데이터 요청 (GET) */
export const fetchData = async (url: string) => fetch(url, { method: "GET" });

/** 파일 다운로드 */
export const download = async (
  url: string,
  name: string | undefined = undefined
) => {
  const _fetched = await fetchData(url);
  const _blob = await _fetched.blob();

  return _download(_blob, name ?? new URL(url).pathname.split("/").at(-1));
};

export default function (urls: URLStructure[]) {
  const fetchMetaByIndex = (index: number) => fetchMeta(urls[index].url);
  const fetchMetaAll = () =>
    Promise.allSettled(urls.map(({ url }) => fetchMeta(url)));

  const fetchDataSizeByIndex = (index: number) =>
    fetchDataSize(urls[index].url).then((v) => v.toString());
  const fetchDataSizeAll = () =>
    Promise.allSettled(urls.map(({ url: _url }) => fetchDataSize(_url)));

  const fetchDataByIndex = async (index: number) => fetchData(urls[index].url);
  const fetchDataAll = () =>
    Promise.allSettled(urls.map(({ url }) => fetchData(url)));

  const downloadAll = () =>
    Promise.allSettled(urls.map(({ url, name }) => download(url, name)));

  return {
    // 지정된 모든 URL의 메타 데이터 가져오기 (HEAD Method)
    fetchMetaAll,
    // 지정된 모든 URL의 실제 데이터 가져오기 (GET Method)
    fetchDataAll,
    fetchDataSizeAll,
    downloadAll,
  };
}
