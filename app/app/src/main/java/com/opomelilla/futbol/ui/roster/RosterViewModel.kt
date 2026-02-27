package com.opomelilla.futbol.ui.roster

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.data.local.TokenManager
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.RosterMemberDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RosterViewModel @Inject constructor(
    private val tokenManager: TokenManager,
    private val apiService: ApiService
) : ViewModel() {

    private val _roster = MutableStateFlow<List<RosterMemberDto>>(emptyList())
    val roster: StateFlow<List<RosterMemberDto>> = _roster.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        fetchRoster()
    }

    fun fetchRoster() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val response = apiService.getRoster()
                _roster.value = response
            } catch (e: Exception) {
                _error.value = "Error al cargar plantilla: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
