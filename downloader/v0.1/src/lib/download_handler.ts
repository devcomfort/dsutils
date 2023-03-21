import byteSize from "byte-size";
import download from "downloadjs";
import { fileTypeFromBuffer } from "file-type";
import isURL from "./isurl";

interface InstanceOptions {
  url: string;
}

/**
 * 파일 이름 추출 함수 (요청 없는 파일 이름 추출)
 *
 * URL과 별도로 입력된 이름을 입력받아, 이름이 없다면 URL에서, 이름이 있다면 이름에서 파일 이름을 추출해주는 함수 (-> basename)
 */
const getFilename = (url: string, name: string): string => {
  const extract = (filename: string) => filename.split("/").at(-1);
  const [urlName, nameName] = [url, name].map(extract);
  return nameName ? nameName : urlName || "";
};

/**
 * 파일 이름 추출 함수 (다운로드 시 사용, 더 정확한 파일 확장자 추론)
 */
const getBasename = async (
  url: string,
  name: string,
  file: Blob | ArrayBuffer
) => {
  if (file instanceof Blob) file = await file.arrayBuffer();
  // 데이터 구조를 분석하여 확장자 추론
  const inferencedMimeType = await fileTypeFromBuffer(file);

  // 1. 이름이 있을 땐 이름에서 이름을 가져오고
  // 2. 이름이 없을 땐 URL에서 이름을 추출해오고
  const filename = getFilename(url, name);

  // 3. 확장자는 Blob 객체를 통해 추정하여 입력하되, 없다면 파일 이름에서 추출 시도, 파일 이름에서도 확장자를 추론할 수 없다면 파일 이름만 달아서 내보내기
  const ext = inferencedMimeType?.ext || "";

  return ext.length > 0 ? `${filename}.${ext}` : `${filename}`;
};

const createFetchInstance = (opts: InstanceOptions) => {
  if (!(opts instanceof Object && isURL(opts.url))) return;

  let _header: Headers;

  const header = (forceRequest: boolean = false): Promise<Headers> =>
    Promise.resolve(_header)
      .then((header?: Headers) => {
        // Step 1: Request header, when there is no cache or "forceRequest" parameter.
        if (!header || forceRequest)
          return fetch(opts.url, { method: "head" }).then(
            (fetched) => fetched.headers
          );
        return header;
      })
      .then((header) => {
        // Step 2: Save the data to the cache.
        _header = header;
        return _header;
      });
  const mimeType = () =>
    header().then((header) => header.get("Content-Type") || "");
  const size = (): Promise<`${number}`> =>
    header().then(
      (header) => header.get("Content-Length") || "0"
    ) as Promise<`${number}`>;
  const sizeAsString = () => size().then((size) => byteSize(parseInt(size)));

  const get = () => fetch(opts.url, { method: "GET" });
  const blob = () => get().then((response) => response.blob());

  const _download = async (name?: string) => {
    const _blob = await blob();
    const filename = await getBasename(opts.url, name || "", _blob);
    return download(_blob, filename);
  };

  // TODO : fileTypeFromBuffer, getBasename 호출에 의해 각각 fileTypeFromBuffer가 2번 호출됩니다.
  // 중복 호출이므로 최적화를 권장합니다.
  const _downloadWithProgress = async (
    name: string = "",
    updater: (value: number) => void
  ) => {
    const _size = parseInt(await size()); // 총 데이터 크기 저장 (바이트 단위)
    let loaded = 0; // 로드 된 데이터 양 저장 (바이트 단위)
    let chunks: Uint8Array[]; // 다운로드 한 데이터 청크 별로 정리

    updater(0);

    return get()
      .then((response) => response.body)
      .then((body) => body!.getReader())
      .then(async (reader) => {
        const stream = new ReadableStream({
          start: (controller) => {
            const push = async () => {
              const { done, value } = await reader.read();

              if (done) {
                updater(1);
                controller.close();
                return;
              }

              loaded += value.byteLength;
              updater(loaded / _size);

              // stream이 BlobPart로 취급되어 오류가 발생 -> controller 함수 대신 chunks에 데이터를 쌓아 처리.
              // controller.enqueue(value);
              chunks.push(value);
              push();
            };
            push();
          },
        });

        const arrayBufferLike = chunks.reduce<number[]>(
          (acc, cur) => [...acc, ...cur],
          []
        );
        const arrayBuffer = new Uint8Array(arrayBufferLike).buffer;
        const mimeType = (await fileTypeFromBuffer(arrayBuffer))?.mime;
        const blob = new Blob(chunks, { type: mimeType });

        return blob;
      })
      .then(async (blob) => {
        return download(blob, await getBasename(opts.url, name || "", blob));
      });
  };

  return {
    header,
    mimeType,
    size,
    sizeAsString,
    get,
    blob,
    download: _download,
    downloadWithProgress: _downloadWithProgress,
  };
};

export { createFetchInstance, getFilename };
export default createFetchInstance;
