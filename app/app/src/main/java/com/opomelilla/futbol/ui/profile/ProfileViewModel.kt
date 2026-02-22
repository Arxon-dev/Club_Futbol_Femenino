package com.opomelilla.futbol.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.data.local.TokenManager
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.ProfileDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class ProfileUiState {
    object Loading : ProfileUiState()
    data class Success(val profile: ProfileDto) : ProfileUiState()
    data class Error(val message: String) : ProfileUiState()
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            try {
                val userId = tokenManager.getUserId()
                if (userId == null) {
                    _uiState.value = ProfileUiState.Error("No se encontró el ID del usuario")
                    return@launch
                }
                val response = apiService.getProfile(userId)
                // If profile is null, return an empty one
                _uiState.value = ProfileUiState.Success(response.profile ?: ProfileDto())
            } catch (e: Exception) {
                _uiState.value = ProfileUiState.Error(e.message ?: "Failed to load profile")
            }
        }
    }

    fun updateProfile(profile: ProfileDto) {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            try {
                val userId = tokenManager.getUserId()
                if (userId == null) {
                    _uiState.value = ProfileUiState.Error("No se encontró el ID del usuario")
                    return@launch
                }
                
                val response = apiService.updateProfile(userId, profile)
                if (response.isSuccessful) {
                    _uiState.value = ProfileUiState.Success(response.body()?.profile ?: ProfileDto())
                } else {
                    val errorBody = response.errorBody()?.string()
                    _uiState.value = ProfileUiState.Error("Error: $errorBody")
                }
            } catch (e: Exception) {
                _uiState.value = ProfileUiState.Error(e.message ?: "Failed to update profile")
            }
        }
    }
}
