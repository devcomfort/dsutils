import { z } from "zod";
import { URL } from "../validator/url";

/** 기본적인 요청 정보 */
export const Request = z.object({
  filename: z.string({
    invalid_type_error: "문자열이 아닌 파일 이름이 입력되었습니다",
  }),
  url: URL,
  status: z
    .enum(["init_failed", "fetching", "downloading", "downloaded", "failed"])
    .describe(
      "파일의 다운로드/로드 상태를 정의합니다\n" +
        "init_failed: 유효하지 않은 URL 등의 이유로 작업 시작이 불가한 사례입니다\n" +
        "fetching: 기본적인 메타데이터를 로드하는 상태입니다\n" +
        "downloading: 물리적으로 파일을 다운로드 받는 중인 상태입니다\n" +
        "downloaded: 파일 다운로드를 마친 상태입니다\n" +
        "failed: 다운로드 실패 상태입니다"
    ),
});

/** 파일 메타데이터 정보 */
export const Meta = z.object({
  fileSize: z
    .number({
      invalid_type_error: "숫자가 아닌 파일 크기 값이 사용되었습니다",
    })
    .int("파일 크기는 바이트 단위로 정수값이 입력되어야 합니다")
    .min(0, "파일 크기로 0 미만의 값이 사용되었습니다")
    .nullable()
    .describe("파일 크기는 해석 가능한 값이 없는 경우에 null이 저장됩니다"),
  mimeType: z
    .string()
    .nullable()
    .describe("MIME 정보를 가져올 수 없는 경우, null이 저장됩니다"),
});

/** 파일 다운로드 정보 */
export const FileData = Meta.extend({
  blob: z
    .instanceof(Blob, {
      message: "잘못된 파일 데이터가 입력되었습니다",
    })
    .optional()
    .describe("파일 데이터가 입력되기 이전에는 undefined 할 수 있습니다"),
});

export type IRequest = z.infer<typeof Request>;
export type IMeta = z.infer<typeof Meta>;
export type IFileData = z.infer<typeof FileData>;
