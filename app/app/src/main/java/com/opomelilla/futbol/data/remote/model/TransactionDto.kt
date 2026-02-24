package com.opomelilla.futbol.data.remote.model

data class TransactionDto(
    val id: String,
    val type: String, // "INCOME" or "EXPENSE"
    val category: String,
    val amount: String,
    val description: String,
    val date: String,
    val userId: String?
)
