package com.opomelilla.futbol.ui.president

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.PresidentLetterDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PresidentLetterViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<PresidentLetterUiState>(PresidentLetterUiState.Loading)
    val uiState: StateFlow<PresidentLetterUiState> = _uiState

    init {
        fetchLetter()
    }

    fun fetchLetter() {
        _uiState.value = PresidentLetterUiState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.getPresidentLetter()
                _uiState.value = PresidentLetterUiState.Success(response)
            } catch (e: Exception) {
                _uiState.value = PresidentLetterUiState.Error(e.message ?: "Error desconocido")
            }
        }
    }
}

sealed class PresidentLetterUiState {
    object Loading : PresidentLetterUiState()
    data class Success(val letter: PresidentLetterDto) : PresidentLetterUiState()
    data class Error(val message: String) : PresidentLetterUiState()
}
