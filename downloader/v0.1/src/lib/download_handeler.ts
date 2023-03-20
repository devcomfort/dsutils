import byteSize from "byte-size";
import download from "downloadjs";
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

  const get = () => fetch(opts.url, { method: "GET" });
  const blob = () => get().then((response) => response.blob());
  const _download = (name?: string) =>
    blob().then((blob) => {
      const _name = name || new URL(opts.url).pathname.split("/").at(-1);
      return download(blob, _name);
    });

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
