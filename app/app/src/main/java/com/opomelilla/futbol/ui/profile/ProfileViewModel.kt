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
    data class Success(val profile: ProfileDto, val role: String) : ProfileUiState()
    data class Error(val message: String) : ProfileUiState()
}

sealed class PasswordChangeState {
    object Idle : PasswordChangeState()
    object Loading : PasswordChangeState()
    object Success : PasswordChangeState()
    data class Error(val message: String) : PasswordChangeState()
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState

    private val _passwordState = MutableStateFlow<PasswordChangeState>(PasswordChangeState.Idle)
    val passwordState: StateFlow<PasswordChangeState> = _passwordState

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
                _uiState.value = ProfileUiState.Success(response.profile ?: ProfileDto(), response.role)
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
                    val userProfile = response.body()
                    _uiState.value = ProfileUiState.Success(
                        userProfile?.profile ?: ProfileDto(),
                        userProfile?.role ?: "PLAYER"
                    )
                } else {
                    val errorBody = response.errorBody()?.string()
                    _uiState.value = ProfileUiState.Error("Error: $errorBody")
                }
            } catch (e: Exception) {
                _uiState.value = ProfileUiState.Error(e.message ?: "Failed to update profile")
            }
        }
    }
    fun changePassword(oldPass: String, newPass: String) {
        viewModelScope.launch {
            _passwordState.value = PasswordChangeState.Loading
            try {
                val response = apiService.changePassword(
                    com.opomelilla.futbol.data.remote.model.ChangePasswordRequest(
                        oldPassword = oldPass,
                        newPassword = newPass
                    )
                )
                if (response.isSuccessful) {
                    _passwordState.value = PasswordChangeState.Success
                } else {
                    val errorBody = response.errorBody()?.string()
                    _passwordState.value = PasswordChangeState.Error("Error: $errorBody")
                }
            } catch (e: Exception) {
                _passwordState.value = PasswordChangeState.Error(e.message ?: "Error al cambiar contraseña")
            }
        }
    }

    fun resetPasswordState() {
        _passwordState.value = PasswordChangeState.Idle
    }
}
