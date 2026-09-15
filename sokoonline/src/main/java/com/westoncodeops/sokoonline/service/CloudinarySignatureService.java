package com.westoncodeops.sokoonline.service;

import com.westoncodeops.sokoonline.dto.responses.CloudinarySignatureResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;

@Service
public class CloudinarySignatureService {
    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${cloudinary.folder:products}")
    private String folder;

    private static final String IMAGE_TRANSFORMATION = "c_fill,w_1200,h_1200";

    public CloudinarySignatureResponse createUploadSignature() {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new IllegalStateException("Cloudinary upload is not configured");
        }

        long timestamp = Instant.now().getEpochSecond();
        String payload = "folder=" + folder
            + "&timestamp=" + timestamp
            + "&transformation=" + IMAGE_TRANSFORMATION;
        String signature = sign(payload);
        return new CloudinarySignatureResponse(cloudName, apiKey, timestamp, signature, folder, IMAGE_TRANSFORMATION);
    }

    private String sign(String payload) {
        try {
            // Cloudinary signs the canonical parameter string followed by the API secret.
            MessageDigest digestAlgorithm = MessageDigest.getInstance("SHA-1");
            byte[] digest = digestAlgorithm.digest((payload + apiSecret).getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                hex.append(String.format("%02x", value & 0xff));
            }
            return hex.toString();
        } catch (Exception exception) {
            throw new IllegalStateException("Could not create Cloudinary upload signature", exception);
        }
    }
}
