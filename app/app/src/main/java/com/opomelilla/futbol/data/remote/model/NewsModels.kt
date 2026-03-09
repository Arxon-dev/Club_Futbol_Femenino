package com.opomelilla.futbol.data.remote.model

data class NewsDto(
    val id: Int,
    val title: String,
    val content: String,
    val imageUrl: String?,
    val category: String,
    val author: String?,
    val published: Boolean,
    val createdAt: String
)

data class CreateNewsRequest(
    val title: String,
    val content: String,
    val category: String,
    val imageUrl: String? = null,
    val author: String? = null,
    val published: Boolean = true
)
