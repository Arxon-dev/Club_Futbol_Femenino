package com.opomelilla.futbol.ui.events

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.opomelilla.futbol.data.remote.ApiService
import com.opomelilla.futbol.data.remote.model.AttendanceRecord
import com.opomelilla.futbol.data.remote.model.AttendanceUpdateItem
import com.opomelilla.futbol.data.remote.model.BulkAttendanceRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AttendanceUiState {
    object Loading : AttendanceUiState()
    data class Success(val attendances: List<AttendanceRecord>, val eventTitle: String = "Evento") : AttendanceUiState()
    data class Error(val message: String) : AttendanceUiState()
}

@HiltViewModel
class AttendanceViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow<AttendanceUiState>(AttendanceUiState.Loading)
    val uiState: StateFlow<AttendanceUiState> = _uiState

    // Keep track of modified attendances in a map to easily update them before bulk saving
    private val _currentAttendances = MutableStateFlow<Map<String, Boolean>>(emptyMap())
    val currentAttendances: StateFlow<Map<String, Boolean>> = _currentAttendances

    fun loadAttendance(eventId: String) {
        viewModelScope.launch {
            _uiState.value = AttendanceUiState.Loading
            try {
                val response = apiService.getEventAttendance(eventId)
                // Initialize the map with remote 'attended' values
                val initialMap = response.attendances.associate { it.user.id to it.attended }
                _currentAttendances.value = initialMap
                
                _uiState.value = AttendanceUiState.Success(response.attendances)
            } catch (e: Exception) {
                _uiState.value = AttendanceUiState.Error(e.message ?: "Failed to load attendance")
            }
        }
    }

    fun toggleAttendance(userId: String) {
        val currentMap = _currentAttendances.value.toMutableMap()
        val currentValue = currentMap[userId] ?: false
        currentMap[userId] = !currentValue
        _currentAttendances.value = currentMap
    }

    fun submitAttendance(eventId: String, onComplete: () -> Unit) {
        val currentState = _uiState.value
        if (currentState !is AttendanceUiState.Success) return

        val attendeesList = currentState.attendances.map { record ->
            AttendanceUpdateItem(
                userId = record.user.id,
                attended = _currentAttendances.value[record.user.id] ?: record.attended
            )
        }

        viewModelScope.launch {
            try {
                val request = BulkAttendanceRequest(attendances = attendeesList)
                val response = apiService.bulkUpdateAttendance(eventId, request)
                if (response.isSuccessful) {
                    onComplete()
                } else {
                    _uiState.value = AttendanceUiState.Error("Error updating attendances: ${response.code()}")
                }
            } catch (e: Exception) {
                _uiState.value = AttendanceUiState.Error(e.message ?: "Error updating attendances")
            }
        }
    }
}
