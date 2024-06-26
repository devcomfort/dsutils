import { tryit } from "radash";
import {
  conditional,
  filter,
  isError,
  isNonNullish,
  isNullish,
  join,
  map,
  pipe,
  range,
  round,
  zip,
} from "remeda";
import { For, Show, createSignal } from "solid-js";

import { URLHandler } from "~/libs/url-handler";

import { AiTwotoneWarning } from "solid-icons/ai";
// NOTE: https://www.npmjs.com/package/file-saver
import { saveAs } from "file-saver";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Flex } from "~/components/ui/flex";
import { Col, Grid } from "~/components/ui/grid";
import {
  TextField,
  TextFieldLabel,
  TextFieldTextArea,
} from "~/components/ui/text-field";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Progress,
  ProgressLabel,
  ProgressValueLabel,
} from "~/components/ui/progress";
import { defaultTo, get, multiply, split, trim } from "lodash/fp";
import { downloadQueue } from "~/libs/store/download-queue";
import { IMultipleRequest } from "~/libs/download-handler/download-worker/schemas/requests";
import {
  isMultipleRatio,
  isMultipleResult,
} from "~/libs/download-handler/download-worker/schemas/responses/validators";
import { ISucceed } from "~/libs/download-handler/download-worker/schemas/core/states";
import DownloadWorker from "~/libs/download-handler/download-worker/workers/download-worker?worker";
import { Ratios } from "~/libs/download-handler/download-worker/schemas/core";

// NOTE: AlertDialog 열림 여부
const [dialogOpen, setDialogOpen] = createSignal<boolean>(false);
const [dialogTitle, setDialogTitle] = createSignal<string>("");
const [dialogDescription, setDialogDescription] = createSignal<string>("");
/** Alert를 보인 후, 일정 시간 후 Alert를 제거함 */
const makeAlert = (ms: number = 3000) => {
  setDialogOpen(true);
  setTimeout(() => {
    setDialogOpen(false);
  }, ms);
};

const stages = ["initializing", "downloading", "done"];
const stageLabels = ["초기화 중", "다운로드 중", "완료됨"];
// NOTE: 다운로드 진행 상태
//       "": 진행 중이 아님
//       "initializing": 초기화 중
//       "downloading": 파일을 다운로드 하는 중
//       "done": 작업 완료
const [state, setState] = createSignal<
  "initializing" | "downloading" | "done" | ""
>("");

const stateLabel = () => {
  const index = stages.indexOf(state());
  if (index < 0) return "";
  return stageLabels.at(index)!;
};
/** 다운로드 진행 단계 (0~3) */
const stage = () => {
  const index = stages.indexOf(state());
  if (index < 0) return 0;
  return index;
};

const [ratio, setRatio] = createSignal<Ratios>([]);
const download = () => {
  // TODO: Worker 생성자를 import 하기 쉽도록 패키지/모듈/디렉토리 구조 개선하기 (코드도 개선해야함)
  // "~/libs/download-handler/download-worker/workers/download-worker?worker" 대신
  // import {DownloadWorker} from "~/libs/download-worker" 형태로 사용할 수 있도록 패키지/모듈/폴더 구조 개선하기 (물론 코드도 개선해야함)
  const worker = new DownloadWorker();

  setState("initializing");

  // 대기열 데이터 호출
  const _queue = [...downloadQueue.getQueue()];
  // 진행도 초기화
  setRatio(
    pipe(
      _queue.length,
      (length) => range(0, length),
      map(() => 0)
    )
  );

  const requests = {
    type: "multiple-request",
    message: _queue.map((request) => ({ ...request })),
    poolSize: 4,
  } satisfies IMultipleRequest;

  worker.onerror = (ev) => {
    console.error(`DownloadWorker에서 오류 발생:\n${ev}`);
  };

  worker.onmessage = (ev) => {
    // NOTE: onmessage 메소드가 비동기 함수를 처리할 수 없음
    //       따라서 비동기 함수를 IIFE 형태로 아래와 같이 시행함
    (async () => {
      const resp = ev.data;
      if (isMultipleResult(resp)) {
        /** 요청 결과 추출
         * @description 성공적으로 데이터를 저장했다면 Blob, 아니라면 undefined
         */
        const results = map(
          resp.message,
          conditional(
            [
              (result): result is ISucceed => result.state === "succeed",
              (result) => result.data,
            ],
            conditional.defaultCase(() => undefined)
          )
        );

        // TODO: Worker 코드들 모두 부분적으로 함수화하여 재작성하기 (가독성 목적)
        //       Worker.prototype.onmessage에는 비동기 함수를 입력할 수 없음

        const filenames = _queue.map((req) => req.filename);
        const pairs = zip(results, filenames);

        // TODO: 이미 다운로드 한 파일은 선택적/전체 단위로 캐싱된 데이터를 다시 다운로드 할 수 있도록 지원해야함
        // TODO: 재시도 횟수를 조정할 수 있도록 지원해야함
        //       재시도 횟수는 "download-handler.ts"에서 사용된 radash의 retry 함수를 참조하면 됨
        pairs.forEach(([blob, filename]) => {
          // 유효하지 않은 데이터(오류 데이터 등)는 무시
          if (isNullish(blob)) return;
          // TODO: FileSystem Access API를 통해 사용자가 지정한 디렉토리에 파일을 다운로드하도록 변경
          saveAs(blob, filename!);
          console.log(blob, filename!);
        });

        setState("done");

        console.warn(`[index.ts] terminate worker...`);
        worker.terminate();
      }

      if (isMultipleRatio(resp)) {
        setRatio(resp.message);
      }
    })();
  };

  setState("downloading");
  worker.postMessage(requests);
};

export function Main() {
  // NOTE: URL 입력을 임시로 저장합니다
  const [urlString, setUrlString] = createSignal<string>("");

  /** 대기열에 입력된 내용을 추가하는 함수 */
  const addQueue = () => {
    const _urlStrings = pipe(
      urlString(),
      split("\n"),
      map(trim),
      // 빈 문자열 제거
      filter((str) => str.length > 0),
      map(tryit(URLHandler.parse))
    );

    /** urlString 리스트를 해석하는 과정에서 발생한 모든 오류 추출 */
    const errors = pipe(_urlStrings, map(get(0)));

    // 1개 이상의 URL이 오류를 포함한 경우:
    // 경고 표시하기
    if (errors.some(isError)) {
      const errorMessage = pipe(
        errors,
        // 오류만 추출
        filter(isError),
        // 오류 메시지만 추출
        map((error) => error.message),
        // 줄바꿈 문자를 통해 병합
        join("\n")
      );

      // 경고 내용 입력 및 표시
      setDialogTitle("URL을 해석하지 못 했습니다");
      setDialogDescription(
        `"<URL>;<파일 이름>" 구조로 입력해주세요\n예시: "https://www.example.com/video.mp4;예시영상.mp4"\n\n${errorMessage}`
      );
      makeAlert();

      // 오류 로그 출력
      console.error(`[addQueue] URL을 해석하지 못 했습니다\n\n${errorMessage}`);

      return;
    }

    // NOTE: 오류가 발생하면 위에서 걸러짐
    //       오류가 발생하지 않았다면 현 위치에서 _urlString[:][1]를 추출했을 때 모두 유효한 DownloadRequest임
    const newRequests = pipe(
      _urlStrings,
      map(get(1)),
      // NOTE: 현 위치까지 왔다는 점에서 이미 undefined가 아니지만
      //       타입 추론이 undefined가 아님을 추론해주지 않아서 이렇게 처리함
      filter(isNonNullish)
    );
    newRequests.forEach((newRequest) => downloadQueue.enqueue(newRequest));
  };

  return (
    <>
      {/* 경고 컴포넌트 */}
      <Alert
        style={{
          position: "fixed",
          right: 0,
          bottom: 0,
          width: "40%",
          visibility: dialogOpen() ? "visible" : "hidden",
        }}
      >
        <AiTwotoneWarning />
        <AlertTitle>
          <For each={dialogTitle().split("\n")}>
            {(item, index) => {
              const length = dialogTitle().split("\n").length;

              return (
                <>
                  <span>{item}</span>
                  <Show when={index() < length - 1}>
                    <br />
                  </Show>
                </>
              );
            }}
          </For>
        </AlertTitle>
        <AlertDescription>
          <For each={dialogDescription().split("\n")}>
            {(item, index) => {
              const length = dialogDescription().split("\n").length;

              return (
                <>
                  <span>{item}</span>
                  <Show when={index() < length - 1}>
                    <br />
                  </Show>
                </>
              );
            }}
          </For>
        </AlertDescription>
      </Alert>

      <div class="w-screen h-screen p-2">
        <Grid cols={2} class="w-full h-full justify-center gap-2">
          <Col span={2}>
            <Flex flexDirection="row" justifyContent="evenly">
              <p class="text-3xl">강의 다운로더</p>
              <Button class="text-xl">도움말</Button>
            </Flex>
          </Col>

          <Col>
            {/* 다운로드 링크 입력 패널 */}
            <Card>
              <CardHeader>
                <CardTitle>다운로드 링크 입력</CardTitle>
              </CardHeader>
              <CardContent>
                <TextField>
                  <TextFieldLabel>다운로드 링크</TextFieldLabel>
                  <TextFieldTextArea
                    placeholder="다운로드 링크 입력 ('URL;파일이름' 구조로 입력하기)"
                    onInput={(ev) => {
                      const targetElement = ev.currentTarget;
                      const value = targetElement.value;

                      setUrlString(value);
                    }}
                  ></TextFieldTextArea>
                </TextField>
                <Flex flexDirection="row" justifyContent="end" class="mt-2">
                  <Button onClick={addQueue} disabled={state() !== ""}>
                    대기열 등록
                  </Button>
                </Flex>
                {/* 파일 다운로드 진행도 */}
                <Flex flexDirection="row" justifyContent="end" class="mt-2">
                  <Show when={state() !== ""}>
                    <Progress
                      value={stage()}
                      minValue={0}
                      maxValue={stages.length}
                      getValueLabel={({ value, max }) =>
                        `${max}개 중 ${value}개 작업 완료됨`
                      }
                      class="w-full space-y-1"
                    >
                      <div class="flex justify-between">
                        <ProgressLabel>{stateLabel()}</ProgressLabel>
                        <ProgressValueLabel />
                      </div>
                    </Progress>
                  </Show>
                </Flex>
              </CardContent>
            </Card>
          </Col>

          <Col>
            {/* 입력된 다운로드 링크들 */}
            <Card class="h-80">
              <CardHeader>
                <CardTitle>다운로드 대기열</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>다운로드 대기열</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>파일 주소</TableHead>
                      <TableHead>파일 이름</TableHead>
                      <TableHead class="min-w-30">진행도</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <For each={downloadQueue.getQueue()}>
                      {(item, index) => {
                        // NOTE: URL 길이가 threshold를 넘어가는 경우, 잘라서 출력
                        //       UI 깨짐, 스크롤 생김 방지 목적
                        const threshold = 50;
                        const _url =
                          item.url.length > threshold
                            ? `${item.url.slice(0, threshold)}...`
                            : item.url;

                        return (
                          <>
                            <TableRow>
                              <TableCell>{_url}</TableCell>
                              <TableCell>{item.filename}</TableCell>
                              <TableCell class="text-right">
                                {pipe(
                                  ratio()[index()],
                                  defaultTo(0),
                                  multiply(100),
                                  (val) => round(val, 2)
                                )}
                                %
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      }}
                    </For>
                  </TableBody>
                </Table>

                <div class="mt-2">
                  <Button
                    onClick={download}
                    disabled={
                      // 다운로드 시작 버튼 비활성화 조건:
                      // [1] 대기열이 비어있지 않을 것
                      downloadQueue.getQueue().length <= 0 ||
                      // [2] 다운로드 진행 중이 아닐 것
                      state() !== ""
                    }
                  >
                    파일 다운로드 시작
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Col>
        </Grid>
      </div>
    </>
  );
}
