package com.opomelilla.futbol.ui.finances

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.data.local.TokenManager
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.TreasuryDataDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class TreasuryUiState {
    object Loading : TreasuryUiState()
    data class Success(val data: TreasuryDataDto) : TreasuryUiState()
    data class Error(val message: String) : TreasuryUiState()
}

@HiltViewModel
class TreasuryViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<TreasuryUiState>(TreasuryUiState.Loading)
    val uiState: StateFlow<TreasuryUiState> = _uiState.asStateFlow()

    init {
        loadFinances()
    }

    fun loadFinances() {
        viewModelScope.launch {
            _uiState.value = TreasuryUiState.Loading
            try {
                val userId = tokenManager.getUserId()
                if (userId != null) {
                    val data = apiService.getFinances(userId)
                    _uiState.value = TreasuryUiState.Success(data)
                } else {
                    _uiState.value = TreasuryUiState.Error("No se ha podido identificar al usuario.")
                }
            } catch (e: Exception) {
                e.printStackTrace()
                _uiState.value = TreasuryUiState.Error("Error de conexión al cargar la tesorería.")
            }
        }
    }
}
