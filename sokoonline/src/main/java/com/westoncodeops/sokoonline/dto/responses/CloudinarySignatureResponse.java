package com.westoncodeops.sokoonline.dto.responses;

public record CloudinarySignatureResponse(
        String cloudName,
        String apiKey,
        long timestamp,
        String signature,
        String folder,
        String transformation
) {
}
