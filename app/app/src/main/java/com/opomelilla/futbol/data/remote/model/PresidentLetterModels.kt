package com.opomelilla.futbol.data.remote.model

import com.google.gson.annotations.SerializedName

data class PresidentLetterDto(
    @SerializedName("id") val id: Int,
    @SerializedName("title") val title: String,
    @SerializedName("content") val content: String,
    @SerializedName("updatedAt") val updatedAt: String?
)
