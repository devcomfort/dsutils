import { FC, useState } from "react";
import DownloadList from "./DownloadList";
import { URLStructure, URLs } from "../store";
import download_handler from "../assets/download_handler";
import { useRecoilValue, useSetRecoilState } from "recoil";

const downloadAll = (urls: URLStructure[]) =>
  download_handler(urls).downloadAll();

const DownloadPanel: FC<{ urls: URLStructure[] }> = ({ urls }) => {
  const State = useRecoilValue(URLs);
  const setState = useSetRecoilState(URLs);

  return (
    <div className="download-panel">
      {<DownloadList urls={urls} />}
      <input
        type="button"
        value={"모두 다운로드"}
        disabled={State.filter((v) => v.isWorking).length > 0}
        onClick={() => {
          Promise.resolve(
            setState((value) =>
              value.map((v) => ({
                ...v,
                isWorking: true,
              }))
            )
          )
            .then(() => downloadAll(urls))
            .then(() =>
              setState((value) =>
                value.map((v) => ({ ...v, isWorking: false }))
              )
            );
        }}
      />
    </div>
  );
};

export default DownloadPanel;
