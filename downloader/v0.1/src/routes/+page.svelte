<script lang="ts">
  // import formatURL from "urlfmt";
  // import createFetchInstance from "download_handler";
  import {
    Stack,
    Grid,
    Container,
    createStyles,
    TextInput,
    Button,
    Paper,
  } from "@svelteuidev/core";
  import { Link1, IdCard } from "radix-icons-svelte";

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

  let URLProfiles: URLProfile[] = [];
  let download_url: string = "";
  let filename: string = "";

  const addURL = () => URLProfiles.push({ url: download_url, filename });

  $: console.log(URLProfiles);

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
                addURL();
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
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  </Stack>
</Container>
