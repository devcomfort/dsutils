// React 불러오기
import { useState } from "react";
// Recoil 불러오기
import { useRecoilValue, useSetRecoilState } from "recoil";

// 내부 선언 라이브러리
import DownloadPanel from "./components/DownloadPanel";
import URLHandler from "./assets/url";

// 상태 관리 라이브러리, 타입 정보 가져오기
import { URLs } from "./store";
import type { URLStructure } from "./store";

// 메인 레포에서 PaperCSS 가져오기 (수정된 css)
import "./assets/paper.css";
import "./App.sass";

function App() {
  const urls = useRecoilValue(URLs);
  const setURLs = useSetRecoilState(URLs);
  const [url, setURL] = useState<string>("");
  const [name, setName] = useState<string>("");

  const addURL = (url: string, name?: string) => {
    const _url: URLStructure = {
      url,
      name,
      isWorking: false,
    };

    setURLs((values) => [...values, _url]);
  };

  return (
    <div className="App">
      <h1>강의 다운로더</h1>
      <form
        action="#"
        onSubmit={(e) => {
          e.preventDefault();

          /** URL 호스트, 포트 정보 변경 */
          const _url = URLHandler(url);

          if (!_url) {
            alert(`유효한 URL을 입력해주세요!`);
            return false;
          }

          if (urls.filter(({ url }) => url === _url).length > 0) {
            alert(`${_url}은 이미 추가된 URL 입니다!`);
            return false;
          }

          addURL(_url, name || new URL(_url).pathname.split("/").at(-1));

          setURL("");
          setName("");

          return false;
        }}
      >
        <div className="col">
          <input
            type="text"
            placeholder="다운로드 URL"
            name="download-url"
            className="download-url"
            value={url}
            onChange={(e) => setURL(e.target.value as string)}
          />
        </div>
        <div className="col">
          <input
            type="text"
            placeholder="파일 이름"
            name="filename"
            className="filename"
            value={name}
            onChange={(e) => setName(e.target.value as string)}
          />
          <input type="submit" className="submit" value={"추가"} />
        </div>
      </form>

      <DownloadPanel urls={urls}></DownloadPanel>
    </div>
  );
}

export default App;
