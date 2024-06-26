import { OnRatioUpdated } from "..";

export interface IRatio {
  handlerId: string;
  getRatio: OnRatioUpdated;
}
