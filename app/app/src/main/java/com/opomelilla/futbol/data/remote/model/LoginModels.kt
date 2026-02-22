package com.opomelilla.futbol.data.remote.model

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val message: String,
    val token: String,
    val user: UserDto
)

data class UserDto(
    val id: String,
    val email: String,
    val role: String
)

data class FcmTokenRequest(
    @com.google.gson.annotations.SerializedName("fcmToken")
    val token: String
)
