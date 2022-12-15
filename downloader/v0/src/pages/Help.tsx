import Figure1 from "../assets/help-1.png";
import Figure2 from "../assets/help-2.png";
import Figure3 from "../assets/help-3.png";
import Figure4 from "../assets/help-4.png";
import Figure5 from "../assets/help-5.jpg";
import Figure6 from "../assets/help-6.jpg";

import styles from "../assets/Help.module.sass";

const Image: React.FC<{ src: string }> = ({ src }) => (
  <p>
    <img src={src} alt={src} />
  </p>
);

export default () => {
  return (
    <div className={styles.HelpPage}>
      <h2>사용법</h2>
      <h4>
        1. 다운로드 하려고 하는 영상을 재생한 후, <code>F12</code> 또는{" "}
        <code>Ctrl + Shift + J</code>를 눌러 개발자 모드를 활성화 합니다.
      </h4>
      <Image src={Figure1} />
      <h4>
        2. 좌상단의 아이콘을 클릭하거나 <code>Ctrl + Shift + C</code> 단축키를
        통해 <code>엘리먼트 선택</code> 기능을 활성화 합니다.
      </h4>
      <Image src={Figure2} />
      <h4>3. 동영상 창을 클릭합니다.</h4>
      <Image src={Figure3} />
      <h4>
        4. <b>http://</b> 또는 <b>https://</b>로 시작하는 링크를 찾아 더블
        클릭하고 복사합니다. (단축키: <code>Ctrl + C</code>)
      </h4>
      <Image src={Figure4} />
      <h4>
        5. 복사한 링크를 강의 다운로더의 <code>다운로드 URL</code>란에 입력 후,
        원하는 파일 이름을 입력합니다. <br /> 파일 이름은 확장자까지 모두
        입력해야 하며, 입력하지 않는 경우 URL에 입력된 파일 이름이 사용됩니다.
        <br />
        URL이 <code>~~~/ssmovie.mp4</code>로 끝나면 기본 파일 이름은{" "}
        <code>ssmovie.mp4</code> 입니다. <br />
        커스텀 파일 이름의 예시는 <code>강의이름.mp4</code>,{" "}
        <code>채플4.mp4</code> 등이 있습니다. (파일 형식을 꼭 포함하여 입력해야
        합니다!)
      </h4>
      <Image src={Figure5} />
      <h4>
        6. 원하는 강의를 모두 추가했다면, <code>모두 다운로드</code> 버튼을 통해
        추가된 파일을 한번에 모두 다운로드하거나, <code>다운로드</code> 버튼을
        통해 개별적으로 파일을 다운로드 할 수 있습니다.
      </h4>
      <Image src={Figure6} />
    </div>
  );
};
