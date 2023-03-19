/**
 * byte-size
 * @link https://www.npmjs.com/package/byte-size
 */

/**
 * 사용자 정의 단위. from부터 to까지를 해당 단위를 붙여 설명함.
 *
 * 예시 : from이 1e3, to가 1e6, unit이 'K', 입력이 1000인 경우 결과가 '10.0K'
 */
interface CustomUnit {
  /** 시작 단위 */
  from: number;
  /** 끝 단위 */
  to: number;
  /** 단위 */
  unit: string;
}
type CustomUnits<T extends string> = Record<T, CustomUnit[]>;

type MetricUnit = "kB" | "MB" | "GB" | "TB" | "PB" | "EB" | "ZB" | "YB";
type IECUnit = "KiB" | "MiB" | "GiB" | "TiB" | "PiB" | "EiB" | "ZiB" | "YiB";
type UnitsOptions = "metric" | "iec" | "metric_octet" | "iec_octet";

interface Options<T extends string = ""> {
  units?: T extends "" ? UnitsOptions : UnitsOptions | T;
  /** 소수점 정확도 정보 (기본값: 1) */
  precision?: number;
  /** 사용자 정의 단위 정보 */
  customUnits?: T extends "" ? never : CustomUnits<T>;
  /** toString 함수를 원하는 다른 유형으로 지정할 수 있습니다. */
  toStringFn?: (this: { value: number; unit: string }) => string;
  /** IETF 형식을 따르는 언어 코드를 입력해주세요. */
  locale?: string;
}

declare module "byte-size" {
  export default function byteSize<T extends string>(
    bytes: number,
    opts?: Options<T>
  ): string;
}
