import { Suspense, useContext } from "react";
import DownloadList from "./DownloadList";
import { fetcher } from "../assets/download_handler";
import { useRecoilValue, useRecoilState } from "recoil";
import { URLs as URLsState } from "../store";

const DownloadPanel = () => {
  const [URLs, setURLs] = useRecoilState(URLsState);

  const downloadAll = () =>
    Promise.all(
      URLs.map((u) =>
        Promise.resolve(
          setURLs((urls) =>
            urls.map((_u) =>
              _u.url === u.url ? { ..._u, isFetching: true } : u
            )
          )
        )
          .then(() => fetcher(u.url).download(u.name || ""))
          .then(() =>
            setURLs((urls) =>
              urls.map((_u) =>
                _u.url === u.url ? { ..._u, isFetching: true } : u
              )
            )
          )
      )
    );

  return (
    <div className="download-panel">
      <Suspense fallback={<p>Loading...</p>}>
        <DownloadList />
      </Suspense>
      <input
        type="button"
        value={"모두 다운로드"}
        disabled={URLs.filter((u) => u.isFetching).length > 0}
        onClick={() => downloadAll()}
      />
    </div>
  );
};

export default DownloadPanel;
