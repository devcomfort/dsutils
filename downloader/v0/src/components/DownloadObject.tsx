import { FC, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";

import DownloadCSS from "./Download.module.sass";

import Skeleton from "react-loading-skeleton";
import "../../../../node_modules/react-loading-skeleton/dist/skeleton.css";

import { URLStructure, URLs } from "../store";
import { fetchMeta, download as _download } from "../assets/download_handler";

// @ts-ignore
import byteSize from "byte-size";

const DownloadObject: FC<{ url: URLStructure }> = ({ url: URL }) => {
  const { url, name, isWorking } = URL;
  const _setURLs = useSetRecoilState(URLs);

  const [fileSize, setFileSize] = useState<string>("");

  const deleteURL = () =>
    _setURLs((_urls) => _urls.filter((_url) => !(_url.url === url)));

  const download = () => {
    Promise.resolve(
      _setURLs((value) =>
        value.map((v) => ({ ...v, isWorking: v.url === url }))
      )
    )
      .then(() => _download(url, name))
      .then(() =>
        _setURLs((value) => value.map((v) => ({ ...v, isWorking: false })))
      );
  };

  useEffect(() => {
    fetchMeta(url)
      .then((value) => {
        const contentType = value.headers.get("content-type");
        const contentLength = value.headers.get("content-length");

        // 타입이 영상이 아닌 경우
        if (!/(video)/.test(contentType || "")) {
          window.alert("유효하지 않은 영상 주소입니다!");
          deleteURL();
          return;
        }

        setFileSize(byteSize(contentLength).toString());
      })
      .catch((err) => {
        console.error(err);
        alert(`유효하지 않은 주소입니다! (데이터 요청 실패)`);
        deleteURL();
        return;
      });
  }, [url]);

  const _url = url.split("").splice(0, 52).join("");

  return (
    <div className="collapsible">
      <input type="checkbox" id="collapsible-data" name="collapsible" />
      <label htmlFor="collapsible-data" className="collapsible-data">
        {/* PaperCSS Collapsible 형식을 그대로 가져옴. */}
        <div className={DownloadCSS.grid_col}>
          <p>{name}</p>
          <p title={url}>{url.length > 52 ? `${_url}...` : _url}</p>
          <input
            type="button"
            value={"URL 제거"}
            onClick={(e) => {
              deleteURL();
            }}
          />
          <input
            type="button"
            value={"다운로드"}
            onClick={download}
            disabled={isWorking}
          />
        </div>
      </label>
      <div className="collapsible-body">
        {fileSize !== "" ? (
          <p>파일 용량: {fileSize}</p>
        ) : (
          <Skeleton height={30}></Skeleton>
        )}
      </div>
    </div>
  );
};

export default DownloadObject;
