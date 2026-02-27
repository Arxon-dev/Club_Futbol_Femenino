package com.opomelilla.futbol.data.remote.model

data class ChatProfileDto(
    val firstName: String?,
    val lastName: String?
)

data class ChatUserDto(
    val id: String,
    val role: String,
    val profile: ChatProfileDto?
)

data class ChatMessageDto(
    val id: String,
    val userId: String,
    val content: String,
    val createdAt: String,
    val user: ChatUserDto?
)

data class SendMessageRequest(
    val content: String
)
