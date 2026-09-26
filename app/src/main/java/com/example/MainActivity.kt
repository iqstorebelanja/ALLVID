package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ads.ActiveAdDialog
import com.example.ads.AdConstants
import com.example.ui.MainViewModel
import com.example.ui.components.AdMobBannerSticky
import com.example.ui.components.AdSettingsDialog
import com.example.ui.components.AppOpenAdDialog
import com.example.ui.components.BatchDownloadSection
import com.example.ui.components.HeaderBar
import com.example.ui.components.HistorySection
import com.example.ui.components.InterstitialAdDialog
import com.example.ui.components.MediaPreviewCard
import com.example.ui.components.PlatformChipsRow
import com.example.ui.components.RewardedAdDialog
import com.example.ui.components.UrlInputSection
import com.example.ui.components.VideoPlayerPreviewDialog
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.NeonBlue
import com.example.ui.theme.SurfaceDark
import com.example.ui.theme.SurfaceElevated
import com.example.ui.theme.TextPrimary

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MainAppScreen()
            }
        }
    }
}

@Composable
fun MainAppScreen(
    viewModel: MainViewModel = viewModel()
) {
    val scrollState = rememberScrollState()

    // State flows
    val urlInput by viewModel.urlInput.collectAsStateWithLifecycle()
    val detectedPlatform by viewModel.detectedPlatform.collectAsStateWithLifecycle()
    val isAnalyzing by viewModel.isAnalyzing.collectAsStateWithLifecycle()
    val currentMedia by viewModel.currentMedia.collectAsStateWithLifecycle()
    val selectedQuality by viewModel.selectedQuality.collectAsStateWithLifecycle()
    val isDownloading by viewModel.isDownloading.collectAsStateWithLifecycle()
    val downloadProgress by viewModel.downloadProgress.collectAsStateWithLifecycle()
    val notification by viewModel.statusNotification.collectAsStateWithLifecycle()

    val isBatchMode by viewModel.isBatchMode.collectAsStateWithLifecycle()
    val batchText by viewModel.batchText.collectAsStateWithLifecycle()
    val batchItems by viewModel.batchItems.collectAsStateWithLifecycle()
    val isBatchDownloading by viewModel.isBatchDownloading.collectAsStateWithLifecycle()

    val downloadHistory by viewModel.downloadHistory.collectAsStateWithLifecycle()
    val activePlayback by viewModel.activePlayback.collectAsStateWithLifecycle()
    val isAdSettingsOpen by viewModel.isAdSettingsOpen.collectAsStateWithLifecycle()

    // Ads states
    val activeAd by viewModel.adsManager.activeAd.collectAsStateWithLifecycle()
    val isBatchUnlocked by viewModel.adsManager.isBatchUnlocked.collectAsStateWithLifecycle()
    val is4KUnlocked by viewModel.adsManager.is4KUnlocked.collectAsStateWithLifecycle()
    val isVip by viewModel.adsManager.isVipMode.collectAsStateWithLifecycle()
    val dailyCount by viewModel.adsManager.dailyDownloadsCount.collectAsStateWithLifecycle()
    val isBannerVisible by viewModel.adsManager.isBannerVisible.collectAsStateWithLifecycle()

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark),
        containerColor = BackgroundDark,
        bottomBar = {
            AdMobBannerSticky(
                isVisible = isBannerVisible,
                isVip = isVip,
                onDismiss = { viewModel.adsManager.toggleBanner(false) },
                modifier = Modifier.navigationBarsPadding()
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .statusBarsPadding()
        ) {
            // Header Bar
            HeaderBar(
                isVip = isVip,
                dailyDownloadsUsed = dailyCount,
                dailyLimit = AdConstants.FREE_DAILY_DOWNLOADS_LIMIT,
                isBatchMode = isBatchMode,
                isBatchUnlocked = isBatchUnlocked,
                onToggleBatchMode = { viewModel.setBatchMode(!isBatchMode) },
                onOpenAdSettings = { viewModel.setAdSettingsOpen(true) }
            )

            // Scrollable Content
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .verticalScroll(scrollState)
            ) {
                Spacer(modifier = Modifier.height(10.dp))

                // Supported Platforms Carousel (20+ platforms)
                PlatformChipsRow(
                    selectedPlatform = detectedPlatform,
                    onPlatformSelected = { platform ->
                        viewModel.applySampleUrl(platform)
                    }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Mode Display: Single URL Downloader vs Batch Downloader
                if (isBatchMode) {
                    BatchDownloadSection(
                        isBatchUnlocked = isBatchUnlocked,
                        isVip = isVip,
                        batchText = batchText,
                        onBatchTextChange = { viewModel.onBatchTextChange(it) },
                        batchItems = batchItems,
                        isBatchDownloading = isBatchDownloading,
                        onUnlockBatchWithAd = {
                            viewModel.adsManager.showRewardedForBatch {
                                viewModel.setBatchMode(true)
                            }
                        },
                        onPopulateSamples = { viewModel.populateBatchSamples() },
                        onStartBatchDownload = { viewModel.startBatchDownload() }
                    )
                } else {
                    // Single URL Input Section
                    UrlInputSection(
                        url = urlInput,
                        onUrlChange = { viewModel.onUrlChange(it) },
                        detectedPlatform = detectedPlatform,
                        onAnalyze = { viewModel.analyzeUrl() },
                        onClear = { viewModel.clearUrl() },
                        onPasteFromClipboard = { viewModel.pasteFromClipboard(it) },
                        isAnalyzing = isAnalyzing
                    )

                    // Media Preview & Quality Card (Appears once analyzed)
                    if (currentMedia != null) {
                        Spacer(modifier = Modifier.height(14.dp))
                        MediaPreviewCard(
                            media = currentMedia!!,
                            selectedQuality = selectedQuality,
                            is4KUnlocked = is4KUnlocked,
                            isVip = isVip,
                            onSelectQuality = { viewModel.selectQuality(it) },
                            onStartDownload = { viewModel.startSingleDownload() },
                            isDownloading = isDownloading,
                            downloadProgress = downloadProgress
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // History Section (Room persistence)
                HistorySection(
                    history = downloadHistory,
                    onPlayItem = { viewModel.openPlayback(it) },
                    onDeleteItem = { viewModel.deleteHistoryItem(it) },
                    onClearAll = { viewModel.clearAllHistory() }
                )

                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }

    // Status Notification Banner
    AnimatedVisibility(
        visible = notification != null,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        if (notification != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                contentAlignment = Alignment.BottomCenter
            ) {
                Surface(
                    color = SurfaceElevated,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, NeonBlue.copy(alpha = 0.6f), RoundedCornerShape(12.dp))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = NeonBlue,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = notification ?: "",
                            color = TextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.weight(1f)
                        )
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Dismiss",
                            tint = TextPrimary,
                            modifier = Modifier
                                .size(16.dp)
                                .clickable { viewModel.dismissNotification() }
                        )
                    }
                }
            }
        }
    }

    // ==========================================
    // ADMOB FULL-SCREEN MODALS
    // ==========================================
    when (val ad = activeAd) {
        is ActiveAdDialog.AppOpen -> {
            AppOpenAdDialog(
                unitId = ad.unitId,
                onDismiss = { viewModel.adsManager.dismissAd() }
            )
        }
        is ActiveAdDialog.Interstitial -> {
            InterstitialAdDialog(
                unitId = ad.unitId,
                reason = ad.reason,
                onDismiss = { viewModel.adsManager.dismissAd() }
            )
        }
        is ActiveAdDialog.Rewarded -> {
            RewardedAdDialog(
                ad = ad,
                onRewardCompleted = { viewModel.adsManager.completeReward() },
                onDismiss = { viewModel.adsManager.dismissAd() }
            )
        }
        is ActiveAdDialog.None -> {}
    }

    // AdMob Dev & Monetization Settings Modal
    if (isAdSettingsOpen) {
        AdSettingsDialog(
            adsManager = viewModel.adsManager,
            isVip = isVip,
            dailyDownloadsUsed = dailyCount,
            isBatchUnlocked = isBatchUnlocked,
            is4KUnlocked = is4KUnlocked,
            onDismiss = { viewModel.setAdSettingsOpen(false) }
        )
    }

    // Media Player & Vault Item Preview
    if (activePlayback != null) {
        VideoPlayerPreviewDialog(
            item = activePlayback!!,
            onDismiss = { viewModel.closePlayback() }
        )
    }
}

// Retained for GreetingScreenshotTest compatibility
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(text = "Hello $name!", modifier = modifier)
}
