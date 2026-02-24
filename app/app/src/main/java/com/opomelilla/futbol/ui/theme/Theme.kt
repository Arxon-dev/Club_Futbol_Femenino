package com.opomelilla.futbol.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = ElitePrimary,
    secondary = EliteSecondary,
    tertiary = EliteAlert,
    background = EliteBackgroundDark,
    surface = EliteSurfaceDark,
    onPrimary = EliteTextPrimary,
    onSecondary = EliteTextPrimary,
    onTertiary = EliteTextPrimary,
    onBackground = EliteTextPrimary,
    onSurface = EliteTextPrimary
)

private val LightColorScheme = lightColorScheme(
    primary = ElitePrimaryLight,
    secondary = EliteSecondaryLight,
    tertiary = EliteAlert,
    background = EliteBackgroundLight,
    surface = EliteSurfaceLight,
    onPrimary = EliteTextPrimaryLight,
    onSecondary = EliteTextPrimaryLight,
    onTertiary = EliteTextPrimaryLight,
    onBackground = EliteTextPrimaryLight,
    onSurface = EliteTextPrimaryLight
)

@Composable
fun Club_Futbol_SalaTheme(
    darkTheme: Boolean = true, // We will default to dark mode for the premium feel, but respect param if passed
    // Dynamic color is available on Android 12+, disabled to keep brand colors intact.
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}