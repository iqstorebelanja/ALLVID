package com.example.ads

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

sealed class ActiveAdDialog {
    object None : ActiveAdDialog()
    data class AppOpen(val unitId: String) : ActiveAdDialog()
    data class Interstitial(val unitId: String, val reason: String) : ActiveAdDialog()
    data class Rewarded(
        val unitId: String,
        val rewardType: RewardType,
        val title: String,
        val description: String
    ) : ActiveAdDialog()
}

enum class RewardType {
    BATCH_DOWNLOAD_UNLOCK,
    QUALITY_4K_UNLOCK,
    EXTRA_DOWNLOAD_QUOTA
}

object AdConstants {
    const val TEST_APP_ID = "ca-app-pub-3940256099942544~3347511713"
    // REPLACE with your real BANNER ID: "ca-app-pub-XXXXXXXXXX/YYYYYYYYYY"
    const val TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111"
    // REPLACE with your real INTERSTITIAL ID: "ca-app-pub-XXXXXXXXXX/YYYYYYYYYY"
    const val TEST_INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712"
    // REPLACE with your real REWARDED ID: "ca-app-pub-XXXXXXXXXX/YYYYYYYYYY"
    const val TEST_REWARDED_ID = "ca-app-pub-3940256099942544/5224354917"
    // REPLACE with your real APP OPEN ID: "ca-app-pub-XXXXXXXXXX/YYYYYYYYYY"
    const val TEST_APP_OPEN_ID = "ca-app-pub-3940256099942544/9257395915"

    const val FREE_DAILY_DOWNLOADS_LIMIT = 3
    const val INTERSTITIAL_EVERY_N_DOWNLOADS = 2
}

class AdsManager {
    private val _activeAd = MutableStateFlow<ActiveAdDialog>(ActiveAdDialog.None)
    val activeAd: StateFlow<ActiveAdDialog> = _activeAd.asStateFlow()

    private val _dailyDownloadsCount = MutableStateFlow(0)
    val dailyDownloadsCount: StateFlow<Int> = _dailyDownloadsCount.asStateFlow()

    private val _totalSessionDownloads = MutableStateFlow(0)
    val totalSessionDownloads: StateFlow<Int> = _totalSessionDownloads.asStateFlow()

    private val _isBatchUnlocked = MutableStateFlow(false)
    val isBatchUnlocked: StateFlow<Boolean> = _isBatchUnlocked.asStateFlow()

    private val _is4KUnlocked = MutableStateFlow(false)
    val is4KUnlocked: StateFlow<Boolean> = _is4KUnlocked.asStateFlow()

    private val _isVipMode = MutableStateFlow(false)
    val isVipMode: StateFlow<Boolean> = _isVipMode.asStateFlow()

    private val _isBannerVisible = MutableStateFlow(true)
    val isBannerVisible: StateFlow<Boolean> = _isBannerVisible.asStateFlow()

    private var pendingRewardAction: (() -> Unit)? = null

    fun triggerAppOpenAd() {
        if (!_isVipMode.value) {
            _activeAd.value = ActiveAdDialog.AppOpen(AdConstants.TEST_APP_OPEN_ID)
        }
    }

    fun dismissAd() {
        _activeAd.value = ActiveAdDialog.None
        pendingRewardAction = null
    }

    fun showRewardedForBatch(onReward: () -> Unit) {
        if (_isVipMode.value || _isBatchUnlocked.value) {
            onReward()
            return
        }
        pendingRewardAction = onReward
        _activeAd.value = ActiveAdDialog.Rewarded(
            unitId = AdConstants.TEST_REWARDED_ID,
            rewardType = RewardType.BATCH_DOWNLOAD_UNLOCK,
            title = "Unlock Batch Downloader (10 URLs)",
            description = "Watch a quick sponsored video to unlock batch mode for 10 simultaneous links."
        )
    }

    fun showRewardedFor4K(onReward: () -> Unit) {
        if (_isVipMode.value || _is4KUnlocked.value) {
            onReward()
            return
        }
        pendingRewardAction = onReward
        _activeAd.value = ActiveAdDialog.Rewarded(
            unitId = AdConstants.TEST_REWARDED_ID,
            rewardType = RewardType.QUALITY_4K_UNLOCK,
            title = "Unlock 4K Ultra HD Export",
            description = "Watch a short ad to unlock 4K (2160p @ 60fps) crystal clear master downloads."
        )
    }

    fun showRewardedForExtraQuota(onReward: () -> Unit) {
        pendingRewardAction = onReward
        _activeAd.value = ActiveAdDialog.Rewarded(
            unitId = AdConstants.TEST_REWARDED_ID,
            rewardType = RewardType.EXTRA_DOWNLOAD_QUOTA,
            title = "Unlock +1 Free Download",
            description = "You reached the 3 free downloads/day limit. Watch an ad to continue downloading!"
        )
    }

    fun canUserDownload(): Boolean {
        if (_isVipMode.value) return true
        return _dailyDownloadsCount.value < AdConstants.FREE_DAILY_DOWNLOADS_LIMIT
    }

    fun recordDownloadCompleted(): Boolean {
        _dailyDownloadsCount.value += 1
        _totalSessionDownloads.value += 1

        if (_isVipMode.value) return false

        // Check if interstitial should trigger (after every 2 downloads)
        if (_totalSessionDownloads.value % AdConstants.INTERSTITIAL_EVERY_N_DOWNLOADS == 0) {
            _activeAd.value = ActiveAdDialog.Interstitial(
                unitId = AdConstants.TEST_INTERSTITIAL_ID,
                reason = "Download complete! (${_totalSessionDownloads.value} items downloaded)"
            )
            return true
        }
        return false
    }

    fun completeReward() {
        val currentAd = _activeAd.value
        if (currentAd is ActiveAdDialog.Rewarded) {
            when (currentAd.rewardType) {
                RewardType.BATCH_DOWNLOAD_UNLOCK -> _isBatchUnlocked.value = true
                RewardType.QUALITY_4K_UNLOCK -> _is4KUnlocked.value = true
                RewardType.EXTRA_DOWNLOAD_QUOTA -> {
                    // Reduce daily count to allow one more
                    if (_dailyDownloadsCount.value > 0) {
                        _dailyDownloadsCount.value -= 1
                    }
                }
            }
        }
        val action = pendingRewardAction
        _activeAd.value = ActiveAdDialog.None
        pendingRewardAction = null
        action?.invoke()
    }

    fun toggleVipMode() {
        _isVipMode.value = !_isVipMode.value
        if (_isVipMode.value) {
            _isBatchUnlocked.value = true
            _is4KUnlocked.value = true
        }
    }

    fun resetDailyQuota() {
        _dailyDownloadsCount.value = 0
    }

    fun toggleBanner(visible: Boolean) {
        _isBannerVisible.value = visible
    }
}
