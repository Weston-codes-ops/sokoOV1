package com.westoncodeops.sokoonline.service.payment;

import com.westoncodeops.sokoonline.config.DarajaProperties;
import com.westoncodeops.sokoonline.exceptions.PaymentConfigurationException;
import com.westoncodeops.sokoonline.exceptions.PaymentGatewayException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DarajaClient {

    private static final DateTimeFormatter TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private final DarajaProperties properties;
    private final RestClient restClient;

    public DarajaClient(DarajaProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(20));
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
    }

    public void validateConfiguration() {
        if (!properties.isEnabled()) {
            throw new PaymentConfigurationException("M-Pesa checkout is currently disabled.");
        }
        if (isBlank(properties.getConsumerKey()) || isBlank(properties.getConsumerSecret())
                || isBlank(properties.getBusinessShortCode()) || isBlank(properties.getPasskey())
                || isBlank(properties.getCallbackUrl()) || isBlank(properties.getCallbackSecret())) {
            throw new PaymentConfigurationException(
                    "M-Pesa Sandbox is not fully configured. Set its server environment variables and restart the API.");
        }
        if (!properties.getBaseUrl().startsWith("https://")) {
            throw new PaymentConfigurationException("The Daraja API base URL must use HTTPS.");
        }
        if (!properties.getCallbackUrl().startsWith("https://")) {
            throw new PaymentConfigurationException("Daraja requires a public HTTPS callback URL.");
        }
        if (properties.getCallbackSecret().length() < 32
                || !properties.getCallbackSecret().matches("[A-Za-z0-9_-]+")) {
            throw new PaymentConfigurationException(
                    "The Daraja callback secret must be a URL-safe random value of at least 32 characters.");
        }
    }

    public boolean isValidCallbackSecret(String candidate) {
        String expected = properties.getCallbackSecret();
        return candidate != null && !expected.isBlank()
                && MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                candidate.getBytes(StandardCharsets.UTF_8));
    }

    public DarajaStkPushResult requestStkPush(String phoneNumber, BigDecimal amount, String orderReference) {
        try {
            String timestamp = ZonedDateTime.now(ZoneId.of("Africa/Nairobi")).format(TIMESTAMP_FORMAT);
            String password = Base64.getEncoder().encodeToString(
                    (properties.getBusinessShortCode() + properties.getPasskey() + timestamp)
                            .getBytes(StandardCharsets.UTF_8));
            String callbackUrl = properties.getCallbackUrl().replaceAll("/+$", "")
                    + "/" + properties.getCallbackSecret();

            Map<String, Object> request = new LinkedHashMap<>();
            request.put("BusinessShortCode", properties.getBusinessShortCode());
            request.put("Password", password);
            request.put("Timestamp", timestamp);
            request.put("TransactionType", "CustomerPayBillOnline");
            request.put("Amount", amount.intValueExact());
            request.put("PartyA", phoneNumber);
            request.put("PartyB", properties.getBusinessShortCode());
            request.put("PhoneNumber", phoneNumber);
            request.put("CallBackURL", callbackUrl);
            request.put("AccountReference", orderReference);
            request.put("TransactionDesc", "Soko order");

            JsonNode response = restClient.post()
                    .uri(properties.getBaseUrl().replaceAll("/+$", "") + "/mpesa/stkpush/v1/processrequest")
                    .headers(headers -> {
                        headers.setBearerAuth(fetchAccessToken());
                        headers.setContentType(MediaType.APPLICATION_JSON);
                    })
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !"0".equals(response.path("ResponseCode").asText())) {
                String detail = response == null ? null : response.path("ResponseDescription").asText(null);
                throw new PaymentGatewayException(
                        detail == null || detail.isBlank()
                                ? "Daraja did not accept the M-Pesa payment request."
                                : "Daraja could not start the M-Pesa payment: " + detail);
            }

            String merchantRequestId = response.path("MerchantRequestID").asText(null);
            String checkoutRequestId = response.path("CheckoutRequestID").asText(null);
            if (isBlank(merchantRequestId) || isBlank(checkoutRequestId)) {
                throw new PaymentGatewayException("Daraja returned an incomplete payment request response.");
            }

            return new DarajaStkPushResult(
                    merchantRequestId,
                    checkoutRequestId,
                    response.path("CustomerMessage").asText("Check your phone to complete the M-Pesa prompt."));
        } catch (PaymentGatewayException ex) {
            throw ex;
        } catch (RestClientException | ArithmeticException ex) {
            throw new PaymentGatewayException(
                    "Could not reach Daraja or start the M-Pesa payment. Please try again.", ex);
        }
    }

    private String fetchAccessToken() {
        String credentials = properties.getConsumerKey() + ":" + properties.getConsumerSecret();
        String basicAuth = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        try {
            JsonNode response = restClient.get()
                    .uri(properties.getBaseUrl().replaceAll("/+$", "")
                            + "/oauth/v1/generate?grant_type=client_credentials")
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + basicAuth)
                    .retrieve()
                    .body(JsonNode.class);
            String accessToken = response == null ? null : response.path("access_token").asText(null);
            if (isBlank(accessToken)) {
                throw new PaymentGatewayException("Daraja did not return an access token.");
            }
            return accessToken;
        } catch (PaymentGatewayException ex) {
            throw ex;
        } catch (RestClientException ex) {
            throw new PaymentGatewayException("Could not authenticate with Daraja. Check the Sandbox credentials.", ex);
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
