import { atom } from "recoil";

export interface URLStructure {
  /** 파일 이름 정보 (확장자 포함) */
  name?: string;
  /** URL 정보 */
  url: string;
  /** 파일 다운로드 상태 */
  isWorking: boolean;
}

export const URLs = atom<URLStructure[]>({
  key: "urls",
  default: [],
});
