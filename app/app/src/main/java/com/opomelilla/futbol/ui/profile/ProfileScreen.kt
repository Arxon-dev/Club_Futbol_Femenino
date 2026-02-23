package com.opomelilla.futbol.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.opomelilla.futbol.data.remote.model.ProfileDto
import java.text.SimpleDateFormat
import java.util.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var birthdate by remember { mutableStateOf("") }
    var clothingSize by remember { mutableStateOf("") }
    var dorsal by remember { mutableStateOf("") }
    var position by remember { mutableStateOf("") }
    var medicalInfo by remember { mutableStateOf("") }

    val dateFormatDisplay = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
    val dateFormatApi = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    var showDatePicker by remember { mutableStateOf(false) }
    val datePickerState = rememberDatePickerState()

    var expandedClothing by remember { mutableStateOf(false) }
    val clothingOptions = listOf("XS", "S", "M", "L", "XL", "XXL")

    var expandedPosition by remember { mutableStateOf(false) }
    val positionOptions = listOf("Portera", "Cierre", "Ala", "Pívot", "Universal")

    // When the state becomes Success and it's the first load, populate variables
    LaunchedEffect(uiState) {
        if (uiState is ProfileUiState.Success) {
            val profile = (uiState as ProfileUiState.Success).profile
            firstName = profile.firstName ?: ""
            lastName = profile.lastName ?: ""
            phone = profile.phone ?: ""
            
            // Format incoming date from YYYY-MM-DD to DD/MM/YYYY
            profile.birthdate?.let {
                try {
                    val date = dateFormatApi.parse(it)
                    if (date != null) {
                        birthdate = dateFormatDisplay.format(date)
                        datePickerState.selectedDateMillis = date.time
                    }
                } catch (e: Exception) {
                    birthdate = it
                }
            } ?: run { birthdate = "" }

            clothingSize = profile.clothingSize ?: ""
            dorsal = profile.dorsal?.toString() ?: ""
            position = profile.position ?: ""
            medicalInfo = profile.medicalInfo ?: ""
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mi Perfil") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            when (uiState) {
                is ProfileUiState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.fillMaxWidth().wrapContentWidth())
                }
                is ProfileUiState.Error -> {
                    Text("Error: ${(uiState as ProfileUiState.Error).message}", color = MaterialTheme.colorScheme.error)
                    Button(onClick = { viewModel.loadProfile() }) {
                        Text("Reintentar")
                    }
                }
                is ProfileUiState.Success -> {
                    OutlinedTextField(
                        value = firstName,
                        onValueChange = { firstName = it },
                        label = { Text("Nombre") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = lastName,
                        onValueChange = { lastName = it },
                        label = { Text("Apellidos") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Teléfono") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = birthdate,
                        onValueChange = {},
                        label = { Text("Fecha de Nacimiento (DD/MM/YYYY)") },
                        modifier = Modifier
                            .fillMaxWidth(),
                        readOnly = true,
                        trailingIcon = {
                            IconButton(onClick = { showDatePicker = true }) {
                                Icon(
                                    imageVector = androidx.compose.material.icons.Icons.Default.DateRange,
                                    contentDescription = "Seleccionar fecha"
                                )
                            }
                        }
                    )
                    
                    if (showDatePicker) {
                        DatePickerDialog(
                            onDismissRequest = { showDatePicker = false },
                            confirmButton = {
                                TextButton(onClick = {
                                    datePickerState.selectedDateMillis?.let { millis ->
                                        birthdate = dateFormatDisplay.format(Date(millis))
                                    }
                                    showDatePicker = false
                                }) {
                                    Text("OK")
                                }
                            },
                            dismissButton = {
                                TextButton(onClick = { showDatePicker = false }) {
                                    Text("Cancelar")
                                }
                            }
                        ) {
                            DatePicker(state = datePickerState)
                        }
                    }
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                        ExposedDropdownMenuBox(
                            expanded = expandedClothing,
                            onExpandedChange = { expandedClothing = !expandedClothing },
                            modifier = Modifier.weight(1f)
                        ) {
                            OutlinedTextField(
                                value = clothingSize,
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Talla") },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedClothing) },
                                colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
                                modifier = Modifier.menuAnchor()
                            )
                            ExposedDropdownMenu(
                                expanded = expandedClothing,
                                onDismissRequest = { expandedClothing = false }
                            ) {
                                clothingOptions.forEach { selectionOption ->
                                    DropdownMenuItem(
                                        text = { Text(selectionOption) },
                                        onClick = {
                                            clothingSize = selectionOption
                                            expandedClothing = false
                                        }
                                    )
                                }
                            }
                        }
                        
                        OutlinedTextField(
                            value = dorsal,
                            onValueChange = { dorsal = it },
                            label = { Text("Dorsal") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    ExposedDropdownMenuBox(
                        expanded = expandedPosition,
                        onExpandedChange = { expandedPosition = !expandedPosition },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedTextField(
                            value = position,
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Posición en pista") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedPosition) },
                            colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
                            modifier = Modifier.menuAnchor().fillMaxWidth()
                        )
                        ExposedDropdownMenu(
                            expanded = expandedPosition,
                            onDismissRequest = { expandedPosition = false }
                        ) {
                            positionOptions.forEach { selectionOption ->
                                DropdownMenuItem(
                                    text = { Text(selectionOption) },
                                    onClick = {
                                        position = selectionOption
                                        expandedPosition = false
                                    }
                                )
                            }
                        }
                    }
                    
                    OutlinedTextField(
                        value = medicalInfo,
                        onValueChange = { medicalInfo = it },
                        label = { Text("Información Médica / Alergias") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )

                    Button(
                        onClick = {
                            // Convert Display format back to API format
                            var finalBirthdate = birthdate
                            if (birthdate.isNotBlank()) {
                                try {
                                    val date = dateFormatDisplay.parse(birthdate)
                                    if (date != null) {
                                        finalBirthdate = dateFormatApi.format(date)
                                    }
                                } catch (e: Exception) {
                                    // Keep as is if parsing fails
                                }
                            }

                            val profile = ProfileDto(
                                firstName = firstName.takeIf { it.isNotBlank() },
                                lastName = lastName.takeIf { it.isNotBlank() },
                                phone = phone.takeIf { it.isNotBlank() },
                                birthdate = finalBirthdate.takeIf { it.isNotBlank() },
                                clothingSize = clothingSize.takeIf { it.isNotBlank() },
                                dorsal = dorsal.toIntOrNull(),
                                position = position.takeIf { it.isNotBlank() },
                                medicalInfo = medicalInfo.takeIf { it.isNotBlank() }
                            )
                            viewModel.updateProfile(profile)
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Guardar Cambios")
                    }
                }
            }
        }
    }
}
