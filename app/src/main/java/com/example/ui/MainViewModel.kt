package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ads.AdsManager
import com.example.ads.RewardType
import com.example.data.local.AppDatabase
import com.example.data.local.DownloadEntity
import com.example.data.model.BatchItem
import com.example.data.model.BatchStatus
import com.example.data.model.MediaDetails
import com.example.data.model.PlatformType
import com.example.data.model.QualityOption
import com.example.data.repository.DownloadRepository
import com.example.service.DownloaderEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val database = AppDatabase.getDatabase(application)
    private val repository = DownloadRepository(database.downloadDao())
    val downloaderEngine = DownloaderEngine(application, repository)
    val adsManager = AdsManager()

    // History Flow from Room
    val downloadHistory: StateFlow<List<DownloadEntity>> = repository.allDownloads
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Single Download States
    private val _urlInput = MutableStateFlow("")
    val urlInput: StateFlow<String> = _urlInput.asStateFlow()

    private val _detectedPlatform = MutableStateFlow(PlatformType.UNIVERSAL)
    val detectedPlatform: StateFlow<PlatformType> = _detectedPlatform.asStateFlow()

    private val _isAnalyzing = MutableStateFlow(false)
    val isAnalyzing: StateFlow<Boolean> = _isAnalyzing.asStateFlow()

    private val _currentMedia = MutableStateFlow<MediaDetails?>(null)
    val currentMedia: StateFlow<MediaDetails?> = _currentMedia.asStateFlow()

    private val _selectedQuality = MutableStateFlow(QualityOption.FHD_1080P)
    val selectedQuality: StateFlow<QualityOption> = _selectedQuality.asStateFlow()

    private val _isDownloading = MutableStateFlow(false)
    val isDownloading: StateFlow<Boolean> = _isDownloading.asStateFlow()

    private val _downloadProgress = MutableStateFlow(0f)
    val downloadProgress: StateFlow<Float> = _downloadProgress.asStateFlow()

    private val _statusNotification = MutableStateFlow<String?>(null)
    val statusNotification: StateFlow<String?> = _statusNotification.asStateFlow()

    // Batch Download States
    private val _isBatchMode = MutableStateFlow(false)
    val isBatchMode: StateFlow<Boolean> = _isBatchMode.asStateFlow()

    private val _batchText = MutableStateFlow("")
    val batchText: StateFlow<String> = _batchText.asStateFlow()

    private val _batchItems = MutableStateFlow<List<BatchItem>>(emptyList())
    val batchItems: StateFlow<List<BatchItem>> = _batchItems.asStateFlow()

    private val _isBatchDownloading = MutableStateFlow(false)
    val isBatchDownloading: StateFlow<Boolean> = _isBatchDownloading.asStateFlow()

    // Preview / Player Dialog
    private val _activePlayback = MutableStateFlow<DownloadEntity?>(null)
    val activePlayback: StateFlow<DownloadEntity?> = _activePlayback.asStateFlow()

    // Dev / Ad Settings Modal
    private val _isAdSettingsOpen = MutableStateFlow(false)
    val isAdSettingsOpen: StateFlow<Boolean> = _isAdSettingsOpen.asStateFlow()

    init {
        // Trigger App Open Ad on launch
        adsManager.triggerAppOpenAd()
    }

    fun onUrlChange(newUrl: String) {
        _urlInput.value = newUrl
        _detectedPlatform.value = PlatformType.detect(newUrl)
    }

    fun applySampleUrl(platform: PlatformType) {
        onUrlChange(platform.sampleUrl)
        analyzeUrl()
    }

    fun pasteFromClipboard(clipboardContent: String) {
        if (clipboardContent.isNotBlank()) {
            onUrlChange(clipboardContent)
            _statusNotification.value = "Pasted: ${PlatformType.detect(clipboardContent).displayName} link"
        }
    }

    fun clearUrl() {
        _urlInput.value = ""
        _detectedPlatform.value = PlatformType.UNIVERSAL
        _currentMedia.value = null
    }

    fun analyzeUrl() {
        val url = _urlInput.value.trim()
        if (url.isEmpty()) {
            _statusNotification.value = "Please enter or paste a valid link"
            return
        }

        viewModelScope.launch {
            _isAnalyzing.value = true
            try {
                val media = downloaderEngine.analyze(url)
                _currentMedia.value = media
                _detectedPlatform.value = media.platform
                _statusNotification.value = "Ready to export ${media.platform.displayName}"
            } catch (e: Exception) {
                _statusNotification.value = "Analysis error: ${e.localizedMessage}"
            } finally {
                _isAnalyzing.value = false
            }
        }
    }

    fun selectQuality(option: QualityOption) {
        if (option == QualityOption.UHD_4K && !adsManager.is4KUnlocked.value && !adsManager.isVipMode.value) {
            // Prompt rewarded ad to unlock 4K
            adsManager.showRewardedFor4K {
                _selectedQuality.value = QualityOption.UHD_4K
                _statusNotification.value = "4K Ultra HD Unlocked!"
            }
        } else {
            _selectedQuality.value = option
        }
    }

    fun startSingleDownload() {
        val media = _currentMedia.value ?: return

        // Check daily quota
        if (!adsManager.canUserDownload()) {
            adsManager.showRewardedForExtraQuota {
                executeDownload(media)
            }
            return
        }

        executeDownload(media)
    }

    private fun executeDownload(media: MediaDetails) {
        viewModelScope.launch {
            _isDownloading.value = true
            _downloadProgress.value = 0f
            try {
                val entity = downloaderEngine.download(
                    media = media,
                    quality = _selectedQuality.value,
                    onProgress = { progress ->
                        _downloadProgress.value = progress
                    }
                )
                _statusNotification.value = "Saved: ${entity.title.take(24)}..."

                // Check and trigger interstitial ad (every 2 downloads)
                adsManager.recordDownloadCompleted()
            } catch (e: Exception) {
                _statusNotification.value = "Download failed: ${e.localizedMessage}"
            } finally {
                _isDownloading.value = false
            }
        }
    }

    fun setBatchMode(active: Boolean) {
        if (active && !adsManager.isBatchUnlocked.value && !adsManager.isVipMode.value) {
            // Prompt Rewarded Ad to unlock batch mode
            adsManager.showRewardedForBatch {
                _isBatchMode.value = true
                _statusNotification.value = "Batch Download Mode Unlocked (10 URLs)!"
            }
        } else {
            _isBatchMode.value = active
        }
    }

    fun onBatchTextChange(text: String) {
        _batchText.value = text
        val lines = text.lines()
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .take(10) // Limit to 10 URLs

        _batchItems.value = lines.map { url ->
            BatchItem(
                id = UUID.randomUUID().toString().take(6),
                url = url,
                detectedPlatform = PlatformType.detect(url)
            )
        }
    }

    fun populateBatchSamples() {
        val sampleList = listOf(
            PlatformType.TIKTOK.sampleUrl,
            PlatformType.INSTAGRAM.sampleUrl,
            PlatformType.YOUTUBE_SHORTS.sampleUrl,
            PlatformType.X_TWITTER.sampleUrl,
            PlatformType.CAPCUT.sampleUrl
        )
        onBatchTextChange(sampleList.joinToString("\n"))
    }

    fun startBatchDownload() {
        val items = _batchItems.value
        if (items.isEmpty()) {
            _statusNotification.value = "Add at least 1 URL to start batch export"
            return
        }

        viewModelScope.launch {
            _isBatchDownloading.value = true
            val updatedList = items.toMutableList()

            for (index in updatedList.indices) {
                val item = updatedList[index]
                updatedList[index] = item.copy(status = BatchStatus.ANALYZING)
                _batchItems.value = updatedList.toList()

                try {
                    val media = downloaderEngine.analyze(item.url)
                    updatedList[index] = item.copy(
                        status = BatchStatus.DOWNLOADING,
                        downloadedTitle = media.title
                    )
                    _batchItems.value = updatedList.toList()

                    downloaderEngine.download(
                        media = media,
                        quality = QualityOption.FHD_1080P,
                        onProgress = { p ->
                            updatedList[index] = updatedList[index].copy(progress = p)
                            _batchItems.value = updatedList.toList()
                        }
                    )
                    updatedList[index] = updatedList[index].copy(
                        status = BatchStatus.COMPLETED,
                        progress = 1f
                    )
                    adsManager.recordDownloadCompleted()
                } catch (e: Exception) {
                    updatedList[index] = updatedList[index].copy(
                        status = BatchStatus.FAILED,
                        error = e.localizedMessage
                    )
                }
                _batchItems.value = updatedList.toList()
            }
            _isBatchDownloading.value = false
            _statusNotification.value = "Batch download finished (${items.size} items)"
        }
    }

    fun openPlayback(entity: DownloadEntity) {
        _activePlayback.value = entity
    }

    fun closePlayback() {
        _activePlayback.value = null
    }

    fun deleteHistoryItem(id: Long) {
        viewModelScope.launch {
            repository.deleteDownload(id)
            _statusNotification.value = "Item removed from history"
        }
    }

    fun clearAllHistory() {
        viewModelScope.launch {
            repository.clearHistory()
            _statusNotification.value = "History cleared"
        }
    }

    fun setAdSettingsOpen(open: Boolean) {
        _isAdSettingsOpen.value = open
    }

    fun dismissNotification() {
        _statusNotification.value = null
    }
}
