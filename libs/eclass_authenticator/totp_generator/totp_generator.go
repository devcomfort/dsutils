package totp_generator

import (
	"errors"
	"fmt"
	"time"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

// NOTE: 사용자로부터 입력된 secret 키에 따라 TOTP 키를 생성하는 함수
// - 벤치마킹 결과 (연속된 시행, 출력 제거): 연속으로 10,000번 시행 후 시행 당 소요 시간 측정, 결과: 1.857µs
// - 벤치마킹 결과 (단일 시행): 0s (측정 불가)
func CreateTOTP(secret string) (string, error) {
	otpcode, err := totp.GenerateCodeCustom(secret, time.Now(), totp.ValidateOpts{
		Digits:    6,
		Algorithm: otp.AlgorithmSHA1,
	})

	if err != nil {
		return "", errors.New(fmt.Sprintf("OTP 코드 생성 중 오류 발생: %s", err.Error()))
	}

	return otpcode, err
}

func init() {

}
