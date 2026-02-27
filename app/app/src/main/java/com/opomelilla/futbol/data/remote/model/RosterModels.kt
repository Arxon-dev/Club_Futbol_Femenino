package com.opomelilla.futbol.data.remote.model

data class RosterProfileDto(
    val firstName: String?,
    val lastName: String?,
    val dorsal: Int?,
    val position: String?,
    val photoUrl: String?
)

data class RosterMemberDto(
    val id: String,
    val email: String,
    val role: String,
    val profile: RosterProfileDto?
)
