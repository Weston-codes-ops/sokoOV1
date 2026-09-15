package com.westoncodeops.sokoonline.dto.responses;

import java.util.UUID;

public record CategoryResponse(UUID id, String name, UUID parentId) {
}
