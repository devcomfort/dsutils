import React, { FC, useEffect, useState } from "react";

import DownloadCSS from "./Download.module.sass";

import Skeleton from "react-loading-skeleton";
import "../../../../node_modules/react-loading-skeleton/dist/skeleton.css";
import { URLStructure, fetcher } from "../assets/download_handler";
import { URLs as URLsState } from "../store";
import { useRecoilState } from "recoil";
import { Suspense } from "react";

const DownloadObject: FC<{ url: URLStructure }> = ({ url: URL }) => {
  const [URLs, setURLs] = useRecoilState(URLsState);
  const { url, name } = URL;

  const [fileSize, setFileSize] = useState<string>("");

  const deleteURL = () =>
    setURLs((_urls) => _urls.filter((_url) => !(_url.url === url)));

  const download = () =>
    Promise.resolve(
      setURLs((urls) =>
        urls.map((u) => (u.url === url ? { ...u, isFetching: true } : u))
      )
    )
      .then(() => fetcher(url).download(name || ""))
      .then(() =>
        setURLs((urls) =>
          urls.map((u) => (u.url === url ? { ...u, isFetching: false } : u))
        )
      );

  useEffect(() => {
    Promise.all([fetcher(url).mimeType(), fetcher(url).dataSize()])
      .then(([MIMEType, DataSize]) => {
        if (!/(video)/.test(MIMEType)) {
          window.alert("유효하지 않은 영상 주소입니다!");
          console.error("유효하지 않은 영상 주소입니다!");
          deleteURL();
          return;
        }

        setFileSize(DataSize.toString());
      })
      .catch((err) => {
        console.error(err);
        alert(`유효하지 않은 주소입니다! (데이터 요청 실패)`);
        deleteURL();
        return;
      });
  }, [url]);

  const _url = url.split("").splice(0, 52).join("");
  const urlID = `collapsible-data-${btoa(url)}`;

  return (
    <div className="collapsible">
      <input type="checkbox" id={urlID} name="collapsible" />
      <label htmlFor={urlID} className={urlID}>
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
            disabled={URLs.filter((u) => u.isFetching).length > 0}
          />
        </div>
      </label>
      <div className="collapsible-body">
        <Suspense fallback={<Skeleton height={30}></Skeleton>}>
          <p>파일 용량: {fileSize}</p>
        </Suspense>
      </div>
    </div>
  );
};

export default React.memo(DownloadObject);
