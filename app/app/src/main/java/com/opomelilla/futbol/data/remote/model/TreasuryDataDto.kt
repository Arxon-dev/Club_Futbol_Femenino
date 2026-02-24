package com.opomelilla.futbol.data.remote.model

data class TreasuryDataDto(
    val transactions: List<TransactionDto>,
    val summary: FinancialSummaryDto
)
