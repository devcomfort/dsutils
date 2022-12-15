// React Router 호출
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 페이지
import Downloader from "./pages/Downloader";

// 메인 레포에서 PaperCSS 가져오기 (수정된 css)
import "./assets/paper.css";
import "./App.sass";
import Help from "./pages/Help";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Downloader />}></Route>
          <Route path="/help" element={<Help />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
