// React 불러오기
import { useContext, useState } from "react";
// Recoil 불러오기

// 내부 선언 라이브러리
import DownloadPanel from "./components/DownloadPanel";
import URLHandler from "./assets/url";

// 메인 레포에서 PaperCSS 가져오기 (수정된 css)
import "./assets/paper.css";
import "./App.sass";
import { URLs as URLsState } from "./store";
import { useRecoilState } from "recoil";

function App() {
  const [url, setURL] = useState<string>("");
  const [name, setName] = useState<string>("");

  const [URLs, setURLs] = useRecoilState(URLsState);

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

          if (URLs.map((u) => u.url).includes(_url)) {
            alert(`${_url}은 이미 추가된 URL 입니다!`);
            return false;
          }

          setURLs([
            ...URLs,
            {
              url: _url,
              name: name,
              isFetching: false,
            },
          ]);

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

      <DownloadPanel />
    </div>
  );
}

export default App;
