import { atom, selector } from "recoil";
import { URLStructure } from "./assets/download_handler";

const _URLs = atom<URLStructure[]>({
  key: "urls",
  default: [],
});

export const URLs = selector<URLStructure[]>({
  key: "urls-handler",
  get: ({ get }) => {
    const __URLs = get(_URLs);
    return __URLs.map((u) => ({
      ...u,
      name: !u.name ? new URL(u.url).pathname.split("/").at(-1) || "" : u.name,
      isFetching: u.isFetching === undefined ? false : u.isFetching,
    }));
  },
  set: ({ set }, newValue) => {
    set(_URLs, newValue);
  },
});
