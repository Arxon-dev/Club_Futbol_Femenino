package com.opomelilla.futbol.data.remote.model

data class ProductDto(
    val id: String,
    val name: String,
    val description: String?,
    val price: Double,
    val imageUrl: String?,
    val category: String,
    val sizes: List<String>?,
    val available: Boolean,
    val contactWhatsApp: String?,
    val createdAt: String?
)

data class CreateProductRequest(
    val name: String,
    val description: String?,
    val price: Double,
    val category: String,
    val available: Boolean = true,
    val imageUrl: String? = null,
    val sizes: List<String>? = null,
    val contactWhatsApp: String? = null
)
