import DownloadObject from "./DownloadObject";
import { URLs as URLsStates } from "../store";
import styles from "./Download.module.sass";
import { useRecoilValue } from "recoil";

const DownloadList = () => {
  const URLs = useRecoilValue(URLsStates);
  if (URLs.length === 0)
    return (
      <>
        <p>입력 없음</p>
      </>
    );

  return (
    <>
      <div className={styles.grid_col}>
        <p>파일 이름</p>
        <p>파일 URL</p>
        <p>삭제</p>
        <p>다운로드</p>
      </div>
      {URLs.map((url) => (
        <DownloadObject url={url} />
      ))}
    </>
  );
};

export default DownloadList;
