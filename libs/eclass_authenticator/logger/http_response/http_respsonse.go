package http_response

import (
	"fmt"
	"log"

	"github.com/go-resty/resty/v2"
)

func PrintResponseInfo(resp *resty.Response, include_body bool, err error) {
	log.Println("Response Info:")
	log.Println("  Error      :", err)
	log.Println("  Status Code:", resp.StatusCode())
	log.Println("  Status     :", resp.Status())
	log.Println("  Proto      :", resp.Proto())
	log.Println("  Time       :", resp.Time())
	log.Println("  Received At:", resp.ReceivedAt())
	log.Println("  Cookie     :")
	for _, cookie := range resp.Cookies() {
		fmt.Printf("- %s: %s\n", cookie.Name, cookie.Value)
	}
	if include_body {
		log.Println("  Body       :\n", resp)
	}

	log.Println("Request Trace Info:")
	ti := resp.Request.TraceInfo()
	log.Println("  DNSLookup     :", ti.DNSLookup)
	log.Println("  ConnTime      :", ti.ConnTime)
	log.Println("  TCPConnTime   :", ti.TCPConnTime)
	log.Println("  TLSHandshake  :", ti.TLSHandshake)
	log.Println("  ServerTime    :", ti.ServerTime)
	log.Println("  ResponseTime  :", ti.ResponseTime)
	log.Println("  TotalTime     :", ti.TotalTime)
	log.Println("  IsConnReused  :", ti.IsConnReused)
	log.Println("  IsConnWasIdle :", ti.IsConnWasIdle)
	log.Println("  ConnIdleTime  :", ti.ConnIdleTime)
	log.Println("  RequestAttempt:", ti.RequestAttempt)
	log.Println("  RemoteAddr    :", ti.RemoteAddr.String())
}

func init() {

}
