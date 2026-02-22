package com.opomelilla.futbol.data.remote.model

data class ProfileDto(
    val firstName: String? = null,
    val lastName: String? = null,
    val phone: String? = null,
    val birthdate: String? = null,
    val clothingSize: String? = null,
    val medicalInfo: String? = null,
    val dorsal: Int? = null,
    val position: String? = null
)

data class UserProfileDto(
    val id: String,
    val email: String,
    val role: String,
    val profile: ProfileDto? = null
)
