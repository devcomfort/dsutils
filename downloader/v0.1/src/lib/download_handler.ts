import byteSize from "byte-size";
import download from "downloadjs";
import { fileTypeFromFile } from "file-type";
import parseFilepath from "parse-filepath";
import isURL from "./isurl";

interface InstanceOptions {
  url: string;
}

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

  const getFilenameFrom = async (
    url: string,
    name?: string
  ): Promise<string> => {
    const [filenameFromURL, filenameFromName] = [
      parseFilepath(url),
      parseFilepath(name || ""),
    ];
    const [urlExts, nameExts, actualMimeType] = await Promise.all([
      fileTypeFromFile(url),
      fileTypeFromFile(name || ""),
      mimeType(),
    ]);

    // 1. name이 입력되지 않음 -> URL의 타입과 이름을 기반으로 파일 이름 생성
    if (!filenameFromURL)
      return urlExts?.ext
        ? `${filenameFromURL}.${urlExts.ext}`
        : `${filenameFromURL}`;

    // 2. name이 입력되었으나 파일 확장자를 특정할 수 없음 -> 이름이 명확하다면 파일 확장자만 수정
    if (!nameExts)
      return urlExts?.ext
        ? `${filenameFromURL}.${urlExts.ext}`
        : `${filenameFromURL}`;

    // TODO : MIME 타입에서 확장자 추출하는 함수 또는 라이브러리 호출 추가
    // TODO : 로직 마저 작성하기
    // 1. name이 입력되지 않음.
    //    -> URL의 Mime타입과 이름을 기반으로 파일 이름 생성
    // 2. name이 입력되었으나 파일 확장자를 특정할 수 없음.
    //    -> 이름이 명확하다면 파일 확장자만 수정
    // 3. name이 입력되었으나 파일 확장자가 원본 파일이랑 다름.
    //    -> 파일 확장자만 수정
  };

  const get = () => fetch(opts.url, { method: "GET" });
  const blob = () => get().then((response) => response.blob());
  const _download = (name?: string) =>
    Promise.all([blob(), getFilenameFrom(opts.url, name)]).then(
      ([blob, name]) => download(blob, name)
    );

  const _downloadWithProgress = async (
    name: string = "",
    updater: (value: number) => void
  ) => {
    const _size = parseInt(await size()); // 총 데이터 크기 저장 (바이트 단위)
    const _type = await mimeType(); // 데이터의 MIME Type 정보 저장
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

        return Promise.all(chunks).then(
          (chunks) => new Blob(chunks, { type: _type })
        );
      })
      .then((blob) => {
        const _name = name || new URL(opts.url).pathname.split("/").at(-1);
        return download(blob, _name);
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

export { createFetchInstance };
export default createFetchInstance;
