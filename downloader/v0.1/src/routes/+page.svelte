<script lang="ts">
  import formatURL from "../lib/urlfmt";
  import createFetchInstance from "../lib/download_handeler";
  import {
    Stack,
    Grid,
    Container,
    createStyles,
    TextInput,
    Button,
    Notification,
    Paper,
    ActionIcon,
  } from "@svelteuidev/core";
  import { useId } from "@svelteuidev/composables";
  import { Link1, IdCard, Cross2, Trash, Download } from "radix-icons-svelte";

  const useTextCenter = createStyles(() => {
    return {
      root: {
        textAlign: "center",
      },
    };
  });

  interface URLProfile {
    url: string;
    filename: string;
  }

  interface ErrorStore {
    id: PropertyKey;
    obj: Error;
  }

  let URLProfiles: URLProfile[] = [];
  let ErrorList: ErrorStore[] = [];
  let download_url: string = "";
  let filename: string = "";

  const addURL = () => {
    const formatted_download_url = formatURL(download_url);
    if (formatted_download_url instanceof Error) return formatted_download_url;
    if (URLProfiles.some((profile) => profile.url === download_url))
      return new Error(`이미 리스트에 추가된 리소스입니다.`);

    URLProfiles = [...URLProfiles, { url: formatted_download_url, filename }];
    download_url = "";
    filename = "";
  };

  const removeURL = (url: string) =>
    (URLProfiles = URLProfiles.filter((profile) => profile.url !== url));

  const addErrorNotification = (err: Error) => {
    const uuid = useId();
    const newErrorProfile: ErrorStore = {
      id: uuid,
      obj: err,
    };
    const addError = () => (ErrorList = [...ErrorList, newErrorProfile]);
    const removeError = () =>
      (ErrorList = ErrorList.filter((error) => error.id == uuid));

    addError();
    setTimeout(removeError, 2000);
  };

  $: ({ getStyles: textCenter } = useTextCenter());
</script>

<Container>
  <Stack>
    <header>
      <h2 class={textCenter()}>강의 다운로더</h2>
      <h4 class={textCenter()}>EClass 호환 강의 다운로더 (for DSU)</h4>
    </header>
    <Grid>
      <!-- 강의 URL 입력창 -->
      <Grid.Col lg={6} md={12} class={textCenter()}>
        <Paper withBorder radius="lg">
          <Stack>
            <span>강의 URL 입력</span>
            <form
              on:submit|preventDefault|stopPropagation={(e) => {
                const response = addURL();
                if (response instanceof Error) {
                  return addErrorNotification(response);
                }
              }}
            >
              <Grid>
                <Grid.Col span={8}>
                  <TextInput
                    icon={Link1}
                    placeholder="URL"
                    bind:value={download_url}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <TextInput
                    icon={IdCard}
                    placeholder="이름"
                    bind:value={filename}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Button
                    color={"#01c38d"}
                    ripple
                    override={{ width: "100%" }}
                    type="submit">추가하기</Button
                  >
                </Grid.Col>
              </Grid>
            </form>
          </Stack>
        </Paper>
      </Grid.Col>

      <!-- 강의 URL 목록 -->
      <Grid.Col lg={6} md={12} class={textCenter()}>
        <Paper withBorder radius="lg">
          <Stack>
            <span>강의 URL 목록</span>
            {#if URLProfiles.length > 0}
              <Grid>
                {#each URLProfiles as profile, index}
                  <Grid.Col span={1}>{index + 1}</Grid.Col>
                  <Grid.Col span={6}>
                    {profile.url}
                  </Grid.Col>
                  <Grid.Col span={3}>{profile.filename}</Grid.Col>
                  <Grid.Col span={1}>
                    <ActionIcon
                      on:click={() => {
                        // TODO : 다운로드 로직 추가
                      }}
                    >
                      <Download />
                    </ActionIcon>
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <ActionIcon
                      on:click={() => {
                        removeURL(profile.url);
                      }}
                    >
                      <Trash />
                    </ActionIcon>
                  </Grid.Col>
                {/each}
              </Grid>
            {/if}
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  </Stack>
</Container>

<Grid
  override={{
    position: "absolute",
    bottom: 0,
    right: 0,
    width: "100%",
    marginBottom: "$1",
    marginRight: "$1",
  }}
>
  {#each ErrorList as error}
    <Grid.Col lg={9} md={6} />
    <Grid.Col lg={3} md={6}>
      <Notification icon={Cross2} color="red">
        {error.obj.message}
      </Notification>
    </Grid.Col>
  {/each}
</Grid>
