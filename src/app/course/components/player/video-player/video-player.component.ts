import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  input,
  output,
  effect,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { v4 as uuidv4 } from 'uuid';

export interface VideoPlayerConfig {
  lessonId: number;
  videoUrl: string;
  videoType: 'embed' | 'upload';
  transcriptUrl?: string;
  startPosition?: number;
  autoplay?: boolean;
}

export interface VideoProgressData {
  currentPosition: number;
  duration: number;
  playbackSpeed: number;
  sessionId: string;
  pausedCount: number;
  seekedCount: number;
}

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

  config = input.required<VideoPlayerConfig>();
  progressUpdate = output<VideoProgressData>();

  private player?: Player;
  private sessionId = uuidv4();
  private pausedCount = 0;
  private seekedCount = 0;
  private progressInterval?: number;
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      const currentConfig = this.config();
      if (this.player && currentConfig) {
        this.updatePlayerSource(currentConfig);
      }
    });
  }

  ngOnInit(): void {
    this.initializePlayer();
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
  }

  private initializePlayer(): void {
    const config = this.config();

    const options: videojs.PlayerOptions = {
      controls: true,
      autoplay: config.autoplay || false,
      preload: 'auto',
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'remainingTimeDisplay',
          'playbackRateMenuButton',
          'subtitlesButton',
          'fullscreenToggle'
        ]
      }
    };

    this.player = videojs(this.videoElement.nativeElement, options);

    // Set video source
    this.updatePlayerSource(config);

    // Setup event listeners
    this.setupEventListeners();

    // Resume from saved position
    if (config.startPosition && config.startPosition > 0) {
      this.player.one('loadedmetadata', () => {
        this.player?.currentTime(config.startPosition!);
      });
    }

    // Start progress tracking
    this.startProgressTracking();
  }

  private updatePlayerSource(config: VideoPlayerConfig): void {
    if (!this.player) return;

    this.player.src({
      src: config.videoUrl,
      type: config.videoType === 'upload' ? 'video/mp4' : 'video/youtube'
    });

    // Add transcript if available
    if (config.transcriptUrl) {
      this.player.addRemoteTextTrack({
        kind: 'subtitles',
        src: config.transcriptUrl,
        srclang: 'en',
        label: 'English'
      }, false);
    }
  }

  private setupEventListeners(): void {
    if (!this.player) return;

    this.player.on('pause', () => {
      this.pausedCount++;
      this.emitProgress();
    });

    this.player.on('seeked', () => {
      this.seekedCount++;
      this.emitProgress();
    });

    this.player.on('ratechange', () => {
      this.emitProgress();
    });

    this.player.on('ended', () => {
      this.emitProgress();
    });
  }

  private startProgressTracking(): void {
    // Emit progress every 10 seconds
    this.progressInterval = window.setInterval(() => {
      if (this.player && !this.player.paused()) {
        this.emitProgress();
      }
    }, 10000);
  }

  private emitProgress(): void {
    if (!this.player) return;

    const progressData: VideoProgressData = {
      currentPosition: this.player.currentTime() || 0,
      duration: this.player.duration() || 0,
      playbackSpeed: this.player.playbackRate() || 1,
      sessionId: this.sessionId,
      pausedCount: this.pausedCount,
      seekedCount: this.seekedCount
    };

    this.progressUpdate.emit(progressData);
  }

  private destroyPlayer(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    if (this.player) {
      // Emit final progress before destroying
      this.emitProgress();
      this.player.dispose();
      this.player = undefined;
    }
  }

  play(): void {
    this.player?.play();
  }

  pause(): void {
    this.player?.pause();
  }

  getCurrentTime(): number {
    return this.player?.currentTime() || 0;
  }

  getDuration(): number {
    return this.player?.duration() || 0;
  }
}
