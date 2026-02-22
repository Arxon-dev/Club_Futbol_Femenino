package com.opomelilla.futbol.ui.events

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.EventDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class EventsUiState {
    object Loading : EventsUiState()
    data class Success(val events: List<EventDto>) : EventsUiState()
    data class Error(val message: String) : EventsUiState()
}

@HiltViewModel
class EventsViewModel @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: com.opomelilla.futbol.data.local.TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow<EventsUiState>(EventsUiState.Loading)
    val uiState: StateFlow<EventsUiState> = _uiState

    val userRole = tokenManager.getRole() ?: "PLAYER"

    init {
        fetchEvents()
    }

    fun fetchEvents() {
        viewModelScope.launch {
            _uiState.value = EventsUiState.Loading
            try {
                val response = apiService.getEvents()
                _uiState.value = EventsUiState.Success(response.events)
            } catch (e: Exception) {
                _uiState.value = EventsUiState.Error(e.message ?: "Failed to load events")
            }
        }
    }

    fun setAttendance(eventId: String, status: String, reason: String? = null) {
        viewModelScope.launch {
            try {
                val request = com.opomelilla.futbol.data.remote.model.SetAttendanceRequest(
                    status = status,
                    reason = reason
                )
                val response = apiService.setAttendance(eventId, request)
                if (response.isSuccessful) {
                    // Refetch events to reflect changes (or handle optimistic updates)
                    fetchEvents()
                } else {
                    // Handle failure if needed, for now just log or ignore
                    val errorBody = response.errorBody()?.string()
                    println("Error setting attendance: $errorBody")
                }
            } catch (e: Exception) {
                println("Exception setting attendance: ${e.message}")
            }
        }
    }
}
