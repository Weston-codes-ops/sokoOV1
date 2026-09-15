package com.westoncodeops.sokoonline.controllers;

import com.westoncodeops.sokoonline.dto.responses.CloudinarySignatureResponse;
import com.westoncodeops.sokoonline.service.CloudinarySignatureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/media")
@RequiredArgsConstructor
public class AdminMediaController {
    private final CloudinarySignatureService cloudinarySignatureService;

    @Operation(summary = "Create a signed Cloudinary image upload", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/cloudinary/signature")
    public ResponseEntity<CloudinarySignatureResponse> createCloudinarySignature() {
        return ResponseEntity.ok(cloudinarySignatureService.createUploadSignature());
    }
}
