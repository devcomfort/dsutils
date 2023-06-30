package main

import (
	"bytes"
	logger "eclass_authenticator/logger/http_response"
	"eclass_authenticator/totp_generator"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/go-resty/resty/v2"
	"github.com/joho/godotenv"
)

type LoginInfo struct {
	id, password string
}

type WebClient struct {
	client *resty.Client

	// 로그 정보 핸들링
	log_mode bool

	// 로그인 요청 중 사용되는 정보 필드
	login_token       string
	redirection_url   string
	redirection_token string
	jwt_code          string

	err error
}

// 새로운 클라이언트 만드는 함수
// - 5번의 재시도 (오류 발생 시)
// - 디버그 모드에 따른 추적 허용 (디버그 모드 비활성 시, 추적 비활성)
func NewClient(debug_mode bool) WebClient {
	// 최대 시행 횟수
	var MAX_RETRY_COUNT int = 5

	client := func() *resty.Client {
		if debug_mode {
			return resty.New().EnableTrace().SetRetryCount(MAX_RETRY_COUNT)
		}
		return resty.New().SetRetryCount(MAX_RETRY_COUNT)
	}()
	return WebClient{
		client:          client,
		log_mode:        debug_mode,
		login_token:     "",
		redirection_url: "",
		err:             nil,
	}
}

func (client *WebClient) SetLogMode(mode bool) *WebClient {
	client.log_mode = mode
	return client
}

func (client *WebClient) GetLogMode() bool {
	return client.log_mode
}

func (client *WebClient) CreateLog(str string) {
	if client.GetLogMode() {
		log.Println(str)
	}
}

func (client *WebClient) PrintResponseInfo(resp *resty.Response, include_body bool, err error) {
	if client.GetLogMode() {
		logger.PrintResponseInfo(resp, include_body, err)
	}
}

func (client *WebClient) SetHeaders(headers map[string]string) *WebClient {
	if client.err != nil {
		return client
	}

	client.client = client.client.SetHeaders(headers)

	client.CreateLog("헤더 정보 재설정됨.")

	return client
}

/*
CSRF 토큰 정보를 가져오는 함수

서버에서 토큰 정보를 통해 로그인 세션 정보를 추적함.
*/
func (client *WebClient) GetLoginToken() *WebClient {
	if client.err != nil {
		return client
	}

	resp, err := client.client.R().Get("https://eclass1.dongseo.ac.kr/")

	if err != nil {
		client.err = fmt.Errorf("로그인 토큰 요청 실패: %s", err.Error())
		client.CreateLog(client.err.Error())
		return client
	}

	client.login_token = resp.Cookies()[2].Value

	client.CreateLog(fmt.Sprintf("로그인 토큰 탈취 완료: %s\n", client.login_token))

	return client
}

func (client *WebClient) Login(L LoginInfo) *WebClient {
	if client.err != nil {
		return client
	}

	if len(client.login_token) <= 0 {
		client.err = errors.New("로그인 토큰이 존재하지 않습니다")
		client.CreateLog(client.err.Error())
		return client
	}

	// NOTE: 이 요청에서 방문 기록용 콜백 요청도 한번에 이루어짐
	resp, err := client.client.R().SetHeaders(map[string]string{
		"Content-Type": "application/x-www-form-urlencoded",
		// "Referer":      fmt.Sprintf("https://canvas.dongseo.ac.kr/learningx/google2fa/callback?result=%s&from=cc", client.redirection_token),
	}).SetFormData(map[string]string{
		"login_user_id":       L.id,
		"login_user_password": L.password,
		"csrf_token":          client.login_token,
		"login_mode":          "idpw",
	}).SetQueryParams(map[string]string{
		"from":       "web_redirect",
		"login_type": "standalone",
		"return_url": "https://eclass1.dongseo.ac.kr/login/callback",
	}).Post("https://eclass1.dongseo.ac.kr/xn-sso/gw-cb.php")

	// PANIC: 로그인 요청 중 오류 발생 시 오류 반환
	if err != nil {
		client.err = fmt.Errorf("로그인 요청 중 오류 발생: %s", err.Error())
		client.CreateLog(client.err.Error())
		return client
	}

	client.CreateLog("로그인 요청 성공.")

	// NOTE: 로그인 응답 해석 시도
	html, err := goquery.NewDocumentFromReader(bytes.NewReader(resp.Body()))

	client.CreateLog("로그인 요청에 대한 응답 해석 완료.")

	// PANIC: 로그인 응답 해석 중 오류 발생 시 오류 반환
	if err != nil {
		client.err = fmt.Errorf("로그인 요청에 대한 응답 해석 중 오류 발생: %s", err.Error())
		client.CreateLog(client.err.Error())
		return client
	}

	// NOTE: 로그인 응답에서 리디렉션 URL 추출 시도
	script_text := html.Find("script").Text()

	// NOTE: 응답 내에서 script 엘리먼트 내의 리디렉션 URL을 '큰 따움표가 붙은 상태'로 추출한 후 큰 따움표를 분리합니다.
	// '큰 따움표가 붙은 상태의 URL'을 추출하는 이유"
	// let url = "<URL>"; 유형의 변수 선언 내에 리디렉션 URL이 포함되어 있어, 안정적으로 리디렉션 URL을 추출하기 위해 큰 따움표를 기준으로 분리하였습니다.
	pattern, err := regexp.Compile("\"(https://).*\"")
	redirection_url := strings.Trim(pattern.FindString(script_text), "\"")

	if err != nil {
		client.err = fmt.Errorf("리디렉션 URL 패턴 정의 중 오류 발생: %s", err)
		client.CreateLog(client.err.Error())
		return client
	}

	// PANIC: 응답 해석 후, 응답 내에서 리디렉션 URL을 추출할 수 없다면 오류 반환
	if len(redirection_url) <= 0 {
		client.err = errors.New("리디렉션 URL 탐색 중 오류 발생 (스크립트 엘리먼트 내에서 리디렉션 URL을 찾을 수 없음)")
		client.CreateLog(client.err.Error())
		return client
	}

	client.CreateLog(fmt.Sprintf("로그인 응답에서 스크립트 콘텐츠, 리디렉션 URL 추출 완료: %s", redirection_url))

	redirection_token_pattern, err := regexp.Compile("(result=).*?(&amp;)")

	if err != nil {
		client.err = fmt.Errorf("리디렉션 URL 토큰 추출용 패턴 정의 오류: %s", err.Error())
		client.CreateLog(client.err.Error())
		return client
	}

	redirection_token := strings.TrimLeft(strings.TrimRight(redirection_token_pattern.FindString(redirection_url), "&amp;"), "result=")

	if len(redirection_token) <= 0 {
		client.err = errors.New("리디렉션 URL 토큰 추출에 실패하였습니다")
		client.CreateLog(client.err.Error())
		return client
	}

	client.CreateLog(fmt.Sprintf("리디렉션 URL 토큰 추출 완료: %s", redirection_token))

	client.redirection_token = redirection_token

	client.redirection_url = redirection_url

	return client
}

func (client *WebClient) Postlogin() *WebClient {
	if client.err != nil {
		return client
	}

	var (
		requestGroup sync.WaitGroup
		_errors      []error = []error{}
	)

	requestGroup.Add(2)

	// Eclass 요청
	go func() {
		resp, err := client.client.R().SetQueryParams(map[string]string{
			"result": client.redirection_token,
		}).Get("https://eclass1.dongseo.ac.kr/login/callback")

		defer requestGroup.Done()

		if err != nil {
			_error := fmt.Errorf("post login process 도중 오류가 발생하였습니다: %s", err.Error())
			_errors = append(_errors, _error)
			client.CreateLog(_error.Error())
			return
		}

		client.PrintResponseInfo(resp, true, err)
	}()

	// canvas 요청
	go func() {
		resp, err := client.client.R().SetQueryParams(map[string]string{
			"result": client.redirection_token,
		}).Get("https://canvas.dongseo.ac.kr/learningx/google2fa/callback")

		defer requestGroup.Done()

		if err != nil {
			_error := fmt.Errorf("post login process 도중 오류가 발생하였습니다: %s", err.Error())
			_errors = append(_errors, _error)
			client.CreateLog(_error.Error())
			return
		}

		client.PrintResponseInfo(resp, true, err)
	}()

	requestGroup.Wait()

	if len(_errors) >= 1 {
		var _error_msg []string = []string{}
		for _, v := range _errors {
			_error_msg = append(_error_msg, v.Error())
		}
		client.err = errors.New(strings.Join(_error_msg, "\n"))
		return client
	}

	return client
}

func main() {
	log.Println("프로그램 시작됨")

	err := godotenv.Load("../../.env")
	if err != nil {
		log.Fatalln("환경 변수 파일 로드 실패")
	}

	secret := os.Getenv("TEST_OTP_SECRET")
	id := os.Getenv("TEST_ECLASS_ID")
	password := os.Getenv("TEST_ECLASS_PASSWORD")

	start_time := time.Now()

	passcode, _ := totp_generator.CreateTOTP(secret)

	fmt.Printf("OPT CODE: %s\n", passcode)
	log.Printf("OTP 생성 완료: %s\n", time.Since(start_time))

	client := NewClient(true)
	jar, _ := cookiejar.New(nil)
	client.client.SetCookieJar(jar)

	log.Println("REST 클라이언트 설정 완료.")

	client.SetHeaders(map[string]string{
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
	}).SetLogMode(true).GetLoginToken().Login(LoginInfo{
		id:       id,
		password: password,
	})

	var cookies []*http.Cookie

	dongseoUniv, _ := url.Parse("https://eclass1.dongseo.ac.kr/")
	canvasPage, _ := url.Parse("https://canvas.dongseo.ac.kr/")

	cookies = jar.Cookies(dongseoUniv)

	fmt.Printf("On %s\n", dongseoUniv.String())
	for i, v := range cookies {
		fmt.Printf("%3d. %s\n", i, v)
	}

	cookies = jar.Cookies(canvasPage)

	fmt.Printf("On %s:\n", canvasPage.String())
	for i, v := range cookies {
		fmt.Printf("%3d. %s\n", i, v)
	}

	// var (
	// 	resp *resty.Response
	// 	err  error
	// )

	// resp, err = client.client.R().Get(fmt.Sprintf("https://eclass1.dongseo.ac.kr/google2fa/login/callback?result=%s", client.redirection_token))

	// resp, err = client.client.R().SetHeaders(map[string]string{
	// 	"Referer": fmt.Sprintf("https://canvas.dongseo.ac.kr/learningx/login/from_cc?result=%s", client.redirection_token),
	// }).Get("https://eclass1.dongseo.ac.kr/mypage")

	// printResponseInfo(resp, true, err)

	if client.err != nil {
		log.Fatalln(client.err.Error())
	}
}
