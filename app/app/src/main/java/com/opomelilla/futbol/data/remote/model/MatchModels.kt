package com.opomelilla.futbol.data.remote.model

data class MatchDto(
    val id: Int,
    val date: String,
    val opponentName: String,
    val opponentLogoUrl: String?,
    val location: String,
    val result: String?,
    val competition: String
)
