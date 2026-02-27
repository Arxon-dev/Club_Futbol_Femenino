package com.opomelilla.futbol

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.opomelilla.futbol.ui.login.LoginScreen
import com.opomelilla.futbol.ui.theme.Club_Futbol_SalaTheme
import dagger.hilt.android.AndroidEntryPoint
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import android.os.Build
import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavController
import androidx.core.content.ContextCompat
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.sp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.runtime.getValue
import androidx.navigation.compose.currentBackStackEntryAsState

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @javax.inject.Inject
    lateinit var tokenManager: com.opomelilla.futbol.data.local.TokenManager

    // Store pending navigation from push notification
    private var pendingNavigateTo: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check for intent extras from FCMService
        handleIntent(intent)

        enableEdgeToEdge()
        setContent {
            Club_Futbol_SalaTheme {
                // Android 13+ Notification Permission
                val permissionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission(),
                    onResult = { isGranted ->
                        if (!isGranted) {
                            Toast.makeText(this@MainActivity, "Las notificaciones están desactivadas. No recibirás avisos del club.", Toast.LENGTH_LONG).show()
                        }
                    }
                )

                LaunchedEffect(Unit) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                            permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                        }
                    }
                }

                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                // If app was already open and we get a new intent, handle navigation directly
                LaunchedEffect(pendingNavigateTo) {
                    if (currentRoute != "login" && currentRoute != null) {
                        val role = tokenManager.getRole()
                        navigateFromIntent(navController, role)
                    }
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        if (currentRoute in listOf(
                                "match_hub", "chat_screen", "roster_screen", "profile",
                                "more_screen", "treasury", "president_letter", "news_feed", "social_hub", "merchandising"
                            )) {
                            NavigationBar {
                                NavigationBarItem(
                                    icon = { Icon(Icons.Filled.DateRange, contentDescription = "Partidos") },
                                    label = { Text("Partidos", maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 11.sp) },
                                    selected = currentRoute == "match_hub",
                                    onClick = {
                                        navController.navigate("match_hub") {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                                NavigationBarItem(
                                    icon = { Icon(Icons.Filled.Face, contentDescription = "Chat") },
                                    label = { Text("Chat", maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 11.sp) },
                                    selected = currentRoute == "chat_screen",
                                    onClick = {
                                        navController.navigate("chat_screen") {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                                NavigationBarItem(
                                    icon = { Icon(Icons.Filled.Person, contentDescription = "Equipo") },
                                    label = { Text("Equipo", maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 11.sp) },
                                    selected = currentRoute == "roster_screen",
                                    onClick = {
                                        navController.navigate("roster_screen") {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                                NavigationBarItem(
                                    icon = { Icon(Icons.Filled.Home, contentDescription = "Perfil") },
                                    label = { Text("Perfil", maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 11.sp) },
                                    selected = currentRoute == "profile",
                                    onClick = {
                                        navController.navigate("profile") {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                                NavigationBarItem(
                                    icon = { Icon(Icons.Filled.MoreVert, contentDescription = "Más") },
                                    label = { Text("Más", maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 11.sp) },
                                    selected = currentRoute in listOf("more_screen", "treasury", "president_letter", "news_feed", "social_hub", "merchandising"),
                                    onClick = {
                                        navController.navigate("more_screen") {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    // Auto-login: if token is saved, skip login screen
                    val startDest = if (tokenManager.getToken() != null) "profile" else "login"

                    NavHost(
                        navController = navController, 
                        startDestination = startDest,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("login") {
                            LoginScreen(
                                onLoginSuccess = { role ->
                                    Toast.makeText(this@MainActivity, "Bienvenido! Rol: $role", Toast.LENGTH_SHORT).show()
                                    // If we came from a push notification, navigate there instead of default
                                    if (pendingNavigateTo != null) {
                                        navigateFromIntent(navController, role)
                                    } else {
                                        navController.navigate("profile") {
                                            popUpTo("login") { inclusive = true }
                                        }
                                    }
                                }
                            )
                        }
                        composable("match_hub") {
                            com.opomelilla.futbol.ui.matches.MatchHubScreen()
                        }
                        composable("chat_screen") {
                            com.opomelilla.futbol.ui.chat.ChatScreen()
                        }
                        composable("roster_screen") {
                            com.opomelilla.futbol.ui.roster.RosterScreen()
                        }
                        composable("profile") {
                            com.opomelilla.futbol.ui.profile.ProfileScreen()
                        }
                        composable("more_screen") {
                            com.opomelilla.futbol.ui.more.MoreScreen(
                                onNavigate = { route ->
                                    navController.navigate(route) {
                                        launchSingleTop = true
                                    }
                                }
                            )
                        }
                        composable("treasury") {
                            com.opomelilla.futbol.ui.finances.TreasuryScreen()
                        }
                        composable("president_letter") {
                            com.opomelilla.futbol.ui.president.PresidentLetterScreen()
                        }
                        composable("news_feed") {
                            com.opomelilla.futbol.ui.news.NewsScreen()
                        }
                        composable("social_hub") {
                            com.opomelilla.futbol.ui.social.SocialHubScreen()
                        }
                        composable("merchandising") {
                            com.opomelilla.futbol.ui.merchandising.MerchandisingScreen()
                        }
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        intent?.let {
            val navTo = it.getStringExtra("navigateTo")
            if (navTo != null) {
                pendingNavigateTo = navTo
            }
        }
    }

    private fun navigateFromIntent(navController: androidx.navigation.NavController, role: String? = null) {
        val dest = pendingNavigateTo
        
        // Clear pending intent data
        pendingNavigateTo = null

        if (dest == "profile") {
            navController.navigate("profile") {
                popUpTo("login") { inclusive = true }
            }
        } else if (dest == "treasury") {
            navController.navigate("treasury") {
                popUpTo("login") { inclusive = true }
            }
        } else {
             navController.navigate("profile") {
                popUpTo("login") { inclusive = true }
            }
        }
    }
}